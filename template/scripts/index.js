/** Globals **/
// 
// newScript(name: string) 
//   @@ create a new scrtipt [name is optional]
// addGreeting(dialogfunction) [greeting is optional]
//   @@ create a greeting that is sent only once when a new user first connects to the bot
// getScript(name: string)
//   @@ get a previously created script

/** Script members **/
// newScript().dialog(dialogfunction)
// newScript().expect(intent_domain, intent_action, dialogfunction)
// newScript().

/** Dialog Function **/
// function()

addGreeting(function(user, response) {
  response.sendText('Welcome to echo-bot, I\'ll echo back what you say');
  response.sendText('I have some easter eggs too ;)');
})

newScript().expect.text(function(session, response, stop) {
  if (session.message.text === 'ping') {
    response.sendText('pong');
  } else {
    response.sendText(session.message.text);
  }
})