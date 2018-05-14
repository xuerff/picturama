import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import * as PropTypes from 'prop-types'

import Toolbar from '../widget/Toolbar'
import AppState from '../../reducers/AppState'
import { bindMany } from '../../util/LangUtil'

const dialog = remote.dialog;


interface Props {
    className?: any
    currentDate: string | null
    showOnlyFlagged: boolean
    isShowingTrash: boolean
    actions: any
}

export default class LibraryTopBar extends React.Component<Props, undefined> {

    constructor(props) {
        super(props)

        bindMany(this, 'showSidebar', 'toggleFlagged', 'deleteModal')
    }

    showSidebar() {
        window.dispatchEvent(new Event('core:toggleSidebar'))
    }

    toggleFlagged() {
        this.props.actions.toggleFlagged(
            this.props.currentDate,
            !this.props.showOnlyFlagged
        )
    }

    deleteModal() {
        dialog.showMessageBox({
            type: 'question',
            message: 'Are you sure you want to empty the trash?',
            buttons: [ 'Move picture(s) to trash', 'Cancel' ]
        }, index => {
            if (index === 0) {
                ipcRenderer.send('empty-trash', true)
            }
        })
    }

    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <button className="LibraryTopBar-showSidebar" onClick={this.showSidebar}>
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </button>

                <div className="pull-right">
                    {this.props.isShowingTrash &&
                        <button
                            onClick={this.deleteModal}
                            className="button">
                            <i className="fa fa-trash" aria-hidden="true"></i>
                        </button>
                    }
                    <button
                        className={classNames('LibraryTopBar-toggleFlagged', { active: props.showOnlyFlagged })}
                        onClick={this.toggleFlagged}
                    >
                        <i className="fa fa-flag" aria-hidden="true"></i>
                    </button>
                </div>
            </Toolbar>
        )
    }
}
