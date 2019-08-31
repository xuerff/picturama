import fs from 'fs'
import os from 'os'

import npmPackage from '../../package.json'


let dotAnsel = `${os.homedir()}/.ansel`
let dbMigrationsFolder = `${process.resourcesPath}/app/migrations`
let anselFolder = `${process.resourcesPath}/app`
const cwd = process.cwd()

if (process.env.ANSEL_DEV_MODE) {
    dotAnsel = `${cwd}/dot-ansel`
    dbMigrationsFolder = `${cwd}/migrations`
    anselFolder = `${cwd}`
}

if (process.env.ANSEL_TEST_MODE) {
    const testsPath = `${os.tmpdir()}/ansel-tests`

    if (!fs.existsSync(testsPath)) {
        fs.mkdirSync(testsPath)
    }

    dotAnsel = `${testsPath}/dot-ansel`
    dbMigrationsFolder = `${cwd}/migrations`
}

const menusFolder = `${anselFolder}/menus`
const platform = os.platform()

export default {
    version: npmPackage.version,
    platform,
    acceptedRawExtensions: [ 'raf', 'cr2', 'arw', 'dng' ],
    acceptedNonRawExtensions: [ 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp' ],
    watchedFormats: /([$#\w\d]+)-([$#\w\dèé]+)-(\d+)\.(JPEG|JPG|PNG|PPM|TIFF|WEBP)/i,
    exportFormats: [ 'jpg', 'png', 'webp' ],
    workExt: 'webp',
    dotAnsel,
    menusFolder,
    keymapsFolder: `${anselFolder}/keymaps`,
    menuPath: `${menusFolder}/${platform}.json`,
    dbFile: `${dotAnsel}/db.sqlite3`,
    dbMigrationsFolder,
    settings: `${dotAnsel}/settings.json`,
    nonRawPath: `${dotAnsel}/non-raw`,
    thumbnailPath: `${dotAnsel}/thumbnails`,
    tmp: `${os.tmpdir()}/ansel`,
    concurrency: 3,

    // TODO: Revive Legacy code of 'version' feature
    /*
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
    */
}
