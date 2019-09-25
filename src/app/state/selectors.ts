import { PhotoId, Photo, PhotoSectionId, TagId, isLoadedPhotoSection, LoadedPhotoSection } from 'common/CommonTypes'

import { AppState } from './StateTypes'


export function getPhotoByIndex(state: AppState, sectionId: PhotoSectionId, photoIndex: number): Photo | null {
    const section = getLoadedSectionById(state, sectionId)
    return section ? section.photoData[section.photoIds[photoIndex]] : null
}

export function getPhotoById(state: AppState, sectionId: PhotoSectionId, photoId: PhotoId): Photo | null {
    const section = getLoadedSectionById(state, sectionId)
    return section ? section.photoData[photoId] : null
}

export function getLoadedSectionById(state: AppState, sectionId: PhotoSectionId): LoadedPhotoSection | null {
    const section = state.data.sections.byId[sectionId]
    return isLoadedPhotoSection(section) ? section : null
}

let prevTagIds: TagId[] = []
let cachedTagTitles: string[] = []
export function getTagTitles(state: AppState): string[] {
    const tagIds = state.data.tags.ids
    if (tagIds !== prevTagIds) {
        const tagById = state.data.tags.byId
        cachedTagTitles = tagIds.map(tagId => tagById[tagId].title)
        prevTagIds = tagIds
    }
    return cachedTagTitles
}
