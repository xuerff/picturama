import { action, createAsyncAction } from 'typesafe-actions'

import {
    SETTINGS_EXISTS_REQUEST, SETTINGS_EXISTS_SUCCESS, SETTINGS_EXISTS_FAILURE, SET_DETAIL_PHOTO_REQUEST, SET_DETAIL_PHOTO_SUCCESS, SET_DETAIL_PHOTO_FAILURE,
    CLOSE_DETAIL, SET_HIGHLIGHTED_PHOTOS, FETCH_PHOTOS_REQUEST, FETCH_PHOTOS_SUCCESS, FETCH_PHOTOS_FAILURE,
    CHANGE_PHOTOWORK, CHANGE_PHOTOS, EMPTY_TRASH, START_IMPORT, SET_IMPORT_PROGRESS, FETCH_DATES, FETCH_TAGS, CREATE_TAGS,
    INIT_DEVICES, ADD_DEVICE, REMOVE_DEVICE, OPEN_TAGS_EDITOR, CLOSE_TAGS_EDITOR, OPEN_DIFF, CLOSE_DIFF, OPEN_EXPORT, CLOSE_EXPORT, TOGGLE_DIFF
} from './actionTypes'
import { Device } from '../models/DataTypes'
import { PhotoWork, PhotoType, PhotoId } from '../models/Photo'
import { TagType } from '../models/Tag'
import { ImportProgress } from './reducers/import'
import { FilterState, DatesState } from './reducers/library'


export const checkSettingsExistAction = createAsyncAction(SETTINGS_EXISTS_REQUEST, SETTINGS_EXISTS_SUCCESS, SETTINGS_EXISTS_FAILURE)<void, void, Error>()

export const setDetailPhotoAction = createAsyncAction(SET_DETAIL_PHOTO_REQUEST, SET_DETAIL_PHOTO_SUCCESS, SET_DETAIL_PHOTO_FAILURE)<{ photoIndex: number, photoId: string }, { photoWork: PhotoWork }, Error>()
export const closeDetailAction = () => action(CLOSE_DETAIL)

export const setHighlightedPhotosAction = (highlightedIds: PhotoId[]) => action(SET_HIGHLIGHTED_PHOTOS, { highlightedIds })

export const fetchPhotosAction = createAsyncAction(FETCH_PHOTOS_REQUEST, FETCH_PHOTOS_SUCCESS, FETCH_PHOTOS_FAILURE)<{ newFilter: FilterState | null }, { photos: PhotoType[], photosCount: number }, Error>()
export const changePhotoWorkAction = (photoId: PhotoId, photoWork: PhotoWork) => action(CHANGE_PHOTOWORK, { photoId, photoWork })
export const changePhotosAction = (photos: PhotoType[]) => action(CHANGE_PHOTOS, { photos })
export const emptyTrashAction = (trashedPhotoIds: PhotoId[]) => action(EMPTY_TRASH, { trashedPhotoIds })

export const startImportAction = () => action(START_IMPORT)
export const setImportProgressAction = (progress: ImportProgress) => action(SET_IMPORT_PROGRESS, { progress })

export const fetchDatesAction = (dates: DatesState) => action(FETCH_DATES, { dates })

export const fetchTagsAction = (tags: TagType[]) => action(FETCH_TAGS, { tags })
export const createTagsAction = (tags: TagType[]) => action(CREATE_TAGS, { tags })

export const initDevicesAction = (devices: Device[]) => action(INIT_DEVICES, { devices })
export const addDeviceAction = (device: Device) => action(ADD_DEVICE, { device })
export const removeDeviceAction = (device: Device) => action(REMOVE_DEVICE, { device })

export const openTagsEditorAction = () => action(OPEN_TAGS_EDITOR)
export const closeTagsEditorAction = () => action(CLOSE_TAGS_EDITOR)

export const openDiffAction = () => action(OPEN_DIFF)
export const closeDiffAction = () => action(CLOSE_DIFF)

export const openExportAction = (photoIds: PhotoId[]) => action(OPEN_EXPORT, { photoIds })
export const closeExportAction = () => action(CLOSE_EXPORT)

//export const TOGGLE_DIFF = 'TOGGLE_DIFF'  // Was: 'TOGGLE_DIFF_SUCCESS'
