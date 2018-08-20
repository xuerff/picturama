import React from 'react'

import { addSection, action } from '../core/UiTester'
import { testPhoto, testPanoramaPhoto, testUprightPhoto } from '../util/MockData'
import { createSection, createRandomDummyPhoto, createLayoutForSection } from '../util/TestUtil'

import CancelablePromise from '../../common/util/CancelablePromise'
import { PhotoType, PhotoSectionId } from '../../common/models/Photo'

import { defaultGridRowHeight } from '../../ui/UiConstants'
import GridSection from '../../ui/components/library/GridSection'
import { getNonRawImgPath } from '../../ui/controller/ImageProvider'
import { estimateContainerHeight, createDummyLayoutBoxes } from '../../ui/controller/LibraryController'


const containerWidth = 800
const scrollBarWidth = 20
const viewportWidth = containerWidth - scrollBarWidth

const defaultSectionId: PhotoSectionId = '2018-08-15'
const defaultPhotos = [ testPhoto, testUprightPhoto, testPanoramaPhoto ]
const defaultSection = createSection(defaultSectionId, defaultPhotos)
const defaultLayout = createLayoutForSection(defaultSection, 0, viewportWidth, defaultGridRowHeight)


const defaultProps = {
    section: defaultSection,
    layout: defaultLayout,
    selectedPhotoIds: null,
    getThumbnailSrc: (photo: PhotoType) => getNonRawImgPath(photo),
    createThumbnail: (sectionId: PhotoSectionId, photo: PhotoType) => {
        const thumbnailPath = getNonRawImgPath(photo)
        if (thumbnailPath === 'dummy') {
            return new CancelablePromise<string>(() => {})
        } else {
            return new CancelablePromise<string>(Promise.resolve(thumbnailPath))
        }
    },
    onPhotoClick: action('onPhotoClick'),
    onPhotoDoubleClick: action('onPhotoDoubleClick'),
}


addSection('GridSection')
    .setArenaStyle({ width: containerWidth, padding: 0, backgroundColor: '#cfd8dc', overflowY: 'auto' })
    .add('normal', context => (
        <GridSection
            {...defaultProps}
        />
    ))
    .add('selection', context => (
        <GridSection
            {...defaultProps}
            selectedPhotoIds={[ testUprightPhoto.id ]}
        />
    ))
    .add('creating thumbnails', context => {
        let photos = [ ...defaultPhotos ]
        for (let i = 0; i < 20; i++) {
            photos.push(createRandomDummyPhoto())
        }
        photos[0] = { ...photos[0], id: photos[0] + '_dummy', master: 'dummy' }
        const section = createSection(defaultSectionId, photos)
        const layout = createLayoutForSection(section, 0, viewportWidth, defaultGridRowHeight)

        return (
            <GridSection
                {...defaultProps}
                section={section}
                layout={layout}
            />
        )
    })
    .add('loading section data', context => {
        const photoCount = 14
        const containerHeight = estimateContainerHeight(viewportWidth, defaultGridRowHeight, photoCount)
        return (
            <GridSection
                {...defaultProps}
                section={{
                    id: defaultSectionId,
                    title: defaultSectionId,
                    count: 14
                }}
                layout={{
                    sectionTop: 0,
                    containerHeight,
                    fromBoxIndex: 0,
                    toBoxIndex: photoCount,
                    boxes: createDummyLayoutBoxes(viewportWidth, defaultGridRowHeight, containerHeight, photoCount)
                }}
                selectedPhotoIds={null}
            />
        )
    })


    createDummyLayoutBoxes