import React from 'react';

import DateMonth from './date-month';

class DateYear extends React.Component {

  constructor(props) {
    super(props);
  }

  handleDate(date) {
    this.props.setDate(date);
  }

  render() {
    var handleDate = this.handleDate.bind(this);
    var currentDate = this.props.currentDate;

    var dateMonthsList = this.props.year.months.map(function(month) {
      return (
        <DateMonth
          setDate={handleDate}
          currentDate={currentDate}
          month={month} />
      );
    });

    return (
      <li>
        <div>{this.props.year.id}</div>
        <ul>{dateMonthsList}</ul>
      </li>
    )
  }

}

export default DateYear;
