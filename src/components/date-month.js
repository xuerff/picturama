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

    var dateElementsList = this.props.month.days.map(function(date) {
      return (
        <DateElement
          setDate={handleDate}
          date={date.id} />
      )
    });

    return (
      <li>
        <div>{this.props.month.id}</div>
        <ul>{dateElementsList}</ul>
      </li>
    )
  }

}

export default DateMonth;
