import { PhotoId, Photo, PhotoSectionId, PhotoSection, TagId, isLoadedPhotoSection, LoadedPhotoSection } from 'common/CommonTypes'

import store from './store'


export function getPhotoByIndex(sectionId: PhotoSectionId, photoIndex: number): Photo | null {
    const section = getLoadedSectionById(sectionId)
    return section ? section.photoData[section.photoIds[photoIndex]] : null
}

export function getPhotoById(sectionId: PhotoSectionId, photoId: PhotoId): Photo | null {
    const section = getLoadedSectionById(sectionId)
    return section ? section.photoData[photoId] : null
}

export function getLoadedSectionById(sectionId: PhotoSectionId): LoadedPhotoSection | null {
    const section = store.getState().data.sections.byId[sectionId]
    return isLoadedPhotoSection(section) ? section : null
}

let prevTagIds: TagId[] = []
let cachedTagTitles: string[] = []
export function getTagTitles(): string[] {
    const state = store.getState()
    const tagIds = state.data.tags.ids
    if (tagIds !== prevTagIds) {
        const tagById = state.data.tags.byId
        cachedTagTitles = tagIds.map(tagId => tagById[tagId].title)
        prevTagIds = tagIds
    }
    return cachedTagTitles
}
