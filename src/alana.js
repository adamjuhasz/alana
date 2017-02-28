#!/usr/bin/env node
var program = require('commander');

program
  .command('run', '[WIP] start the bot locally')
  .command('test', 'run tests')
  .command('upload', '[WIP] upload local files to alana.cloud')
  .command('init', '[WIP] create a new alana bot')
  .parse(process.argv);
