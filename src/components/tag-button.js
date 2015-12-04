import React from 'react';

class TagButton extends React.Component {

  constructor(props) {
    super(props);
  }

  handleClick() {
    this.props.setTag(this.props.tag);
  }

  render() {
    return (
      <li>
        <button onClick={this.handleClick.bind(this)}>
          <i className="fa fa-tag"></i> {this.props.tag.title}
        </button>
      </li>
    );
  }

}

export default TagButton;
