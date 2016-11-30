'use strict';

const Application = require('spectron').Application
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

class App {
  construtor() {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.app = {};
  }

  start() {
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
  }

  stop(done) {
    if (this.app && this.app.isRunning()) {
      this.app.stop()
        .then(() => {
          return knex.destroy();
        })
        .then(() => {
          rimraf(testsPath, done);
        });
    }
  }
}

module.exports = App;
