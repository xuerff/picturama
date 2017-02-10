import fs from 'fs';

let dotAnsel = `${process.env.HOME}/.ansel`;
let migrationsFolder = `${process.resourcesPath}/app/migrations`;
let anselFolder = `${process.resourcesPath}/app`;

if (process.env.ANSEL_DEV_MODE) {
  dotAnsel = `${process.env.PWD}/dot-ansel`;
  migrationsFolder = `${process.env.PWD}/migrations`;
  anselFolder = `${process.env.PWD}`;
}

if (process.env.ANSEL_TEST_MODE) {
  const testsPath = '/tmp/ansel-tests';

  if (!fs.existsSync(testsPath))
    fs.mkdirSync(testsPath);

  dotAnsel = `${testsPath}/dot-ansel`;
  migrationsFolder = `${process.env.PWD}/migrations`;
}

export default {
  characters: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè',
  acceptedRawFormats: [ 'raf', 'cr2', 'arw', 'dng' ],
  acceptedImgFormats: [ 'png', 'jpg', 'jpeg', 'tif', 'tiff' ],
  watchedFormats: /([\$\#\w\d]+)-([\$\#\w\dèé]+)-(\d+)\.(JPEG|JPG|PNG|PPM)/i,
  exportFormats: [ 'jpg', 'png' ],
  workExt: 'webp',
  dotAnsel,
  menusFolder: `${anselFolder}/menus`,
  keymapsFolder: `${anselFolder}/keymaps`,
  dbFile: `${dotAnsel}/db.sqlite3`,
  settings: `${dotAnsel}/settings.json`,
  thumbsPath: `${dotAnsel}/thumbs`,
  thumbs250Path: `${dotAnsel}/thumbs-250`,
  tmp: '/tmp/ansel',
  concurrency: 3,

  knex: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: `${dotAnsel}/db.sqlite3`
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: migrationsFolder
    }
  }
};
