var Alana = require('@alana/core');
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

// theBot.turnOnDebug();

function extension(element) {
  var extName = path.extname(element);
  return extName === '.js';
};
var listing = fs.readdirSync('./scripts');
listing
  .filter(extension)
  .map(file => path.join(process.cwd(),'scripts', file))
  .forEach(file => {
    require(file);
  });

var Shell = require('@alana/platform-console').default;
var shellInput = new Shell(bot);

var Web = require('@alana/platform-web').default;
var web = new Web(bot);

bot.start();