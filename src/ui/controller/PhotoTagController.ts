import { PhotoType } from 'common/models/Photo'
import { TagType } from 'common/models/Tag'
import { assertRendererProcess } from 'common/util/ElectronUtil'
import { slug } from 'common/util/LangUtil'

import { fetchTagsAction, setPhotoTagsAction } from 'ui/state/actions'
import store from 'ui/state/store'
import { fetchTags as fetchTagsFromDb, storePhotoTags } from 'ui/BackgroundClient'

import { updatePhotoWork } from './PhotoController'


assertRendererProcess()


export function setTags(tags: TagType[]) {
    store.dispatch(fetchTagsAction(tags))
}


export function fetchTags() {
    fetchTagsFromDb()
        .then(tags => {
            setTags(tags)
        })
}


export async function setPhotoTags(photo: PhotoType, tags: string[]) {
    tags.sort((tag1, tag2) => slug(tag1) < slug(tag2) ? -1 : 1)

    store.dispatch(setPhotoTagsAction(photo.id, tags))

    const updatedTags = await storePhotoTags(photo.id, tags)

    if (updatedTags) {
        setTags(updatedTags)
    }

    updatePhotoWork(photo, photoWork => {
        if (!tags.length) {
            delete photoWork.tags
        } else {
            photoWork.tags = tags
        }
    })
}
