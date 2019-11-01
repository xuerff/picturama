// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs')
const path = require('path')
var electron_notarize = require('electron-notarize')

module.exports = async function (params) {
    // Notarize the app on macOS only.
    if (process.platform !== 'darwin') {
        return
    }
    console.log('afterSign hook triggered')
    //console.log('afterSign hook params:', params)
    const startTime = Date.now()

    let appId = 'github.picturama'

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`)
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`)
    }

    console.log(`Notarizing ${appId} found at ${appPath}`)

    try {
        await electron_notarize.notarize({
            appBundleId: appId,
            appPath: appPath,
            appleId: process.env.appleId,
            appleIdPassword: process.env.appleIdPassword,
            ascProvider: process.env.ascProvider,
        })
    } catch (error) {
        console.error(error)
    }

    console.log(`Done notarizing ${appId} after ${Math.round((Date.now() - startTime) / 1000)} s`)
}
