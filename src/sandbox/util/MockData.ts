import { Photo, PhotoDetail } from 'common/CommonTypes'


export const testBigPhoto: Photo = {
    id: 'B1m80éAMpf',
    title: 'IMG_9700',
    master: '../specs/photos/IMG_9700.JPG',
    master_width: 5184,
    master_height: 3456,
    non_raw: null,
    extension: 'JPG',
    flag: 0,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    camera: 'Canon EOS 30D',
    exposure_time: 0.016666666666666666,
    iso: 1600,
    focal_length: 55,
    aperture: 5.6,
    date: '2016-09-18',
    trashed: 0
}

export const testLandscapePhoto: Photo = {
    id: 'kuV2UXUZNX',
    title: 'landscape',
    master: '../specs/photos/landscape.jpg',
    master_width: 800,
    master_height: 530,
    non_raw: null,
    extension: 'jpg',
    flag: 0,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    date: '2018-05-15',
    trashed: 0
}

export const testPortraitPhoto: Photo = {
    id: 'FRL1FAT1G3',
    title: 'portrait',
    master: '../specs/photos/portrait.jpg',
    master_width: 785,
    master_height: 1024,
    non_raw: null,
    extension: 'jpg',
    flag: 1,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    date: '2018-05-15',
    trashed: 0
}

export const testPanoramaPhoto: Photo = {
    id: 'BRllCnsu7y',
    title: 'panorama',
    master: '../specs/photos/panorama.jpg',
    master_width: 1024,
    master_height: 225,
    non_raw: null,
    extension: 'jpg',
    flag: 0,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    date: '2018-05-15',
    trashed: 0
}

export const testPhotos: Photo[] = [
    { name: 'alone',          width: 800, height: 533 },
    { name: 'architecture',   width: 800, height: 533 },
    { name: 'door-knocker',   width: 800, height: 533 },
    { name: 'ice-cubes',      width: 800, height: 533 },
    { name: 'koblenz',        width: 800, height: 518 },
    { name: 'light-bulb',     width: 800, height: 533 },
    { name: 'railway-tracks', width: 800, height: 533 },
    { name: 'rustic',         width: 800, height: 450 },
    { name: 'tomatoes',       width: 516, height: 800 },
    { name: 'water',          width: 800, height: 450 },
    { name: 'wolf',           width: 800, height: 498 },
].map((info, index) => ({
    id: `test-${index}`,
    title: info.name,
    master: `../specs/photos/800/${info.name}.jpg`,
    master_width: info.width,
    master_height: info.height,
    non_raw: null,
    extension: 'jpg',
    flag: 0,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    date: '2018-05-15',
    trashed: 0
}))
testPhotos.unshift(testLandscapePhoto, testPortraitPhoto)

export const testPhotoDetail: PhotoDetail = {
    tags: [],
    versions: []
}
