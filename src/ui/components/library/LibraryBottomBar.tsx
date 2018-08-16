import classNames from 'classnames'
import React from 'react'

import Toolbar from '../widget/Toolbar'

import './LibraryBottomBar.less'


interface Props {
    className?: any
    highlightedCount: number
    photosCount: number
    clearHighlight: () => void
}

export default class LibraryBottomBar extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryBottomBar')}>
                <div className="LibraryBottomBar-content">
                    <span className="LibraryBottomBar-selection">
                        <span>{props.highlightedCount} selected</span>
                        {props.highlightedCount > 0 &&
                            <button
                                className="LibraryBottomBar-deselectAll"
                                onClick={props.clearHighlight}>
                                Deselect all
                            </button>
                        }
                    </span>
                    <span className="LibraryBottomBar-total">
                        {this.props.photosCount} item{this.props.photosCount > 1 ? 's' : ''}
                    </span>
                </div>
            </Toolbar>
        )
    }
}
