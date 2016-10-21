'use strict';

// A simple test to verify a visible window is opened with a title
const Application = require('spectron').Application
const assert = require('assert')
const fs = require('fs');
const rimraf = require('rimraf');

const testsPath = '/tmp/ansel-tests';

if (!fs.existsSync(testsPath))
  fs.mkdirSync(testsPath);

if (!fs.existsSync(`${testsPath}/dot-ansel`))
  fs.mkdirSync(`${testsPath}/dot-ansel`);

if (!fs.existsSync(`${testsPath}/versions`))
  fs.mkdirSync(`${testsPath}/versions`);

var knex = require('knex')({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: `${testsPath}/dot-ansel/db.sqlite3`
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: `${__dirname}/../migrations`
  }
});

const settings = {
  directories: {
    photos: `${__dirname}/photos`,
    versions: `${testsPath}/versions`
  }
};

describe('application launch', function () {
  this.timeout(200000);

  before(function() {
    fs.writeFileSync(`${testsPath}/dot-ansel/settings.json`, JSON.stringify(settings));

    this.app = new Application({
      path: `${__dirname}/../node_modules/.bin/electron`,
      args: [`${__dirname}/../.`],
      env: { ANSEL_TEST_MODE: 1 }
    });

    // Since we're populating manually the settings.json
    // we need to run the migration manually
    return knex.migrate.latest()
      .finally(() => {
        return knex.destroy();
      })
      .then(() => {
        return this.app.start();
      })
      .then(() => {
        return this.app.client.getMainProcessLogs()
      })
      .then(function (logs) {
        logs.forEach(function (log) {
          console.log(log)
        })
      })
      .catch((err) => {
        console.log('err', err);
      });
  })

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

  after(function (done) {
    if (this.app && this.app.isRunning()) {
      this.app.stop()
        .then(() => {
          return knex.destroy();
        })
        .then(() => {
          rimraf(testsPath, done);
        });
    }
  });
});
