import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { Sidebar } from '../../ui/components/sidebar/Sidebar'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '285px', height: '100%' },
    isActive: true,

    photos: { [testPhoto.id]: testPhoto },
    photoIds: [ testPhoto.id ],
    photosCount: 1042,
    highlightedPhotoIds: [],
    showOnlyFlagged: false,
    isShowingTrash: false,

    dates: {
        years: [
            {
                id: 'Invalid date',
                months: [
                    {
                        id: 'Invalid date',
                        days: [
                            { id: 'Invalid date' }
                        ]
                    }
                ]
            },
            {
                id: '2018',
                months: [
                    {
                        id: '07',
                        days: [
                            { id: '2018-07-14'},
                            { id: '2018-07-06' },
                            { id: '2018-07-03' },
                            { id: '2018-07-01' }
                        ]
                    },
                    {
                        id: '05',
                        days: [
                            { id: '2018-05-18' },
                            { id: '2018-05-08' },
                            { id: '2018-05-04' }
                        ]
                    }
                ]
            },
            {
                id: '2017',
                months: [
                    {
                        id: '12',
                        days: [
                            { id: '2017-12-23' },
                            { id: '2017-12-22' },
                            { id: '2017-12-16' },
                            { id: '2017-12-11' }
                        ]
                    }
                ]
            }
        ]
    },
    currentDate: '2018-07-06',
    tags: [],
    currentTagId: null,
    devices: [],

    fetchDates: action('fetchDates'),
    fetchTags: action('fetchTags'),
    setPhotosFilter: action('setPhotosFilter'),
}


addSection('Sidebar')
    .add('normal', context => (
        <Sidebar
            {...defaultProps}
        />
    ))
