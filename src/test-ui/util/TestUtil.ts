import { Photo, PhotoId, PhotoById, PhotoSectionId, LoadedPhotoSection } from 'common/CommonTypes'

import { GridSectionLayout } from 'app/UITypes'
import { createLayoutForLoadedSection } from 'app/controller/LibraryController'

import { createTestPhotoId, testBigPhoto } from './MockData'


export function createRandomDummyPhoto(): Photo {
    const id = createTestPhotoId()
    const minAspect = 3/4
    const maxAspect = 16/9
    const aspect = minAspect + Math.random() * (maxAspect - minAspect)
    const master_width  = 200 + Math.random() * 2000
    const master_height = master_width / aspect
    return {
        ...testBigPhoto,
        id,
        master_dir: 'some/dir',
        master_filename: 'dummy',
        master_width,
        master_height,
        master_is_raw: 0,
        edited_width: master_width,
        edited_height: master_height,
    }
}


export function createSection(sectionId: PhotoSectionId, photos: Photo[]): LoadedPhotoSection {
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


export function createLayoutForSection(section: LoadedPhotoSection,
    sectionTop: number, viewportWidth: number, gridRowHeight: number):
    GridSectionLayout
{
    const layout = createLayoutForLoadedSection(section, sectionTop, viewportWidth, gridRowHeight)
    layout.fromBoxIndex = 0
    layout.toBoxIndex = section.count
    return layout
}

