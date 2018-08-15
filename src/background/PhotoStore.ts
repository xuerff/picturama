import DB from 'sqlite3-helper'

import { PhotoId, PhotoType, PhotoDetail, PhotoFilter, PhotoSection } from '../common/models/Photo'
import { TagType } from '../common/models/Tag'
import { VersionType } from '../common/models/Version'


export async function fetchSections(filter: PhotoFilter): Promise<PhotoSection[]> {
    const mainFilter = filter.mainFilter

    let where = 'trashed = ?'
    let params: any[] = [
        (mainFilter && mainFilter.type === 'trash') ? 1 : 0  // trashed
    ]

    if (mainFilter && mainFilter.type === 'tag') {
        where += ' and id in (select photo_id from photos_tags where tag_id = ?)'
        params.push(mainFilter.tagId)
    } else if (mainFilter && mainFilter.type === 'date') {
        where += ' and date = ?'
        params.push(mainFilter.date)
    }

    if (filter.showOnlyFlagged) {
        where += ' and flag = 1'
    }
    
    const sql = `select date as id, date as title, count(*) as count from photos where ${where} group by date order by date desc`
    return await DB().query<PhotoSection>(sql, ...params)
}


export async function fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
    const [ tags, versions ] = await Promise.all([
        DB().query<TagType>('select * from tags where id in (select tag_id from photos_tags where photo_id = ?) order by slug', photoId),
        DB().query<VersionType>('select * from versions where photo_id = ? order by version', photoId)
    ])

    return { tags, versions } as PhotoDetail

    // TODO
    //const lastVersion = photo.versions[photo.versions.length - 1]
    //photo.non_raw = lastVersion.output || photo.non_raw
}


export async function updatePhotos(photoIds: PhotoId[], update: Partial<PhotoType>): Promise<void> {
    await Promise.all(photoIds.map(photoId =>
        DB().update<PhotoType>('photos', update, photoId)
    ))
}
