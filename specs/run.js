// A simple test to verify a visible window is opened with a title
var Application = require('spectron').Application
var assert = require('assert')

var app = new Application({
  path: 'node_modules/.bin/electron',
  args: ['.'],
  env: { ANSEL_TEST_MODE: 1 }
  //env: { ANSEL_TEST_MODE: 1, ANSEL_DEV_MODE: 0 }
})

app.start().then(function () {
  // Check if the window is visible
  return app.browserWindow.isVisible()
}).then(function (isVisible) {
  // Verify the window is visible
  assert.equal(isVisible, true)
}).then(function () {
  // Get the window's title
  return app.client.getTitle()
}).then(function (title) {
  // Verify the window's title
  assert.equal(title, 'Ansel - TEST MODE');

  return app.mainProcess.env();
}).then(function (env) {
  console.log('TEST ENV', env.ANSEL_TEST_MODE, (env.ANSEL_TEST_MODE == true));
  assert.equal(env.ANSEL_TEST_MODE, true);

}).then(function () {
  // Fill the settings
}).then(function () {
  // Stop the application
  return app.stop()
}).catch(function (error) {
  // Log any failures
  console.error('Test failed', error.message)
})
