import { ipcMain, Menu, BrowserWindow } from 'electron'

import config from 'common/config'
import { msg } from 'common/i18n/i18n'

import ForegroundClient from 'background/ForegroundClient'
import { startImport } from 'background/ImportController'
import AppWindowController from 'background/AppWindowController'


/**
 * The main menu. Only used on MacOS.
 */
class MainMenu {

    private menu: Menu


    constructor(private mainWindow: BrowserWindow) {
        // TODO: Revive Legacy code of 'version' feature
        //this.fixMissingVersions = this.fixMissingVersions.bind(this)

        this.menu = Menu.buildFromTemplate([
            {
                label: 'Picturama',
                submenu: [
                    {
                        label: msg('MainMenu_version', config.version),
                        enabled: false
                    },
                    {
                        label: msg('MainMenu_settings'),
                        click: () => ForegroundClient.showSettings()
                    },
                    {
                        label: msg('MainMenu_quit'),
                        accelerator: 'Cmd+Q',
                        click: () => this.mainWindow.close()
                    }
                ]
            },
            {
                label: msg('MainMenu_file'),
                submenu: [
                    {
                        id: 'export',
                        label: msg('MainMenu_export'),
                        accelerator: 'Cmd+Shift+E',
                        enabled: false,
                        click: () => this.mainWindow.webContents.send('exportClicked', true)
                    },
                    {
                        label: msg('MainMenu_scan'),
                        accelerator: 'Cmd+R',
                        click: startImport
                    }
                ]
            },
            {
                label: msg('MainMenu_view'),
                submenu: [
                    {
                        label: msg('MainMenu_toggleFullScreen'),
                        accelerator: 'F11',
                        click: () => AppWindowController.toggleFullScreen()
                    }
                ]
            },
            {
                label: msg('MainMenu_developer'),
                submenu: [
                    {
                        label: msg('MainMenu_toggleDevTools'),
                        accelerator: 'Cmd+Alt+I',
                        click: () => this.mainWindow.webContents.toggleDevTools()
                    },
                    {
                        label: msg('MainMenu_toggleUiTester'),
                        accelerator: 'Cmd+Alt+T',
                        click: () => AppWindowController.toggleUiTester()
                    },
                    {
                        label: msg('MainMenu_reloadUi'),
                        accelerator: 'Shift+Cmd+R',
                        click: () => AppWindowController.reloadUi()
                    }
                ]
            }
        ])
        Menu.setApplicationMenu(this.menu)

        ipcMain.on('toggleExportMenu', (e, state) => {
            this.menu.getMenuItemById('export').enabled = state
        })
    }

    // TODO: Revive Legacy code of 'version' feature
    /*
    private fixMissingVersions() {
        Version
            .query(qb =>
                qb
                    .innerJoin('photos', 'versions.photo_id', 'photos.id')
                    .where('output', null)
                    .orWhere('thumbnail', null)
            )
            .fetchAll()
            .then(versions => {
                versions.toJSON().forEach(version => {
                    let versionName = version.master!.match(/\w+-[\wéè]+-\d.\w{1,5}$/)![0]
                    let outputPath = `${this.versionsPath}/${versionName}`

                    if (fs.existsSync(outputPath)) {
                        // TODO: regenerate thumbnail
                        new Version({ id: version.id })
                            .save('output', outputPath, { patch: true })
                            .then(() => {
                                (Version as any).updateImage(outputPath.match(config.watchedFormats))
                            })
                    } else {
                        new Version({ id: version.id })
                            .destroy()
                            .catch(err => console.error('error while destroying', err))
                    }
                })
            })
    }
    */

}

export default MainMenu
