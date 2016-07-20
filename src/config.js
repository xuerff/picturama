let dotAnsel = `${process.env.HOME}/.ansel`;
let migrationsFolder = `${process.resourcesPath}/app/migrations`;

if (process.env.ANSEL_DEV_MODE) {
  dotAnsel = `${process.env.INIT_CWD}/dot-ansel`;
  migrationsFolder = `${process.env.INIT_CWD}/migrations`;
}

export default {
  characters: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè',
  acceptedRawFormats: [ 'raf', 'cr2', 'arw', 'dng' ],
  acceptedImgFormats: [ 'png', 'jpg', 'jpeg', 'tif', 'tiff' ],
  watchedFormats: /([\$\#\w\d]+)-([\$\#\w\dèé]+)-(\d+)\.(JPEG|JPG|PNG|PPM)/i,
  exportFormats: [ 'jpg', 'png' ],
  dotAnsel,
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
