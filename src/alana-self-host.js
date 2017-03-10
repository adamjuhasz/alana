#!/usr/bin/env node

require('source-map-support').install();

var program = require('commander');
program
  .parse(process.argv);

var _ = require('lodash');
var fs = require('fs');
var Path = require('path');
const spawn = require('child_process').spawn;

try {
  const destFile = fs.statSync(Path.join(process.cwd(), 'package.json'));
} catch(err) {
  console.log('missing package.json... copying template');
  const f = fs.readFileSync(Path.join(__dirname, '..', 'self-host', 'package.json'));
  fs.writeFileSync(Path.join(process.cwd(), 'package.json'), f);
}

var dontInstall = ['commander', 'lodash', 'mocha', 'source-map-support', 'bluebird', 'request', 'request-promise'];
const packages = _.difference(_.keys(require(Path.join(__dirname, '..', 'package.json')).dependencies), dontInstall);
const args = ['i', '--save'].concat(packages);

console.log('Installing', packages.join(', '))
const npm = spawn('npm', args);
npm.stdout.on('data', (data) => {
  console.log(`${data}`);
});

npm.stderr.on('data', (data) => {
  console.error(`${data}`);
});

npm.on('close', (code) => {
  console.log(`npm exited with code ${code}`);
});
