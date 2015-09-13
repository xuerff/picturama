import React from 'react';

class DateElement extends React.Component {

  constructor(props) {
    super(props);
  }

  handleClick() {
    this.props.setDate(this.props.date);
  }

  render() {
    return (
      <li>
        <button onClick={this.handleClick.bind(this)} className="mdl-button mdl-js-button">
          <i className="fa fa-calendar-o"></i> {this.props.date}
        </button>
      </li>
    )
  }
}

export default DateElement;
