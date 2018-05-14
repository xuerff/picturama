import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import Toolbar from '../widget/Toolbar'
import AppState from '../../reducers/AppState'


interface Props {
    className?: any
    highlighted: number[]
    photosCount: number
    actions: any
}

export default class LibraryBottomBar extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryBottomBar')}>
                <div className="LibraryBottomBar-content">
                    <span className="LibraryBottomBar-selection">
                        <span>{this.props.highlighted.length} selected</span>
                        {this.props.highlighted.length > 0 &&
                            <button
                                className="LibraryBottomBar-deselectAll"
                                onClick={this.props.actions.clearHighlight}>
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
