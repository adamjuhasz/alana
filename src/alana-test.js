#!/usr/bin/env node
require('source-map-support').install();
var Alana = require('@alana/core');
var Request = require('request-promise');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Mocha = require('mocha');
var Promise = require('bluebird');
var program = require('commander');

program
  .parse(process.argv);

Promise.config({
  // Enable long stack traces
  longStackTraces: true,
  // Enable cancellation
  cancellation: true,
  // Enable monitoring
  monitoring: true,
  warnings: {
    wForgottenReturn: false
  }
});

global._ = _;
global.messageType  = Alana.MessageTypes;

const theBot = new Alana.default();
global.bot = theBot;
global.request = Request;
global.addGreeting = theBot.addGreeting.bind(theBot);
global.newScript = theBot.newScript.bind(theBot);
global.getScript = theBot.getScript.bind(theBot);
global.Promise = Promise;

// theBot.turnOnDebug();

function extension(element) {
  var extName = path.extname(element);
  return extName === '.js';
};
var listing = fs.readdirSync('./scripts');
listing
  .filter(extension)
  .map(file => `${process.cwd()}/scripts/${file}`)
  .forEach(file => {
    console.log(`Loading ${file}...`);
    require(file);
  });

var tester = new Alana.TestPlatform(bot);
global.newTest = tester.newTest.bind(tester);
bot.addPlatform(tester);

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.error(err);
    console.log('one of the scripts failed')
})

bot.start();

var mocha = new Mocha();
fs.readdirSync('./tests')
  .filter(extension)
  .map(file => './tests/'+file)
  .forEach(file => {
    mocha.addFile(file);
  });

mocha.reporter('list').ui('qunit').run();
