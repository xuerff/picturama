import React from 'react';

import DateElement from './date-element';

class DateMonth extends React.Component {

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
    return 'date-elements' + ((this.state.showDropdown) ? '' : ' hide');
  }

  getBtnClasses() {
    return 'fa ' + ((this.state.showDropdown) ? 'fa-angle-down' : 'fa-angle-right');
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
      );
    });

    return (
      <li>
        <button className="month-dropdown" onClick={this.toggleDropdown}>
          <i className={this.getBtnClasses()}></i> {this.props.month.id}
        </button>

        <ul className={this.getClasses()}>{dateElementsList}</ul>
      </li>
    );
  }

}

export default DateMonth;
