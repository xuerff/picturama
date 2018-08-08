import * as Promise from 'bluebird'

import { fetchPhotoWork, storePhotoWork, storeThumbnail } from '../BackgroundClient'
import { BookshelfCollection } from '../../common/models/DataTypes'
import Photo, { PhotoWork, PhotoType } from '../../common/models/Photo'
import Tag from '../../common/models/Tag'
import Version from '../../common/models/Version'
import store from '../state/store'
import { fetchTotalPhotoCountAction, fetchPhotosAction, changePhotoWorkAction, changePhotosAction } from '../state/actions'
import { FilterState } from '../state/reducers/library'
import { assertRendererProcess } from '../../common/util/ElectronUtil'
import { onThumnailChange } from './ImageProvider'


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
                const photos = photosCollection.toJSON().map(addVersionToPhoto)
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
                const photos = photosCollection.toJSON().map(addVersionToPhoto)
                store.dispatch(fetchPhotosAction.success({ photos, photosCount }))
            })
            .catch(error =>
                store.dispatch(fetchPhotosAction.failure(error))
            )
    }
}


function addVersionToPhoto(photo: PhotoType): PhotoType {
    photo.versionNumber = 1

    if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
        photo.versionNumber = 1 + photo.versions.length

        const lastVersion = photo.versions[photo.versions.length - 1]
        photo.thumb = lastVersion.output || photo.thumb
    }

    return photo
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
                for (const up of pendingUpdate.updates) {
                    up(photoWork)
                }
                delete pendingUpdates[photoPath]

                // We do all in parallel:
                //   - Show the new effects in UI
                //   - Store PhotoWork to ansel.json
                //   - Update Thumbnail

                store.dispatch(changePhotoWorkAction(photo.id, photoWork))

                return Promise.all([
                    storePhotoWork(photoPath, photoWork),
                    onThumnailChange(photo.id)
                ])
            })
            .catch(error => {
                delete pendingUpdates[photoPath]
                console.log('Updating photo work failed: ' + photo.master, error)  // TODO: Show error message in UI
            })
    }
}

export function updatePhotoVersion(version: any) {  // Type should be `Version`, but it doesn't work...
    new Photo({ id: version.attributes.photo_id })
        .fetch({ withRelated: [ 'versions', 'tags' ] })
        .then(photoModel => {
            const photo = photoModel.toJSON()
            return onThumnailChange(photo.id)
                .then(() => {
                    const updatedPhoto = addVersionToPhoto(photo)
                    store.dispatch(changePhotosAction([ updatedPhoto ]))
                })
        })
}

export function toggleFlag(photo: PhotoType) {
    const newFlagged = !photo.flag

    storeFlagged(photo, newFlagged)

    new Photo({ id: photo.id })
        .save('flag', newFlagged, { patch: true })
        .then(() => new Photo({ id: photo.id })
            .fetch({ withRelated: [ 'versions', 'tags' ] })
        )
        .then(photoModel =>
            store.dispatch(changePhotosAction([ photoModel.toJSON() ]))
        )
}

export function setPhotosFlagged(photos: PhotoType[], flag: boolean) {
    Promise.each(photos, photo => {
        storeFlagged(photo, flag)
        return new Photo({ id: photo.id })
            .save('flag', flag, { patch: true })
    })
    .then(() => {
        const changedPhotos = photos.map(photo => ({ ...photo, flag }))
        store.dispatch(changePhotosAction(changedPhotos))
    })
}

function storeFlagged(photo: PhotoType, newFlagged: boolean) {
    updatePhotoWork(
        photo,
        photoWork => {
            if (newFlagged) {
                photoWork.flagged = true
            } else {
                delete photoWork.flagged
            }
        })
}

export function movePhotosToTrash(photos: PhotoType[]) {
    Promise.each(photos, photo => {
        return new Photo({ id: photo.id })
            .save('trashed', true, { patch: true })
    })
    .then(() => {
        const changedPhotos = photos.map(photo => ({ ...photo, trashed: 1 })) as PhotoType[]
        store.dispatch(changePhotosAction(changedPhotos))
    })
}
