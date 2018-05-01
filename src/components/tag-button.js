import * as React from 'react'
import * as PropTypes from 'prop-types'

export default class TagButton extends React.Component {
  static propTypes = {
    tag: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    setTag: PropTypes.func.isRequired
  }

  handleClick() {
    this.props.setTag(this.props.tag);
  }

  render() {
    return (
      <li>
        <button
          onClick={this.handleClick.bind(this)}
          className={this.props.className}>
          <i className="fa fa-tag"></i> {this.props.tag.title}
        </button>
      </li>
    );
  }

}
