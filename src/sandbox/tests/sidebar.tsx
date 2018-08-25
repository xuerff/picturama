import React from 'react'

import {addSection, action} from '../core/UiTester'

import { TagId, TagById } from '../../common/models/Tag'
import { slug } from '../../common/util/LangUtil'

import { Sidebar } from '../../ui/components/sidebar/Sidebar'


const [ defaultTagIds, defaultTagById ] = createTestTags('Bla', 'Test')

const defaultProps = {
    style: { width: '300px', height: '100%' },

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
    tagIds: defaultTagIds,
    tagById: defaultTagById,
    currentTagId: null,
    devices: [],

    fetchDates: action('fetchDates'),
    fetchTags: action('fetchTags'),
    setLibraryFilter: action('setLibraryFilter'),
}


addSection('Sidebar')
    .add('normal', context => (
        <Sidebar
            {...defaultProps}
        />
    ))


function createTestTags(... tagNames: string[]): [ TagId[], TagById ] {
    var nextTagId = 1
    var ids: TagId[] = []
    var byId: TagById = {}
    for (const tagName of tagNames) {
        const tag = {
            id: nextTagId++,
            title: tagName,
            slug: slug(tagName),
            created_at: Date.now(),
            updated_at: null
        }
        ids.push(tag.id)
        byId[tag.id] = tag
    }
    return [ ids, byId ]
}
