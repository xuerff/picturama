import { Photo, PhotoSectionId, PhotoSection, TagId } from 'common/CommonTypes'

import store from './store'


export function getPhotoByIndex(sectionId: PhotoSectionId, photoIndex: number): Photo | null {
    const section = getSectionById(sectionId)
    return (section && section.photoData && section.photoIds) ? section.photoData[section.photoIds[photoIndex]] : null
}

export function getPhotoById(sectionId: PhotoSectionId, photoId: string): Photo | null {
    const section = getSectionById(sectionId)
    return (section && section.photoData) ? section.photoData[photoId] : null
}

export function getSectionById(sectionId: PhotoSectionId): PhotoSection | null {
    return store.getState().data.sections.byId[sectionId]
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
