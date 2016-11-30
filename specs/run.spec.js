'use strict';

const assert = require('assert')

const App = require('./app');
let app = new App();

describe('application launch', function () {
  this.timeout(200000);

  before(app.start);

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })

  it('should display test mode as title', function() {
    return this.app.client.getTitle().then(function(title) {
      assert.equal(title, 'Ansel - TEST MODE');
    });
  })

  it('should be running in test mode', function() {
    return this.app.mainProcess.env().then(function(env) {
      assert.equal(env.ANSEL_TEST_MODE, true);
    });
  });

  it('should start the import', function() {
    return this.app.client.waitForExist('#start-scanning')
      .then(() => this.app.client.click('#start-scanning'));
  });

  it('should wait for the import to finish', function() {
    return this.app.client.waitForExist('#library', 10000);
  });

  it('should show a particular photo', function() {
    return this.app.client.doubleClick('a.picture')
      .then(() => this.app.client.waitForExist('.picture-detail img'));
  });

  it('should go back to the library view', function() {
    return this.app.client.keys('esc');
  });

  after(app.stop);
});
