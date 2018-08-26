import { PhotoType } from '../../common/models/Photo'
import { assertRendererProcess } from '../../common/util/ElectronUtil'
import { slug } from '../../common/util/LangUtil'

import { fetchTagsAction, setPhotoTagsAction } from '../state/actions'
import store from '../state/store'
import { fetchTags as fetchTagsFromDb, setPhotoTags as setPhotoTagsInDb } from '../BackgroundClient'
import { updatePhotoWork } from './PhotoController'


assertRendererProcess()

export function fetchTags() {
    fetchTagsFromDb()
        .then(tags => {
            store.dispatch(fetchTagsAction(tags))
        })
}


export async function setPhotoTags(photo: PhotoType, tags: string[]) {
    tags.sort((tag1, tag2) => slug(tag1) < slug(tag2) ? -1 : 1)

    store.dispatch(setPhotoTagsAction(photo.id, tags))

    const updatedTags = await setPhotoTagsInDb(photo.id, tags)

    if (updatedTags) {
        store.dispatch(fetchTagsAction(updatedTags))
    }

    updatePhotoWork(photo, photoWork => photoWork.tags = tags)
}
