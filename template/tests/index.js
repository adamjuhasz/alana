/** Globals **/
// 
// newTest(userId?: string)
//    Creates a new test with a specific user [optional], if no user
//    is specified then a random one is created.
// 
// test(name: string, function: () => Promise<void>)
// 
// 
/** Test abilities **/
//
// See https://www.alana.tech for deeper documentation
// expectText(...)
// sendText(...)
// expectButtons(...)
// sendButtonClick(...)

test('echo', function(){
  return newTest()  // must return the test
    .sendText('hi')
    .expectText('hi')
    .sendText('alana')
    .expectText('alana')
    .run() // must call run() to signify end of tests
});

test('ping pong', function(){
  return newTest()
    .sendText('ping')
    .expectText('pong')
    .run();
});