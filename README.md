# Opinionated & Batteries-included chatbot framework for javascript
There are many chabots out there but why are they stuck in the desert of regexs?

Online IDE at https://alana.cloud

Framework documentation online at https://alana.tech or in [markdown](https://github.com/alana-bot/documentation)

## What's included
- **Built-in intents**, premade intents to understand user input [Open Source](https://github.com/alana/intents)
- **Scripting system**, simple but powerful
- **Testing** sophsitcated testing is a first class ssytem allowing you to easily refactor and verify
- **Multiple platforms** connectors availabel for many platforms (console, self-hosted web chat, facebook, etc...)

## Installation
```bash
$ npm install -g alana
```

## Usage
The best way to experience alana development is through the [online IDE](https://alana.cloud), however if you want to develop locally...
```bash
$ alana
# list all commands
$ alana help <command>
# print help about a specific command
```

#### Most useful commands
```bash
$ alana init    
# creates a basic template of an alana bot
$ alana run
# Run the bot locally
$ alana test
# Run all test scripts
```

## Trivia bot example
All demos available [here](https://github.com/alana/demo)

> The purpose of the bot will be allowing players to play a game of trivia, present them with questions about a specific topic and have them try to answer them correctly. We'll keep track of the players scores too.

TOC
- [Setup](#setup)
- [Greeting](#add-a-greeting)
- [Sending messages to the user](#add-a-basic-menu)
- [Scripting](#gameplay)
- [Intents](#recognizing-intent)
- [Complete example](#final-file)

#### Setup
First lets create a new bot and play with the echo template
```bash
$ alana init  
$ ls
# -- scripts will hold you chat scripts
# -- tests will hold your test scripts
$ alana test
$ alana run
# ^-c (ctrl-c) to qit
```
Now it's time to make the bot play some trivia!
Open `scripts/index.js` and delete all the template code
Let's add some trivia knowledge to the top of the 
```javascript
const trivia = {
  'history': [                                            // this is a trivia topic
    { q: 'Question 1',                                    // this is the question we will ask the user
      w: ['a2', 'a3', 'a4'],                              // these are wrong answers
      c: 'a1',                                            // this is the correct answer
     },
     { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
     { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
   ],
   'sports': [
    { q: 'Question 1', w: ['a2', 'a3', 'a4'], c: 'a1' },
    { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
    { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
   ],
};
```
#### Add a greeting
Let's add a greeting (text that is sent once (and only once) to a new user when they first connect to the bot. Add the following code to the bottom of the file.
```javascript
addGreeting((user, response) => {
  response.sendText('Welcome to trivia time!');
  user.score = 0;                                 //set the user's score to 0
});
// after the greeting is sent the default script will be called
```
As a good software engineer, lets add a test to make sure the greeting is sent to users. Open `test/index.js`. Erase all the tests and add the following code:
```javascript
test('greeting', function(){
  return newTest()                               // we need to return the test promise
    .expectText('Welcome to trivia time!')       // this is the greeting text we expect
    .run();                                      // we need to call run() at the end of the test
})
```
Now run the test:
```bash
$ alana test
  ✓  greeting
  1 passing
```
#### Add a basic menu
We need to let the user pick a trivie topic! So let's make a _default_ script that will handle that. Add the following code to `scripts/index.js`.
```javascript
newScript()                                          // create a default script
  .dialog('start', (session, response, stop) => {
    response.sendText('Pick a trivia topic');
    const topics = Object.keys(trivia).join(' or ');
    response.sendText(topics);
  })
  .expect.text((session, response, stop) => {        // this will only be called if the user responds with a text message
    const userInput = session.message.text;          // text of the user's message
    response.startScript(userInput);                 // switch to a new script that has the title of the user's text
  });
```
Now another test in `tests/index.js`for the menu at the bottom of the file.
```javascript
test('menu', function() {
  newTest()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .run();
})
```
Now run the test:
```bash
$ alana test
  ✓  greeting
  ✓  menu
  2 passing
```
#### Gameplay
To support actually playing the game we'll have to ask the user a question and give them some answers to choose from. With alana we can have named scripts that can be called from other scripts. So we'll make a new script for each topic. Each script is divided into *dialogs*. There are some special dialogs like begin, expect.
```javascript
Object.keys(trivia).forEach((topic) => {                             // iterate through each topic
  newScript(topic)                                                   // a new script with the topic name
    /* 
     * begin dialogs are like greetings for scripts, they are only sent once
     */
    .begin((session, response, stop) => { 
      response.sendText(`Time to test you on ${topic}!`);
      session.user.question_number = 0;                              // Reset what question the user is on
    })
    /* 
     * If the dialog doesn't call stop() then the script will automatically flow 
     * to the next dialog. We can also use named dialogs to move around a script
     * we'll use this later to loop around the questions
     */
    .dialog('start', (session, response, stop) => {
      const question = trivia[topic][session.user.question_number];
      response
        .sendText(question.q)
        .sendText('Is it:');                                         //notice how you can chain responses (but don't have to!)
      response.sendText(question.w.concat(question.c).join(' or ')); //exercise for the reader to shuffle these!
    })
    /* 
     * The script will stop here because the next dialog is an expect dialog, which tells
     * alana to wait for input from the user. We can even specialize the expect to only 
     * response to a text message.
     */
    .expect.text((session, response, stop) => {
      const question = trivia[topic][session.user.question_number];
      if (session.message.text === question.c) {
        response.sendText('Correct!');
        session.user.score++;
      } else {
        response.sendText(`Wrong :( it was ${question.c}`);
        session.user.score = Math.max(0, session.user.score - 1);
      }
      response.sendText(`Your score is ${session.user.score}`);
      session.user.question_number++;
      if (session.user.question_number < trivia[topic].length) {
        // we still have questions, ask the next one by looping back to the 
        // 'start' dialog
        response.goto('start')
       }
    });
    /* 
     * At the end of script, alana will automatically move the user to the default
     * script, usually the main menu
     */
});
```
Now let's add a test for gameplay in `tests/index.js`
```javascript
test('gameplay', function() {
  return newTest()
    .checkForTrailingDialogs()                  // this checks if any extra text was send after the test ended
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .sendText('history')
    .expectText('Time to test you on history!')
    .expectText('Question 1')
    .run();
})
```
Now run the test:
```bash
$ alana test
  ✓  greeting
  ✓  menu
  1)  gameplay
  2 passing
  1 failing
  1)  gameplay:
  Error: Got an extra message: { type: 'text', text: 'Is it:' }
```
Oh no, our test wasn't complete, let's add the missing text to the test and try again
```javascript
test('gameplay', function() {
  return newTest()
    .checkForTrailingDialogs()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .sendText('history')
    .expectText('Time to test you on history!')
    .expectText('Question 1')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .run();
})
```
```bash
$ alana test
  ✓  greeting
  ✓  menu
  ✓  gameplay
  3 passing
```
#### Recognizing intent
What if the user is confused and needs instructions? Let's recognize the help intent. Add the following code between `.begin(...)` and `.dialog(...)` in `scripts\index.js`
```javascript
// scripts/index.js
//newScript(topic)
//.begin(...)
.intent.always('general', 'help', (session, response) => {  // recognize the help action in the general domain
  response.sendText(`You are in the ${topic} section`);     // send something helpful
  response.goto('start');                                   // ask the current question again
})
//.dialog('start', ...)
```
```javascript
// tests/index.js
test('intent', function() {
  return newTest()
    .checkForTrailingDialogs()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .sendText('history')
    .expectText('Time to test you on history!')
    .expectText('Question 1')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .sendText('a1')
    .expectText('Correct!')
    .expectText('Your score is 1')
    .expectText('Question 2')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .sendText('help')
    .expectText('You are in the history section')
    .expectText('Question 2')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .run();
})
```
#### Play it yourself
```bash
$ alana run --console
```
#### Final file
```javascript
/** scripts/index.js **/
const trivia = {
  'history': [ // this is a trivia topic
    { q: 'Question 1', // this is the question we will ask the user
      w: ['a2', 'a3', 'a4'], // these are wrong answers
      c: 'a1', // this is the correct answer
     },
     { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
     { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
   ],
   'sports': [
    { q: 'Question 1', w: ['a2', 'a3', 'a4'], c: 'a1' },
    { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
    { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
   ],
};

addGreeting((user, response) => {
  response.sendText('Welcome to trivia time!');
  user.score = 0; //set the user's score to 0
});
// after the greeting is sent the default script will be called

newScript() // 
  .dialog('start', (session, response, stop) => {
    response.sendText('Pick a trivia topic');
    const topics = Object.keys(trivia).join(' or ');
    response.sendText(topics);
  })
  .expect.text((session, response, stop) => {
    response.startScript(session.message.text);
  });

Object.keys(trivia).forEach((topic) => { // iterate through each topic
  newScript(topic) // a new script with the topic name
    .begin((session, response, stop) => { 
      response.sendText(`Time to test you on ${topic}!`);
      session.user.question_number = 0; // Reset what question the user is on
    })
    .intent.always('general', 'help', (session, response) => {
      response.sendText(`You are in the ${topic} section`);
      response.goto('start');
    })
    .dialog('start', (session, response, stop) => {
      const question = trivia[topic][session.user.question_number];
      response
        .sendText(question.q)  
        .sendText('Is it:');
      response.sendText(question.w.concat(question.c).join(' or ')); //exercise for the reader to shuffle these!
    })
    .expect.text((session, response, stop) => {
      const question = trivia[topic][session.user.question_number];
      if (session.message.text === question.c) {
        response.sendText('Correct!');
        session.user.score++;
      } else {
        response.sendText(`Wrong :( it was ${question.c}`);
        session.user.score = Math.max(0, session.user.score - 1);
      }
      response.sendText(`Your score is ${session.user.score}`);
      session.user.question_number++;
      if (session.user.question_number < trivia[topic].length) {
        // we still have questions, ask the next one
        response.goto('start');
       }
    });
});
```
```javascript
/** tests/index.js **/
test('greeting', function(){
  return newTest()
    .expectText('Welcome to trivia time!')
    .run();
})

test('menu', function(){
  return newTest()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .run();
})

test('gameplay', function() {
  return newTest()
    .checkForTrailingDialogs()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .sendText('history')
    .expectText('Time to test you on history!')
    .expectText('Question 1')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .run();
})

test('intent', function() {
  return newTest()
    .checkForTrailingDialogs()
    .expectText('Welcome to trivia time!')
    .expectText('Pick a trivia topic')
    .expectText('history or sports')
    .sendText('history')
    .expectText('Time to test you on history!')
    .expectText('Question 1')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .sendText('a1')
    .expectText('Correct!')
    .expectText('Your score is 1')
    .expectText('Question 2')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .sendText('help')
    .expectText('You are in the history section')
    .expectText('Question 2')
    .expectText('Is it:')
    .expectText('a2 or a3 or a4 or a1')
    .run();
})
```
