import React from 'react'

import { Photo, PhotoSectionById, PhotoSectionId } from 'common/CommonTypes'
import CancelablePromise from 'common/util/CancelablePromise'
import { getNonRawPath } from 'common/util/DataUtil'

import { defaultGridRowHeight } from 'ui/UiConstants'
import { GridLayout } from 'ui/UITypes'
import { sectionHeadHeight } from 'ui/components/library/GridSection'
import { Library, Props } from 'ui/components/library/Library'
import { LibraryFilterButton } from 'ui/components/library/LibraryFilterButton'
import ImportProgressButton from 'ui/components/ImportProgressButton'

import { addSection, action, TestContext } from 'sandbox/core/UiTester'
import { testLandscapePhoto, testPanoramaPhoto, testPhotos } from 'sandbox/util/MockData'
import { createRandomDummyPhoto, createSection, createLayoutForSection } from 'sandbox/util/TestUtil'


const defaultSectionId: PhotoSectionId = '2018-08-15'
const defaultPhotos = testPhotos
const defaultSection = createSection(defaultSectionId, defaultPhotos)

let sharedGridRowHeight = defaultGridRowHeight
    // Use the same gridRowHeight amoung all tests (so row height doesn't change when changing between tests)

function createDefaultProps(context: TestContext): Props {
    return {
        style: { width: '100%', height: '100%', overflow: 'hidden' },
        topBarLeftItem: (
            <LibraryFilterButton
                libraryFilter={{ mainFilter: null, showOnlyFlagged: false }}
                tagIds={[ 1, 2 ]}
                tagById={{
                    1: {
                        created_at: 1565357205167,
                        id: 1,
                        slug: 'flower',
                        title: 'Flower',
                        updated_at: null
                    },
                    2: {
                        created_at: 1565357205167,
                        id: 2,
                        slug: 'panorama',
                        title: 'Panorama',
                        updated_at: null
                    }
                }}
                devices={[]}
                fetchTags={action('fetchTags')}
                setLibraryFilter={action('setLibraryFilter')}
            />
        ),
        isActive: true,

        isFetching: false,

        photoCount: 1042,
        totalPhotoCount: 12345,
        sectionIds: [ defaultSectionId ],
        sectionById: {
            [defaultSectionId]: defaultSection
        } as PhotoSectionById,
        selectedSectionId: null,
        selectedPhotoIds: [],
        infoPhoto: null,
        infoPhotoDetail: null,
        tags: [ 'Flower', 'Panorama' ],
        gridRowHeight: sharedGridRowHeight,
        isShowingTrash: false,

        fetchTotalPhotoCount: action('fetchTotalPhotoCount'),
        fetchSections: action('fetchSections'),
        getGridLayout,
        getThumbnailSrc: (photo: Photo) => getNonRawPath(photo),
        createThumbnail: (sectionId: PhotoSectionId, photo: Photo) => {
            if (photo.master_filename === 'dummy') {
                return new CancelablePromise<string>(() => {})
            } else {
                return new CancelablePromise<string>(Promise.resolve(getNonRawPath(photo)))
            }
        },
        setGridRowHeight: (gridRowHeight: number) => {
            sharedGridRowHeight = gridRowHeight
            context.forceUpdate()
        },
        setSelectedPhotos: action('setSelectedPhotos'),
        setDetailPhotoById: action('setDetailPhotoById'),
        setInfoPhoto: action('setInfoPhoto'),
        openExport: action('openExport'),
        setPhotosFlagged: action('setPhotosFlagged'),
        setPhotoTags: action('setPhotoTags'),
        updatePhotoWork: action('updatePhotoWork'),
        movePhotosToTrash: action('movePhotosToTrash'),
        restorePhotosFromTrash: action('restorePhotosFromTrash'),
        startScanning: action('startScanning'),
    }
}


