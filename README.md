# Ansel

![](ansel.jpg)

## Introduction

...

## Features

- [x] Scan for local files
- [x] Non destructive editing
- [x] Before & after diff view
- [x] Browse by dates
- [ ] Tags
- [ ] Collections
- [ ] Import window
- [x] Flag
- [ ] Delete photo(s)
- [ ] File versioning
- [x] Export to external editor
- [ ] Export

## Install

Don't need USB support on Linux? Check out the [master Branch](https://github.com/til-schneider/ansel/tree/master).

As of today, only **Ubuntu 14.04 & 16.04 LTS** 64-bits are supported.

In order to be able to run with USB support on Linux, ansel requires the following libraries:

```bash
sudo apt-get install zlib1g-dev libudev-dev
```

Build and run Ansel:

```bash
cd path/to/ansel
npm install
npm start
```

## Supported cameras

- [x] Fuji X100
- [x] Fuji X100S
- [x] Fuji X100T
- [x] Canon 5D Mark I
- [ ] Canon EOS 700D

## Develop

See [DEVELOP.md](DEVELOP.md) for details about how to develop Ansel.

## Technologies & libraries

### Core

- [Electron.js](http://electron.atom.io/)
- [React](https://facebook.github.io/react/) / [Redux](http://redux.js.org/)
- [Sharp](http://sharp.dimens.io)
- [SQLite](https://www.sqlite.org) - [node bindings](https://github.com/mapbox/node-sqlite3)
- [Bookshelf.js](http://bookshelfjs.org/) / [Knex.js](http://knexjs.org/)
- [Bluebird.js](http://bluebirdjs.com/)
- [Chokidar](https://github.com/paulmillr/chokidar)
- [Libraw](http://www.libraw.org/) - [node bindings](https://github.com/m0g/node-libraw)
- [Moment.js](http://momentjs.com/)
- [Font Awesome](http://fontawesome.io/)

### Testing, building & transpiling

- [TypeScript](https://www.typescriptlang.org/)
- [Spectron](http://electron.atom.io/spectron/)
- [Gulp](http://gulpjs.com/)
- [Mocha](http://mochajs.org/)
- [Electron-packager](https://github.com/electron-userland/electron-packager)
- [Less](http://lesscss.org/)
- [Eslint](http://eslint.org/)