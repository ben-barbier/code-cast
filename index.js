#! /usr/bin/env node

const server = require('server');
const {render} = server.reply;
const portfinder = require('portfinder');
const dirTree = require('directory-tree');
const {getInstalledPathSync} = require('get-installed-path');
const colors = require('colors');
const opener = require('opener');
const ifaces = require('os').networkInterfaces();

const root = getInstalledPathSync('code-cast');
const argv = require('minimist')(process.argv.slice(2));
const path = argv['_'][0] || '.';
const port = argv['p'] || argv['port'] || 3000;
const help = argv['h'] || argv['help'] || false;

if (help) {
    console.log([
        'usage: code-cast [path] [options]',
        '',
        'options:',
        '  -p --port    Port to use [3000]',
        '  -o           Open browser window after starting the server',
        '',
        '  -h --help    Print this list and exit.'
    ].join('\n'));
    process.exit();
}

portfinder.basePort = port;
portfinder.getPortPromise().then(freeport => listen(path, freeport, root));

function listen(path, port, root) {

    const tree = dirTree(path);
    const origins = getOrigins(port);
    displayStartingMessage(path, origins);
    openBrowserWindowIfActivated();

    server({port: port, views: `${root}/views`, public: root}, ctx => {
        return render('index.hbs', {tree: JSON.stringify(tree), path});
    });

}

function getOrigins(port) {
    const origins = [];
    Object.keys(ifaces).forEach(function (dev) {
        ifaces[dev].forEach(function (details) {
            if (details.family === 'IPv4') {
                origins.push(`http://${details.address}:${port}`.green);
            }
        });
    });
    return origins;
}

function displayStartingMessage(path, origins) {
    console.log('Starting up code-cast, serving '.yellow + path.green);
    console.log(`Available on:`.yellow);
    origins.forEach(origin => console.log(`  ${origin}`));
    console.log(`Hit CTRL-C to stop the server`);
}

function openBrowserWindowIfActivated() {
    if (argv['o']) {
        opener('http://127.0.0.1:' + port);
    }
}

process.on('SIGINT', exit);
process.on('SIGTERM', exit);

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', function () {
        process.emit('SIGINT');
    });
}

function exit() {
    console.log('\r\ncode-cast stopped.'.red);
    process.exit();
}
