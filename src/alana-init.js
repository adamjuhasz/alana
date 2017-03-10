#!/usr/bin/env node

require('source-map-support').install();

var program = require('commander');
program
  .option('-f, --force', 'Overwrite any files in current directory')
  .parse(process.argv);

var _ = require('lodash');
var fs = require('fs');
var Path = require('path');

copyDir(__dirname+'/../template', process.cwd());

function newDir(name) {
  try {
    fs.mkdirSync(name);
  } catch(err) {
    // console.log(name+' directory already exists...');
  }
}

function copyDir(path, to) {
  var template = fs.readdirSync(path);
  template.forEach(function(file) {
    // console.log(path + Path.sep + file, to + Path.sep + file);
    const stat = fs.statSync(Path.join(path, file));
    if (stat.isDirectory()) {
      newDir(Path.join(to,file));
      copyDir(Path.join(path,file), Path.join(to,file));
    } else {
      try {
        const destFile = fs.statSync(Path.join(to, file));
        if (program.force) {
          throw new Error('Force');
        }
        console.error(Path.join(to, file) + ' already exists... skipping');
      } catch(err) {
        const f = fs.readFileSync(Path.join(path, file));
        fs.writeFileSync(Path.join(to, file), f);
      }
    }
  })
}