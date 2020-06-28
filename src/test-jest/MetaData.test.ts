import moment from 'moment'

import { readMetadataOfImage } from 'background/MetaData'


const testPhotosDir = 'submodules/test-data/photos'

test('MetaData.readMetadataOfImage', async () => {

    expect(await readMetadataOfImage(`${testPhotosDir}/800/architecture.jpg`)).toMatchObject({
        aperture: 5.6,
        camera: 'Nikon D3300',
        createdAt: toDate('2017-03-25T09:22:15.000Z'),
        exposureTime: 0.003125,
        focalLength: 40,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/ice-cubes.jpg`)).toMatchObject({
        aperture: 11,
        camera: 'FUJIFILM X-T2',
        createdAt: toDate('2018-06-28T17:37:06.000Z'),
        exposureTime: 0.05,
        focalLength: 80,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/light-bulb.jpg`)).toMatchObject({
        aperture: 4,
        camera: 'SONY ILCE-7',
        createdAt: toDate('2016-01-16T00:14:16.000Z'),
        exposureTime: 1,
        focalLength: 105,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/railway-tracks.jpg`)).toMatchObject({
        aperture: 6.3,
        camera: 'Olympus E-M10',
        createdAt: toDate('2018-06-01T10:21:18.000Z'),
        exposureTime: 0.0025,
        focalLength: 128,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/rustic.jpg`)).toMatchObject({
        aperture: 14,
        camera: 'SONY ILCE-6300',
        createdAt: toDate('2018-05-26T21:31:00.000Z'),
        exposureTime: 3.2,
        focalLength: 30,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 100,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/tomatoes.jpg`)).toMatchObject({
        aperture: 2.8,
        camera: 'Canon EOS 450D',
        createdAt: toDate('2017-04-15T07:11:52.000Z'),
        exposureTime: 0.01,
        focalLength: 50,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 200,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/800/water.jpg`)).toMatchObject({
        aperture: 11,
        camera: 'Nikon D750',
        createdAt: toDate('2016-09-30T12:37:39.000Z'),
        exposureTime: 0.00625,
        focalLength: 112,
        imgHeight: undefined,
        imgWidth: undefined,
        iso: 64,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/heic/Apple_iPhone_XR_portrait.HEIC`)).toMatchObject({
        aperture: 1.8,
        camera: 'Apple iPhone XR',
        createdAt: toDate('2019-07-31T12:34:34.000Z'),
        exposureTime: 0.000700770847932726,
        focalLength: 4.25,
        imgHeight: 3024,
        imgWidth: 4032,
        iso: 25,
        orientation: 6,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/jpg/Apple_iPhone_XR_landscape.jpg`)).toMatchObject({
        aperture: 1.8,
        camera: 'Apple iPhone XR',
        createdAt: toDate('2019-09-12T16:22:17.000Z'),
        exposureTime: 0.0007407407407407407,
        focalLength: 4.25,
        imgHeight: 2866,
        imgWidth: 3824,
        iso: 25,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/IMG_9700.JPG`)).toMatchObject({
        aperture: 5.6,
        camera: 'Canon EOS 700D',
        createdAt: toDate('2016-09-18T16:12:25.000Z'),
        exposureTime: 0.016666666666666666,
        focalLength: 55,
        imgHeight: 3456,
        imgWidth: 5184,
        iso: 1600,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/landscape.jpg`)).toMatchObject({
        createdAt: toDate('2020-06-28T09:49:10.811Z'),
        orientation: 1,
        tags: []
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/panorama.jpg`)).toMatchObject({
        aperture: undefined,
        camera: undefined,
        createdAt: toDate('2018-08-15T13:09:04.000Z'),
        exposureTime: undefined,
        focalLength: undefined,
        imgHeight: 225,
        imgWidth: 1024,
        iso: undefined,
        orientation: 1,
        tags: [],
    })

    expect(await readMetadataOfImage(`${testPhotosDir}/portrait.jpg`)).toMatchObject({
        aperture: 8,
        camera: 'SONY DSLR-A850',
        createdAt: toDate('2012-09-24T17:23:35.000Z'),
        exposureTime: 0.004,
        focalLength: 135,
        imgHeight: 1024,
        imgWidth: 785,
        iso: 100,
        orientation: 1,
        tags: [],
    })
})


function toDate(isoTimeStamp: string): Date {
    return moment(isoTimeStamp).toDate()
}
