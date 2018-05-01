import * as React from 'react'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

import Toolbar from '../widget/Toolbar'

class BottomBar extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    highlighted: PropTypes.array.isRequired,
    photosCount: PropTypes.number.isRequired
  }

  render() {
    return (
      <Toolbar className="bottom-bar">
        <div className="content">
          <span className="selection">
            <span>{this.props.highlighted.length} selected</span>
            {this.props.highlighted.length > 0 ?
                <button
                  className="deselect-all"
                  onClick={this.props.actions.clearHighlight}>
                  Deselect all
                </button>
            : ''}
          </span>
          <span className="total">
            {this.props.photosCount} item{this.props.photosCount > 1 ? 's' : ''}
          </span>
        </div>
      </Toolbar>
    );
  }
}

export default connect(state => ({
  highlighted: state.highlighted,
  photosCount: state.photosCount
}))(BottomBar);
