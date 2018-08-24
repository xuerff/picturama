import fs from 'fs'

import Promise from 'bluebird'
import ExifParser from 'exif-parser'
import { ExifOrientation } from '../common/models/DataTypes'

const readFile = Promise.promisify(fs.readFile)
const fileStat = Promise.promisify(fs.stat)


export interface MetaData {
    imgWidth?:     number
    imgHeight?:    number
    camera?:       string
    exposureTime?: number
    iso?:          number
    aperture?:     number
    focalLength?:  number
    createdAt?:    Date
    /** Details on orientation: https://www.impulseadventure.com/photo/exif-orientation.html */
    orientation:   ExifOrientation
    tags:          string[]
}


export function readMetadataOfImage(imagePath: string): Promise<MetaData> {
    return readExifOfImage(imagePath)
        .then(extractMetaDataFromExif)
        .catch(error => {
            if (error.message !== 'Invalid JPEG section offset') {
                console.log(`Reading EXIF data from ${imagePath} failed - continuing without. Error: ${error.message}`)
            }
            return fileStat(imagePath)
                .then(stat => ({
                    createdAt: stat.birthtime,
                    orientation: 1,
                    tags: []
                }))
        })
}


function readExifOfImage(imagePath) {
    return readFile(imagePath)
        .then(buffer => {
            const parser = ExifParser.create(buffer) as any
            return parser.parse()
        })
}


const simplifiedBrandNames = {
    'NIKON CORPORATION': 'Nikon',
    'OLYMPUS IMAGING CORP.': 'Olympus'
}

function extractMetaDataFromExif(exifData): MetaData {
    const exifTags = exifData.tags
    const rawDate = exifTags.DateTimeOriginal || exifTags.DateTime || exifTags.CreateDate || exifTags.ModifyDate

    // Examples:
    //   - Make = 'Canon', Model = 'Canon EOS 30D'  ->  'Canon EOS 30D'
    //   - Make = 'SONY', Model = 'DSC-N2'  ->  'SONY DSC-N2'
    //   - Make = 'NIKON CORPORATION', Model = 'NIKON D7200'  ->  'Nikon D7200'
    //   - Make = 'OLYMPUS IMAGING CORP.', Model = 'E-M10'  ->  'Olympus E-M10'
    var cameraBrand: string | null = exifTags.Make
    var cameraModel: string | null = exifTags.Model
    var camera: string = cameraModel
    if (cameraBrand && cameraModel) {
        cameraBrand = simplifiedBrandNames[cameraBrand] || cameraBrand
        if (cameraModel.toLowerCase().indexOf(cameraBrand.toLowerCase()) === 0) {
            cameraModel = cameraModel.substring(cameraBrand.length).trimLeft()
        }

        camera = `${cameraBrand} ${cameraModel}`
    }

    const metaData: MetaData = {
        imgWidth:     (exifData.imageSize && exifData.imageSize.width)  || exifTags.ExifImageWidth,
        imgHeight:    (exifData.imageSize && exifData.imageSize.height) || exifTags.ExifImageHeight,
        camera:       (camera.length === 0) ? null : camera,
        exposureTime: exifTags.ExposureTime,
        iso:          exifTags.ISO,
        aperture:     exifTags.FNumber,
        focalLength:  exifTags.FocalLength,
        createdAt:    rawDate ? new Date(rawDate * 1000) : undefined,
        orientation:  exifTags.Orientation || 1,
            // Details on orientation: https://www.impulseadventure.com/photo/exif-orientation.html
        tags:         []
    }

    // TODO: Translate from `exiv2` result into `exif-parser` result
    //if (exData.hasOwnProperty('Xmp.dc.subject'))
    //  metaData.tags = exData['Xmp.dc.subject'].split(', ');

    return metaData
}
