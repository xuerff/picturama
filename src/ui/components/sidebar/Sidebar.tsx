import fs from 'fs'
import React from 'react'
import { connect } from 'react-redux'

import config from '../../../common/config'
import { PhotoFilter } from '../../../common/models/Photo'
import { TagId, TagType } from '../../../common/models/Tag'
import { bindMany } from '../../../common/util/LangUtil'

import { setLibraryFilter } from '../../controller/PhotoController'
import { fetchDates } from '../../controller/PhotoDateController'
import { fetchTags } from '../../controller/PhotoTagController'
import { AppState } from '../../state/reducers'
import Logo from '../widget/icon/Logo'
import Toolbar from '../widget/Toolbar'
import Tags from './Tags'
import Dates from './Dates'
import Devices from './Devices'

import './Sidebar.less'


let settings

if (fs.existsSync(config.settings))
    settings = require(config.settings)

const defaultMenuSettings = [ 'dates', 'tags' ]
// Don't show 'devices', since USB detection is deactivated in `src/background/entry.js`



interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    dates: { readonly years: { readonly id: string, readonly months: { readonly id: string, readonly days: { readonly id: string }[] }[] }[] }
    currentDate: string
    tags: TagType[]
    currentTagId: TagId
    devices: { readonly name: string }[]
}

interface DispatchProps {
    fetchDates: () => void
    fetchTags: () => void
    setLibraryFilter: (newFilter: PhotoFilter) => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

export class Sidebar extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onDateSelected', 'onTagSelected', 'showFlagged', 'showProcessed', 'showTrash', 'clearFilter')
    }

    onDateSelected(date: string) {
        this.props.setLibraryFilter({ mainFilter: { type: 'date', date }, showOnlyFlagged: false })
    }

    onTagSelected(tag: TagType) {
        this.props.setLibraryFilter({ mainFilter: { type: 'tag', tagId: tag.id }, showOnlyFlagged: false })
    }

    showFlagged() {
        this.props.setLibraryFilter({ mainFilter: null, showOnlyFlagged: true })
    }

    showProcessed() {
        this.props.setLibraryFilter({ mainFilter: { type: 'processed' }, showOnlyFlagged: false })
    }

    showTrash() {
        this.props.setLibraryFilter({ mainFilter: { type: 'trash' }, showOnlyFlagged: false })
    }

    clearFilter() {
        this.props.setLibraryFilter({ mainFilter: null, showOnlyFlagged: false })
    }

    render() {
        const props = this.props
        const menuSettings = settings && settings.menus ? settings.menus : defaultMenuSettings

        let menus = []
        menuSettings.forEach((menu, key) => {
            if (menu === 'dates') {
                menus.push(
                    <Dates
                        key={key}
                        dates={props.dates}
                        currentDate={props.currentDate}
                        fetchDates={props.fetchDates}
                        onDateSelected={this.onDateSelected}
                    />
                )
            } else if (menu === 'tags') {
                menus.push(
                    <Tags
                        key={key}
                        tags={props.tags}
                        currentTagId={props.currentTagId}
                        fetchTags={props.fetchTags}
                        onTagSelected={this.onTagSelected}
                    />
                )
            } else if (menu === 'devices') {
                menus.push(<Devices key={key} devices={props.devices} />)
            }
        })

        return (
            <div id="sidebar" className={props.className} style={props.style}>
                <Toolbar className="Sidebar-topBar"><Logo /> Library</Toolbar>

                <div className="sidebar-content">
                    <button
                        onClick={this.clearFilter}
                        className="button">
                        <i className="fa fa-book"></i> All content
                    </button>

                    <button
                        onClick={this.showFlagged}
                        className="button flagged">
                        <i className="fa fa-flag"></i> Flagged
                    </button>

                    <button
                        onClick={this.showProcessed}
                        className="button">
                        <i className="fa fa-pencil-square-o"></i> Processed
                    </button>

                    <button
                        onClick={this.showTrash}
                        className="button">
                        <i className="fa fa-trash-o"></i> Trash
                    </button>

                    {menus}
                </div>
            </div>
        )
    }

}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const mainFilter = state.library.filter.mainFilter
        return {
            ...props,
            dates: state.data.dates,
            currentDate: (mainFilter && mainFilter.type === 'date') ? mainFilter.date : null,
            tags: state.data.tags,
            currentTagId: (mainFilter && mainFilter.type === 'tag') ? mainFilter.tagId : null,
            devices: state.data.devices
        }
    },
    dispatch => ({
        fetchDates,
        fetchTags,
        setLibraryFilter
    })
)(Sidebar)

export default Connected
