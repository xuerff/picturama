let dotAnsel = `${process.env.HOME}/.ansel`;

if (process.env.ANSEL_DEV_MODE)
  dotAnsel = `${process.env.INIT_CWD}/dot-ansel`;

export default {
  acceptedRawFormats: [ 'raf', 'cr2', 'arw', 'dng' ],
  watchedFormats: /([\$\#\w\d]+)-([\$\#\w\d]+)-(\d+)\.(JPEG|JPG|PNG|PPM)/i,
  dotAnsel,
  dbFile: `${dotAnsel}/db.sqlite3`
};
