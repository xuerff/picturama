import * as React from 'react'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import Toolbar from '../widget/Toolbar'
import AppState from '../../reducers/AppState'


interface ConnectProps {
    actions: any
}

interface Props extends ConnectProps {
    highlighted: number[]
    photosCount: number
}

class BottomBar extends React.Component<Props, undefined> {
    render() {
        return (
            <Toolbar className="bottom-bar">
                <div className="content">
                    <span className="selection">
                        <span>{this.props.highlighted.length} selected</span>
                        {this.props.highlighted.length > 0 &&
                            <button
                                className="deselect-all"
                                onClick={this.props.actions.clearHighlight}>
                                Deselect all
                            </button>
                        }
                    </span>
                    <span className="total">
                        {this.props.photosCount} item{this.props.photosCount > 1 ? 's' : ''}
                    </span>
                </div>
            </Toolbar>
        )
    }
}

export default connect<Props, {}, ConnectProps, AppState>((state, props) => ({
    ...props,
    highlighted: state.highlighted,
    photosCount: state.photosCount
}))(BottomBar);
