import Promise from 'bluebird'
import isDeepEqual from 'fast-deep-equal'

import { updatePhotos as updatePhotosInDb, fetchPhotoWork, storePhotoWork } from '../BackgroundClient'
import { BookshelfCollection } from '../../common/models/DataTypes'
import Photo, { PhotoWork, PhotoType } from '../../common/models/Photo'
import Tag from '../../common/models/Tag'
import { VersionType } from '../../common/models/Version'
import store from '../state/store'
import { fetchTotalPhotoCountAction, fetchPhotosAction, changePhotoWorkAction, changePhotosAction } from '../state/actions'
import { FilterState } from '../state/reducers/library'
import { assertRendererProcess } from '../../common/util/ElectronUtil'
import { onThumnailChange } from './ImageProvider'
import { cloneDeep } from '../../common/util/LangUtil'


assertRendererProcess()

export function fetchTotalPhotoCount() {
    Photo.forge()
        .count()
        .then(totalPhotoCount => store.dispatch(fetchTotalPhotoCountAction(totalPhotoCount)))
}

export function fetchPhotos() {
    internalFetchPhotos(null)
}

export function setPhotosFilter(newFilter: FilterState) {
    internalFetchPhotos(newFilter)
}

function internalFetchPhotos(newFilter: FilterState | null) {
    const filter = newFilter || store.getState().library.filter
    const mainFilter = filter.mainFilter

    store.dispatch(fetchPhotosAction.request({ newFilter }))
    if (mainFilter && mainFilter.type === 'tag') {
        new Tag({ id: mainFilter.tagId })
            .fetch({ withRelated: [ 'photos' ] })
            .then(tag => {
                const photosCollection = (tag as any).related('photos') as BookshelfCollection<PhotoType>
                const photos = photosCollection.toJSON()
                const photosCount = photos.length  // TODO
                store.dispatch(fetchPhotosAction.success({ photos, photosCount }))
            })
            .catch(error =>
                store.dispatch(fetchPhotosAction.failure(error))
            )
    } else {
        function buildQuery(q) {
            let where: any = {
                trashed: !!(mainFilter && mainFilter.type === 'trash')
            }
            if (mainFilter && mainFilter.type === 'date') {
                where.date = mainFilter.date
            }
            if (filter.showOnlyFlagged) {
                where.flag = true
            }
            q.where(where)

            if (mainFilter && mainFilter.type === 'processed') {
                q.join('versions', 'versions.photo_id', '=', 'photos.id')
            }
        }

        const countForge = Photo.forge()
            .query(q => buildQuery(q))
            .count()

        const photosForge = Photo.forge()
            .query(q => {
                buildQuery(q)
                q
                    .offset(0)
                    .limit(100)
                    .orderBy('created_at', 'desc')
            })
            .fetchAll({ withRelated: [ 'versions', 'tags' ] })

        Promise.all([ countForge, photosForge ])
            .then(result => {
                const [ photosCount, photosCollection] = result
                const photos = photosCollection.toJSON()
                store.dispatch(fetchPhotosAction.success({ photos, photosCount }))
            })
            .catch(error =>
                store.dispatch(fetchPhotosAction.failure(error))
            )
    }
}


// We queue pending PhotoWork updates, so we don't get lost updates if multiple updates wait for fetching to finish
const pendingUpdates: { photo: PhotoType, updates: ((photoWork: PhotoWork) => void)[] }[] = []

export function updatePhotoWork(photo: PhotoType, update: (photoWork: PhotoWork) => void) {
    const photoPath = photo.master
    let pendingUpdate = pendingUpdates[photoPath]
    if (pendingUpdate) {
        pendingUpdate.updates.push(update)
    } else {
        pendingUpdate = {
            photo,
            updates: [ update ]
        }
        pendingUpdates[photoPath] = pendingUpdate

        fetchPhotoWork(photoPath)
            .then(photoWork => {
                const photoWorkCopyBefore = cloneDeep(photoWork)
                for (const up of pendingUpdate.updates) {
                    up(photoWork)
                }
                delete pendingUpdates[photoPath]

                // Ignore changes on flagged
                if (photoWork.flagged) {
                    photoWorkCopyBefore.flagged = true
                } else {
                    delete photoWorkCopyBefore.flagged
                }
                const thumbnailNeedsUpdate = !isDeepEqual(photoWorkCopyBefore, photoWork)

                // We do all in parallel:
                //   - Show the new effects in UI
                //   - Store PhotoWork to ansel.json
                //   - Update Thumbnail

                store.dispatch(changePhotoWorkAction(photo.id, photoWork))

                return Promise.all([
                    storePhotoWork(photoPath, photoWork),
                    thumbnailNeedsUpdate ? onThumnailChange(photo.id) : null
                ])
            })
            .catch(error => {
                delete pendingUpdates[photoPath]
                // TODO: Show error message in UI
                console.error('Updating photo work failed: ' + photo.master, error)
            })
    }
}

export function updatePhotoVersion(version: VersionType) {  // Type should be `Version`, but it doesn't work...
    // TODO: Fix
    throw new Error('Not implemented')
    //new Photo({ id: version.photo_id })
    //    .fetch({ withRelated: [ 'versions', 'tags' ] })
    //    .then(photoModel => {
    //        const photo = photoModel.toJSON()
    //        return onThumnailChange(photo.id)
    //            .then(() => {
    //                const updatedPhoto = addVersionToPhoto(photo)
    //                store.dispatch(changePhotosAction([ updatedPhoto ]))
    //            })
    //    })
}

export function setPhotosFlagged(photos: PhotoType[], flagged: boolean) {
    updatePhotos(photos, { flag: flagged ? 1 : 0 })
}

export function movePhotosToTrash(photos: PhotoType[]) {
    updatePhotos(photos, { trashed: 1 })
}

export function updatePhotos(photos: PhotoType[], update: Partial<PhotoType>) {
    let updatePhotoWorkPromise = null
    if (update.hasOwnProperty('flag')) {
        updatePhotoWorkPromise = Promise.all(photos.map(photo =>
            updatePhotoWork(
                photo,
                photoWork => {
                    if (update.flag) {
                        photoWork.flagged = true
                    } else {
                        delete photoWork.flagged
                    }
                })
        ))
    }

    const photoIds = photos.map(photo => photo.id)
    Promise.all([
        updatePhotoWorkPromise,
        updatePhotosInDb(photoIds, update)
    ])
    .then(() => {
        const changedPhotos = photos.map(photo => ({ ...photo, ...update } as PhotoType))
        store.dispatch(changePhotosAction(changedPhotos))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Updating photos failed', error)
    })
}
