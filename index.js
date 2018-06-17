#! /usr/bin/env node

const server = require('server');
const {render} = server.reply;
const portfinder = require('portfinder');
const dirTree = require('directory-tree');
const {getInstalledPathSync} = require('get-installed-path');
const colors = require('colors');

const root = getInstalledPathSync('code-cast');
const argv = require('minimist')(process.argv.slice(2));
const path = argv['_'][0] || '.';
const port = argv['p'] || argv['port'] || 3000;

portfinder.basePort = port;
portfinder.getPortPromise().then(freeport => listen(path, freeport, root));

function listen(path, port, root) {

    const tree = dirTree(path);
    displayStartingMessage(path, port);

    server({port: port, views: `${root}/views`}, ctx => {
        return render('index.hbs', {tree: JSON.stringify(tree)});
    });

}

function displayStartingMessage(path, port) {
    console.log('Starting up code-cast, serving '.yellow + path.green);
    console.log(`Available on:`.yellow);
    console.log(`  http://127.0.0.1:${port}`);
    console.log(`Hit CTRL-C to stop the server`);
}

