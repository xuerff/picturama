import { PhotoId, Photo, PhotoDetail } from 'common/CommonTypes'


let nextTestPhotoId: PhotoId = 49
export function createTestPhotoId(): PhotoId {
    return nextTestPhotoId++
}


export const testBigPhoto: Photo = {
    id: createTestPhotoId(),
    master_dir: '../src/test-photos',
    master_filename: 'IMG_9700.JPG',
    master_width: 5184,
    master_height: 3456,
    master_is_raw: 0,
    created_at: 1474222345000,
    updated_at: 1474222345000,
    imported_at: 1565807324226,
    orientation: 1,
    camera: 'Canon EOS 30D',
    exposure_time: 0.016666666666666666,
    iso: 1600,
    focal_length: 55,
    aperture: 5.6,
    date: '2016-09-18',
    flag: 0,
    trashed: 0
}

export const testLandscapePhoto: Photo = {
    id: createTestPhotoId(),
    master_dir: '../src/test-photos',
    master_filename: 'landscape.jpg',
    master_width: 800,
    master_height: 530,
    master_is_raw: 0,
    created_at: 1474222345000,
    updated_at: 1474222345000,
    imported_at: 1565807324226,
    orientation: 1,
    date: '2018-05-15',
    flag: 0,
    trashed: 0
}

export const testPortraitPhoto: Photo = {
    id: createTestPhotoId(),
    master_dir: '../src/test-photos',
    master_filename: 'portrait.jpg',
    master_width: 785,
    master_height: 1024,
    master_is_raw: 0,
    created_at: 1474222345000,
    updated_at: 1474222345000,
    imported_at: 1565807324226,
    orientation: 1,
    date: '2018-05-15',
    flag: 1,
    trashed: 0
}

export const testPanoramaPhoto: Photo = {
    id: createTestPhotoId(),
    master_dir: '../src/test-photos',
    master_filename: 'panorama.jpg',
    master_width: 1024,
    master_height: 225,
    master_is_raw: 0,
    created_at: 1474222345000,
    updated_at: 1474222345000,
    imported_at: 1565807324226,
    orientation: 1,
    date: '2018-05-15',
    flag: 0,
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
].map(info => ({
    id: createTestPhotoId(),
    title: info.name,
    master_dir: '../src/test-photos/800',
    master_filename: `${info.name}.jpg`,
    master_width: info.width,
    master_height: info.height,
    master_is_raw: 0,
    created_at: 1474222345000,
    updated_at: 1474222345000,
    imported_at: 1565807324226,
    orientation: 1,
    date: '2018-05-15',
    flag: 0,
    trashed: 0
}))
testPhotos.unshift(testLandscapePhoto, testPortraitPhoto)

export const testPhotoDetail: PhotoDetail = {
    tags: [],
    versions: []
}
