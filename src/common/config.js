import * as fs from 'fs'
import * as os from 'os'

let dotAnsel = `${process.env.HOME}/.ansel`;
let migrationsFolder = `${process.resourcesPath}/app/migrations`;
let anselFolder = `${process.resourcesPath}/app`;

if (process.env.ANSEL_DEV_MODE) {
  dotAnsel = `${process.env.INIT_CWD}/dot-ansel`;
  migrationsFolder = `${process.env.INIT_CWD}/migrations`;
  anselFolder = `${process.env.INIT_CWD}`;
}

if (process.env.ANSEL_TEST_MODE) {
  const testsPath = '/tmp/ansel-tests';

  if (!fs.existsSync(testsPath))
    fs.mkdirSync(testsPath);

  dotAnsel = `${testsPath}/dot-ansel`;
  migrationsFolder = `${process.env.INIT_CWD}/migrations`;
}

const menusFolder = `${anselFolder}/menus`;
const platform = os.platform();

export default {
  platform,
  characters: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè',
  acceptedRawFormats: [ 'raf', 'cr2', 'arw', 'dng' ],
  acceptedImgFormats: [ 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp' ],
  watchedFormats: /([$#\w\d]+)-([$#\w\dèé]+)-(\d+)\.(JPEG|JPG|PNG|PPM|TIFF|WEBP)/i,
  exportFormats: [ 'jpg', 'png', 'webp' ],
  workExt: 'webp',
  dotAnsel,
  menusFolder,
  keymapsFolder: `${anselFolder}/keymaps`,
  menuPath: `${menusFolder}/${platform}.json`,
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
  },

  editors: [
    {
      name: 'Gimp',
      cmd: 'gimp',
      format: 'JPG',
      platforms: [ 'darwin', 'linux' ]
    },
    {
      name: 'Rawtherapee',
      cmd: 'rawtherapee',
      format: 'RAW',
      platforms: [ 'darwin', 'linux' ]
    },
    {
      name: 'Darktable',
      cmd: 'darktable',
      format: 'RAW',
      platforms: [ 'darwin', 'linux' ]
    }
  ]
};
