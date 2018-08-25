import Photo, { PhotoId, PhotoSectionId } from '../../common/models/Photo'
import Tag from '../../common/models/Tag'
import { assertRendererProcess } from '../../common/util/ElectronUtil'

import { fetchTagsAction, setPhotoTagsAction } from '../state/actions'
import store from '../state/store'
import { fetchTags as fetchTagsFromDb, setPhotoTags as setPhotoTagsInDb } from '../BackgroundClient'


assertRendererProcess()

export function fetchTags() {
    fetchTagsFromDb()
        .then(tags => {
            store.dispatch(fetchTagsAction(tags))
        })
}


export async function setPhotoTags(photoId: PhotoId, tags: string[]) {
    store.dispatch(setPhotoTagsAction(photoId, tags))

    const updatedTags = await setPhotoTagsInDb(photoId, tags)

    if (updatedTags) {
        store.dispatch(fetchTagsAction(updatedTags))
    }
}
