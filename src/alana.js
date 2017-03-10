#!/usr/bin/env node
var program = require('commander');

program
  .command('run', 'start the bot locally')
  .command('test', 'run tests')
  .command('upload', '[WIP] upload local files to alana.cloud')
  .command('init', 'create a new alana bot in the current directory')
  .command('self-host', '[WIP] set up bot for self hosting')
  .parse(process.argv);
