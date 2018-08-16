import { PhotoType, PhotoId, PhotoById, PhotoSectionId, PhotoSection } from '../../common/models/Photo'

import { testPhoto } from './MockData'


let nextDummyId = 1
export function createRandomDummyPhoto(): PhotoType {
    const id = nextDummyId++
    const minAspect = 3/4
    const maxAspect = 16/9
    const aspect = minAspect + Math.random() * (maxAspect - minAspect)
    const master_width  = 200 + Math.random() * 2000
    const master_height = master_width / aspect
    return {
        ...testPhoto,
        id: `dummy-${id}`,
        title: `dummy-${id}.JPG`,
        master: 'dummy',
        master_width,
        master_height,
        non_raw: null
    }
}


export function createSection(sectionId: PhotoSectionId, photos: PhotoType[]): PhotoSection {
    let photoIds: PhotoId[] = []
    let photoData: PhotoById = {}
    for (const photo of photos) {
        photoIds.push(photo.id)
        photoData[photo.id] = photo
    }

    return {
        id: sectionId,
        title: sectionId,
        count: photoIds.length,
        photoIds,
        photoData
    }
}
