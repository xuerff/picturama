import { PhotoType, PhotoSectionId, PhotoSection } from '../../common/models/Photo'

import store from './store'


export function getPhotoByIndex(sectionId: PhotoSectionId, photoIndex: number): PhotoType | null {
    const section = getSectionById(sectionId)
    return section ? section.photoData[section.photoIds[photoIndex]] : null
}

export function getPhotoById(sectionId: PhotoSectionId, photoId: string): PhotoType | null {
    const section = getSectionById(sectionId)
    return section ? section.photoData[photoId] : null
}

export function getSectionById(sectionId: PhotoSectionId): PhotoSection | null {
    return store.getState().data.sections.byId[sectionId]
}