export function getGridLayout(sectionIds: PhotoSectionId[], sectionById: PhotoSectionById,
    scrollTop: number, viewportWidth: number, viewportHeight: number, gridRowHeight: number):
    GridLayout
{
    let sectionTop = 0
    const sectionLayouts = sectionIds.map(sectionId => {
        const section = sectionById[sectionId]
        const layout = createLayoutForSection(section, sectionTop, viewportWidth, gridRowHeight)
        sectionTop += sectionHeadHeight + layout.containerHeight
        return layout
    })

    return {
        fromSectionIndex: 0,
        toSectionIndex: sectionIds.length,
        sectionLayouts
    }
}


addSection('Library')
    .add('normal', context => (
        <Library
            {...createDefaultProps(context)}
        />
    ))
    .add('selection', context => (
        <Library
            {...createDefaultProps(context)}
            selectedSectionId={defaultSectionId}
            selectedPhotoIds={[ testLandscapePhoto.id ]}
            infoPhoto={testLandscapePhoto}
            infoPhotoDetail={{ versions:[], tags: [] }}
        />
    ))
    .add('panorama', context => {
        let photos = [ ...defaultPhotos ]
        photos.splice(2, 0, testPanoramaPhoto)
        const section = createSection(defaultSectionId, photos)

        return (
            <Library
                {...createDefaultProps(context)}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: section
                } as PhotoSectionById}
            />
        )
    })
    .add('scrolling', context => {
        const sectionIds: PhotoSectionId[] = []
        for (let i = 50; i > 0; i--) {
            const month = (i % 12) + 1
            const year = 2000 + Math.floor(i / 12)
            sectionIds.push(`${year}-${month < 10 ? '0' : ''}${month}-01`)
        }

        const sectionById: PhotoSectionById = {}
        const minPhotoCount = 2
        for (const sectionId of sectionIds) {
            const photos = randomizedArray(testPhotos)
            photos.splice(minPhotoCount, Math.floor(Math.random() * (photos.length - minPhotoCount)))
            sectionById[sectionId] = createSection(sectionId, photos)
        }

        return (
            <Library
                {...createDefaultProps(context)}
                sectionIds={sectionIds}
                sectionById={sectionById}
            />
        )
    })
    .add('importing', context => (
        <Library
            {...createDefaultProps(context)}
            bottomBarLeftItem={
                <ImportProgressButton
                    progress={{ processed: 120, total: 1042, photosDir: '/user/me/documents/mypics/2018/summer vacation' }}
                />
            }
        />
    ))
    .add('creating thumbnails', context => {
        let photos = [ ...defaultPhotos ]
        for (let i = 0; i < 100; i++) {
            photos.push(createRandomDummyPhoto())
        }
        photos = randomizedArray(photos)
        const section = createSection(defaultSectionId, photos)

        return (
            <Library
                {...createDefaultProps(context)}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: section
                } as PhotoSectionById}
            />
        )
    })
    .add('thumbnail error', context => {
        let photos = [ ...defaultPhotos ]
        const errorPhoto = createRandomDummyPhoto()
        errorPhoto.master_filename = 'error'
        photos.splice(1, 0, errorPhoto)
        const section = createSection(defaultSectionId, photos)

        return (
            <Library
                {...createDefaultProps(context)}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: section
                } as PhotoSectionById}
            />
        )
    })
    .add('Fetching sections', context => (
        <Library
            {...createDefaultProps(context)}
            isFetching={true}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('Selection empty', context => (
        <Library
            {...createDefaultProps(context)}
            photoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('No photos', context => (
        <Library
            {...createDefaultProps(context)}
            photoCount={0}
            totalPhotoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('Trash with selection', context => (
        <Library
            {...createDefaultProps(context)}
            isShowingTrash={true}
            selectedSectionId={defaultSectionId}
            selectedPhotoIds={[ testLandscapePhoto.id ]}
            infoPhoto={testLandscapePhoto}
            infoPhotoDetail={{ versions:[], tags: [] }}
        />
    ))
    .add('Trash - no photos', context => (
        <Library
            {...createDefaultProps(context)}
            isShowingTrash={true}
            photoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))


function randomizedArray<T>(array: T[]): T[] {
    const remaining = [ ...array ]
    const result: T[] = []
    while (remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        result.push(remaining.splice(randomIndex, 1)[0])
    }
    return result
}
