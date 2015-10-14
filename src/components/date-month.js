import React from 'react';

import DateElement from './date-element';

class DateMonth extends React.Component {

  constructor(props) {
    super(props);
  }

  handleDate(date) {
    this.props.setDate(date);
  }

  render() {
    var handleDate = this.handleDate.bind(this);
    var currentDate = this.props.currentDate;

    var dateElementsList = this.props.month.days.map(function(date) {
      return (
        <DateElement
          setDate={handleDate}
          currentDate={currentDate}
          date={date.id} />
      )
    });

    return (
      <li>
        <button className="month-dropdown">
          <i className="fa fa-angle-down"></i> {this.props.month.id}
        </button>

        <ul className="date-elements">{dateElementsList}</ul>
      </li>
    )
  }

}

export default DateMonth;
