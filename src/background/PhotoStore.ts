import DB from 'sqlite3-helper'

import { PhotoId, PhotoType, PhotoDetail } from '../common/models/Photo'
import { TagType } from '../common/models/Tag'
import { VersionType } from '../common/models/Version'


export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    const [ tags, versions ] = await Promise.all([
        DB().query<TagType>('select * from tags where id in (select tag_id from photos_tags where photo_id = ?) order by slug', photoId),
        DB().query<VersionType>('select * from versions where photo_id = ? order by version', photoId)
    ])

    return { tags, versions } as PhotoDetail

    // TODO
    //const lastVersion = photo.versions[photo.versions.length - 1]
    //photo.thumb = lastVersion.output || photo.thumb
}


export async function updatePhotos(photoIds: PhotoId[], update: Partial<PhotoType>): Promise<void> {
    await Promise.all(photoIds.map(photoId =>
        DB().update<PhotoType>('photos', update, photoId)
    ))
}
