import React from 'react';
import PropTypes from 'prop-types';

import DateMonth from './date-month';

export default class DateYear extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    setDate: PropTypes.func.isRequired,
    year: PropTypes.object.isRequired,
    currentDate: PropTypes.string
  }

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
      showDropdown: !this.state.showDropdown
    });
  }

  getClasses() {
    return this.state.showDropdown ? '' : 'hide';
  }

  getBtnClasses() {
    return 'fa ' + (this.state.showDropdown ? 'fa-angle-down' : 'fa-angle-right');
  }

  render() {
    let dateMonthsList = this.props.year.months.map(month =>
      <DateMonth
        actions={this.props.actions}
        setDate={this.handleDate.bind(this)}
        currentDate={this.props.currentDate}
        key={this.props.year.id + month.id}
        month={month} />
    );

    return (
      <li>
        <button className="year-dropdown" onClick={this.toggleDropdown}>
          <i className={this.getBtnClasses()}></i> {this.props.year.id}
        </button>

        <ul className={this.getClasses()}>{dateMonthsList}</ul>
      </li>
    );
  }

}
