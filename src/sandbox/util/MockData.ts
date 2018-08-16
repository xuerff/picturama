import { PhotoType, PhotoDetail } from '../../common/models/Photo'


export const testPhoto: PhotoType = {
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
    exposure_time: 0.016666666666666666,
    iso: 1600,
    focal_length: 55,
    aperture: 5.6,
    date: '2016-09-18',
    trashed: 0
}

export const testUprightPhoto: PhotoType = {
    id: 'FRL1FAT1G3',
    title: 'upright',
    master: '../specs/photos/upright.jpg',
    master_width: 785,
    master_height: 1024,
    non_raw: null,
    extension: 'jpg',
    flag: 1,
    created_at: null,
    updated_at: null,
    orientation: 1,
    exposure_time: null,
    iso: null,
    focal_length: null,
    aperture: null,
    date: '2018-05-15',
    trashed: 0
}

export const testPanoramaPhoto: PhotoType = {
    id: 'BRllCnsu7y',
    title: 'panorama',
    master: '../specs/photos/panorama.jpg',
    master_width: 1024,
    master_height: 225,
    non_raw: null,
    extension: 'jpg',
    flag: 0,
    created_at: null,
    updated_at: null,
    orientation: 1,
    exposure_time: null,
    iso: null,
    focal_length: null,
    aperture: null,
    date: '2018-05-15',
    trashed: 0
}

export const testPhotoDetail: PhotoDetail = {
    tags: [],
    versions: []
}
