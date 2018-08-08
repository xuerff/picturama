import * as fs from 'fs'
import * as React from 'react'
import { connect } from 'react-redux'

import Tags from './Tags'
import Dates from './Dates'
import Devices from './Devices'
import Logo from '../widget/icon/Logo'
import Toolbar from '../widget/Toolbar'
import config from '../../config'
import { setPhotosFilter } from '../../data/PhotoStore'
import { fetchDates } from '../../data/PhotoDateStore'
import { fetchTags } from '../../data/PhotoTagStore'
import { TagId, TagType } from '../../models/Tag'
import { AppState } from '../../state/reducers'
import { FilterState } from '../../state/reducers/library'
import { bindMany } from '../../util/LangUtil'


let settings

if (fs.existsSync(config.settings))
    settings = require(config.settings)

const defaultMenuSettings = [ 'dates', 'tags' ]
// Don't show 'devices', since USB detection is deactivated in `browser.js`



interface OwnProps {
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
    setPhotosFilter: (newFilter: FilterState) => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

export class Sidebar extends React.Component<Props> {

    constructor(props) {
        super(props)
        bindMany(this, 'onDateSelected', 'onTagSelected', 'showFlagged', 'showProcessed', 'showTrash', 'clearFilter')
    }

    onDateSelected(date: string) {
        this.props.setPhotosFilter({ mainFilter: { type: 'date', date }, showOnlyFlagged: false })
    }

    onTagSelected(tag: TagType) {
        this.props.setPhotosFilter({ mainFilter: { type: 'tag', tagId: tag.id }, showOnlyFlagged: false })
    }

    showFlagged() {
        this.props.setPhotosFilter({ mainFilter: null, showOnlyFlagged: true })
    }

    showProcessed() {
        this.props.setPhotosFilter({ mainFilter: { type: 'processed' }, showOnlyFlagged: false })
    }

    showTrash() {
        this.props.setPhotosFilter({ mainFilter: { type: 'trash' }, showOnlyFlagged: false })
    }

    clearFilter() {
        this.props.setPhotosFilter({ mainFilter: null, showOnlyFlagged: false })
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
            <div id="sidebar" className={props.className}>
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
    (state, props) => {
        const mainFilter = state.library.filter.mainFilter
        return {
            ...props,
            dates: state.library.dates,
            currentDate: (mainFilter && mainFilter.type === 'date') ? mainFilter.date : null,
            tags: state.library.tags,
            currentTagId: (mainFilter && mainFilter.type === 'tag') ? mainFilter.tagId : null,
            devices: state.library.devices
        }
    },
    dispatch => ({
        fetchDates,
        fetchTags,
        setPhotosFilter
    })
)(Sidebar)

export default Connected
