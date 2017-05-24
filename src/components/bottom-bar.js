import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class BottomBar extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    highlighted: PropTypes.array.isRequired,
    photosCount: PropTypes.number.isRequired
  }

  render() {
    return (
      <div className="bottom-bar">
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
      </div>
    );
  }
}

export default connect(state => ({
  highlighted: state.highlighted,
  photosCount: state.photosCount
}))(BottomBar);
