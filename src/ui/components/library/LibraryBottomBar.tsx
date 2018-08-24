import classNames from 'classnames'
import React from 'react'
import { Slider } from '@blueprintjs/core'

import { minGridRowHeight, maxGridRowHeight } from '../../UiConstants'
import Toolbar from '../widget/Toolbar'

import './LibraryBottomBar.less'


interface Props {
    className?: any
    highlightedCount: number
    photosCount: number
    gridRowHeight: number
    clearHighlight: () => void
    setGridRowHeight: (gridRowHeight: number) => void
}

export default class LibraryBottomBar extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryBottomBar')} isTopBar={false}>
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
                <div className="LibraryBottomBar-center">
                    {this.props.photosCount} item{this.props.photosCount > 1 ? 's' : ''}
                </div>
                <div className="LibraryBottomBar-right">
                    <Slider
                        className="LibraryBottomBar-thumbSizeSlider"
                        value={props.gridRowHeight}
                        min={minGridRowHeight}
                        max={maxGridRowHeight}
                        labelRenderer={false}
                        showTrackFill={false}
                        onChange={props.setGridRowHeight}
                    />
                </div>
            </Toolbar>
        )
    }
}
