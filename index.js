#! /usr/bin/env node

const server = require('server');
const {render} = server.reply;
const portfinder = require('portfinder');
const dirTree = require('directory-tree');
const {getInstalledPathSync} = require('get-installed-path');

const root = getInstalledPathSync('code-cast');
const argv = require('minimist')(process.argv.slice(2));
const folder = argv['_'][0] || '.';
const port = argv['p'] || argv['port'] || 3000;

portfinder.basePort = port;
return portfinder.getPortPromise().then(freeport => listen(freeport));

function listen(port) {
    console.log(`code-cast will start on port ${port}...`);
    const tree = dirTree(folder);

    server({port: port, views: `${root}/views`}, ctx =>
        render('index.hbs', {tree: JSON.stringify(tree)}));

}
