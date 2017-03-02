#!/usr/bin/env node

require('source-map-support').install();

var program = require('commander');
program
  .option('-c, --console', 'Run in console')
  .option('-w, --web', 'Run in console')
  .parse(process.argv);

if (program.rawArgs.length === 2) {
  program.web = true;
}

var Alana = require('alana-core');
var Request = require('request-promise');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

global._ = _;
global.messageType  = Alana.MessageTypes;

const theBot = new Alana.default();
global.bot = theBot;
global.request = Request;
global.addGreeting = theBot.addGreeting.bind(theBot);
global.newScript = theBot.newScript.bind(theBot);
global.getScript = theBot.getScript.bind(theBot);

theBot.turnOnDebug();

function extension(element) {
  var extName = path.extname(element);
  return extName === '.js';
};
var listing = fs.readdirSync('./scripts');
listing
  .filter(extension)
  .map(file => `${process.cwd()}/scripts/${file}`)
  .forEach(file => {
    require(file);
  });

if (program.console) {
  var Shell = require('alana-platform-console').default;
  var shellInput = new Shell(bot);
  bot.addPlatform(shellInput);
}

if (program.web) {
  var Web = require('alana-platform-web').default;
  var web = new Web(bot);
  bot.addPlatform(web);
}

bot.start();
