'use strict';

// A simple test to verify a visible window is opened with a title
var Application = require('spectron').Application
var assert = require('assert')

let app;

before(function() {
  this.timeout(10000)

  app = new Application({
    path: 'node_modules/.bin/electron',
    args: ['.'],
    env: { ANSEL_TEST_MODE: 1 }
  })
  return app.start()
})


after(function () {
  if (app && app.isRunning()) {
    return app.stop()
  }
});

describe('application launch', function () {

  it('shows an initial window', function () {
    return app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })

  it('should display test mode as title', function() {
    return app.client.getTitle().then(function(title) {
      assert.equal(title, 'Ansel - TEST MODE');
    });
  })

  it('should be running in test mode', function() {
    return app.mainProcess.env().then(function(env) {
      assert.equal(env.ANSEL_TEST_MODE, true);
    });
  });
})
