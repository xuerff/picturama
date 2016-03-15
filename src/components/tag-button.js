import React from 'react';

export default class TagButton extends React.Component {
  static propTypes = {
    tag: React.PropTypes.object.isRequired,
    className: React.PropTypes.string.isRequired,
    setTag: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
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
