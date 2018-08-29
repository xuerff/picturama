import DB from 'sqlite3-helper/no-generators'

import { PhotoId } from '../../common/models/Photo'
import { TagType, TagId } from '../../common/models/Tag'
import { slug } from '../../common/util/LangUtil'
import SerialJobQueue from '../../common/util/SerialJobQueue'

import { toSqlStringCsv } from '../util/DbUtil'


type StorePhotoTagsJob = { photoId: PhotoId, photoTags: string[] }

const storePhotoTagsQueue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.photoId === existingJob.photoId) ? newJob : null,
    processNextStorePhotoTags)

let tagsHaveChanged = false
let tagsHaveBeenRemoved = false


export function fetchTags(): Promise<TagType[]> {
    return DB().query<TagType>('select * from tags order by slug')
}


export function storePhotoTags(photoId: PhotoId, photoTags: string[]): Promise<TagType[] | null> {
    return storePhotoTagsQueue.addJob({ photoId, photoTags })
}


async function processNextStorePhotoTags(job: StorePhotoTagsJob): Promise<TagType[] | null> {
    const { photoId, photoTags } = job
    const photoTagsSlugged = photoTags.map(tag => slug(tag))
    let updatedTags: TagType[] | null = null

    await DB().query('BEGIN')
    try {
        const existingTags = await DB().query<{ id: number, slug: string }>(`select id, slug from tags where slug in (${toSqlStringCsv(photoTagsSlugged)})`)
        const tagIdBySlug = {}
        for (const tagInfo of existingTags) {
            tagIdBySlug[tagInfo.slug] = tagInfo.id
        }

        const photoTagMappings: { photo_id: PhotoId, tag_id: TagId }[] = []
        for (let tagIndex = 0, tagCount = photoTags.length; tagIndex < tagCount; tagIndex++) {
            const tagSlugged = photoTagsSlugged[tagIndex]
            let tagId = tagIdBySlug[tagSlugged]
            if (!tagId) {
                tagId = await DB().insert('tags', {
                    title: photoTags[tagIndex],
                    slug: tagSlugged,
                    created_at: Date.now()
                })
                tagsHaveChanged = true
            }
            photoTagMappings.push({ photo_id: photoId, tag_id: tagId })
        }

        const deletedCount = (await DB().run('delete from photos_tags where photo_id = ?', photoId)).changes
        if (deletedCount != 0) {
            tagsHaveBeenRemoved = true
        }
        if (photoTagMappings.length > 0) {
            await DB().insert('photos_tags', photoTagMappings)
        }

        if (storePhotoTagsQueue.getQueueLength() === 0) {
            // Clean up obsolete tags
            if (tagsHaveBeenRemoved) {
                tagsHaveBeenRemoved = false
                const deletedCount = (await DB().run('delete from tags where id not in (select tag_id from photos_tags group by tag_id)')).changes
                if (deletedCount !== 0) {
                    tagsHaveChanged = true
                }
            }

            if (tagsHaveChanged) {
                tagsHaveChanged = false
                updatedTags = await fetchTags()
            }
        }

        await DB().query('END')
    } catch (error) {
        console.error('Setting tags for photo failed', error)
        await DB().query('ROLLBACK')
        throw error
    }

    return updatedTags
}
