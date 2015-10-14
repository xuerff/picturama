import React from 'react';

import DateMonth from './date-month';

class DateYear extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var dateMonthsList = this.props.year.months.map(function(month) {
      console.log('month', month);
      return <DateMonth month={month} />;
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
