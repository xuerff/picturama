import { Photo, PhotoId, PhotoById, PhotoSectionId, PhotoSection } from 'common/CommonTypes'

import { GridSectionLayout } from 'ui/UITypes'
import { createLayoutForLoadedSection } from 'ui/controller/LibraryController'

import { testBigPhoto } from './MockData'


let nextDummyId = 1
export function createRandomDummyPhoto(): Photo {
    const id = nextDummyId++
    const minAspect = 3/4
    const maxAspect = 16/9
    const aspect = minAspect + Math.random() * (maxAspect - minAspect)
    const master_width  = 200 + Math.random() * 2000
    const master_height = master_width / aspect
    return {
        ...testBigPhoto,
        id: `dummy-${id}`,
        title: `dummy-${id}.JPG`,
        master: 'dummy',
        master_width,
        master_height,
        non_raw: null
    }
}


export function createSection(sectionId: PhotoSectionId, photos: Photo[]): PhotoSection {
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


export function createLayoutForSection(section: PhotoSection,
    sectionTop: number, viewportWidth: number, gridRowHeight: number):
    GridSectionLayout
{
    const layout = createLayoutForLoadedSection(section, sectionTop, viewportWidth, gridRowHeight)
    layout.fromBoxIndex = 0
    layout.toBoxIndex = section.count
    return layout
}

