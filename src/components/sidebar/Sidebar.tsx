import * as fs from 'fs'
import * as React from 'react'
import { connect } from 'react-redux'

import Tags from './Tags'
import Dates from './Dates'
import Devices from './Devices'
import Logo from '../widget/icon/Logo'
import Toolbar from '../widget/Toolbar'
import AppState from '../../reducers/AppState'

import config from '../../config'
import { TagId, TagType } from '../../models/Tag'
import { bindMany } from '../../util/LangUtil'


let settings

if (fs.existsSync(config.settings))
    settings = require(config.settings)

const defaultMenuSettings = [ 'dates', 'tags' ]
// Don't show 'devices', since USB detection is deactivated in `browser.js`



interface OwnProps {
    className?: any
    actions: any
}

interface StateProps {
    showOnlyFlagged: boolean
    dates: { readonly years: { readonly id: string, readonly months: { readonly id: string, readonly days: { readonly id: string }[] }[] }[] }
    currentDate: string
    tags: TagType[]
    currentTagId: TagId
    devices: { readonly name: string }[]
}

interface DispatchProps {
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

export class Sidebar extends React.Component<Props> {

    constructor(props) {
        super(props)
        bindMany(this, 'onDateSelected', 'onTagSelected')
    }

    onDateSelected(date: string) {
        const props = this.props
        props.actions.setDateFilter(
            date,
            props.showOnlyFlagged
        )
    }

    onTagSelected(tag: TagType) {
        this.props.actions.setTagFilter(tag)
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
                        fetchDates={props.actions.getDates}
                        onDateSelected={this.onDateSelected}
                    />
                )
            } else if (menu === 'tags') {
                menus.push(
                    <Tags
                        key={key}
                        tags={props.tags}
                        currentTagId={props.currentTagId}
                        fetchTags={props.actions.getTags}
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
                        onClick={props.actions.getPhotos}
                        className="button">
                        <i className="fa fa-book"></i> All content
                    </button>

                    <button
                        onClick={props.actions.getFlagged}
                        className="button flagged">
                        <i className="fa fa-flag"></i> Flagged
                    </button>

                    <button
                        onClick={props.actions.getProcessed}
                        className="button">
                        <i className="fa fa-pencil-square-o"></i> Processed
                    </button>

                    <button
                        onClick={props.actions.getTrashed}
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
    (state, props) => ({
        ...props,
        showOnlyFlagged: state.showOnlyFlagged,
        dates: state.dates,
        currentDate: state.currentDate,
        tags: state.tags,
        currentTagId: state.currentTag,
        devices: state.devices
    })
)(Sidebar)

export default Connected
