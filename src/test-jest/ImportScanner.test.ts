import fs from 'fs'
import util from 'util'

import { PhotoId, Photo, ImportProgress } from 'common/CommonTypes'

import ImportScanner, { ImportScannerDelegate, PhotoOfDirectoryInfo, ImportScannerState } from 'background/ImportScanner'

const exists = util.promisify(fs.exists)
const mkdir = util.promisify(fs.mkdir)
const copyFile = util.promisify(fs.copyFile)


const testBaseDir = 'dist-test'


testImportScanner('simple import',
    async testDir => {
        await copyFile('test-data/photos/800/door-knocker.jpg', `${testDir}/door-knocker.jpg`)
    },
    async ({ testDir, storedPhotos, finalProgress }) => {
        expect(finalProgress).toEqual({
            phase: 'import-photos',
            total: 1,
            processed: 1,
            added: 1,
            removed: 0,
            currentPath: testDir
        })

        expect(storedPhotos).toMatchObject([
            {
                master_dir: testDir,
                master_filename: 'door-knocker.jpg',
                master_width: 800,
                master_height: 533,
                master_is_raw: 0,
                orientation: 1,
                camera: 'Olympus E-M10',
                exposure_time: 0.005,
                iso: [ 200, 0 ],
                focal_length: 31,
                aperture: 5.6,
                flag: 0,
            }
        ])
    })


function testImportScanner(testName: string, prepareTestDir: (testDir: string) => Promise<void>,
    checkResult: (result: { testDir: string, storedPhotos: Photo[], finalProgress: ImportProgress }) => Promise<void>)
{
    test(testName, async () => {
        const testDir = `${testBaseDir}/${testName.replace(/ /g, '_')}`
        const testDirExists = await exists(testDir)
        if (!testDirExists) {
            const distTestExists = await exists(testBaseDir)
            if (!distTestExists) {
                await mkdir(testBaseDir)
            }
            await mkdir(testDir)
            await prepareTestDir(testDir)
        }

        const testImportScannerDelegate = new TestImportScannerDelegate()
        const importScanner = new ImportScanner(testImportScannerDelegate)
        const finalProgress = await importScanner.scanPhotos([ testDir ])
        if (!finalProgress) {
            throw new Error('Expected final progress')
        }

        const { storedPhotos } = testImportScannerDelegate
        await checkResult({ testDir, storedPhotos, finalProgress })
    })
}


class TestImportScannerDelegate implements ImportScannerDelegate {

    storedPhotos: Photo[] = []

    async deletePhotosOfRemovedDirsFromDb(existingDirs: string[]): Promise<number> {
        return 0
    }

    async deletePhotosFromDb(photoIds: PhotoId[]): Promise<void> {
    }

    async fetchPhotosOfDirectoryFromDb(dir: string): Promise<PhotoOfDirectoryInfo[]> {
        return []
    }

    nextTempRawConversionPaths(): { tempExtractThumbPath: string, tempNonRawImgPath: string } {
        throw new Error('Expected no raw conversion')
    }

    async storePhotoInDb(masterFullPath: string, photo: Photo, tempNonRawImgPath: string | null, tags: string[]): Promise<void> {
        this.storedPhotos.push(photo)
    }

    async updateProgressInUi(state: ImportScannerState, progress: ImportProgress): Promise<void> {
    }

    showError(msg: string, error?: Error): void {
        throw new Error('Unexpected error: ' + msg + ' - ' + error)
    }
}
