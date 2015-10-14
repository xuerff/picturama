import React from 'react';

import DateElement from './date-element';

class DateMonth extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var dateElementsList = this.props.month.days.map(function(date) {
      return (
        <DateElement
          date={date} />
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
