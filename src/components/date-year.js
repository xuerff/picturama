import React from 'react';

import DateMonth from './date-month';

class DateYear extends React.Component {

  constructor(props) {
    super(props);

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.getBtnClasses = this.getBtnClasses.bind(this);

    this.state = { showDropdown: false };
  }

  handleDate(date) {
    this.props.setDate(date);
  }

  toggleDropdown() {
    this.setState({
      showDropdown: (!this.state.showDropdown)
    });
  }

  getClasses() {
    console.log('get class', this.state.showDropdown);
    return (this.state.showDropdown) ? '' : 'hide';
  }

  getBtnClasses() {
    return 'fa ' + ((this.state.showDropdown) ? 'fa-angle-down' : 'fa-angle-right');
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
        <button className="year-dropdown" onClick={this.toggleDropdown}>
          <i className={this.getBtnClasses()}></i> {this.props.year.id}
        </button>

        <ul className={this.getClasses()}>{dateMonthsList}</ul>
      </li>
    )
  }

}

export default DateYear;
