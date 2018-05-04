import * as React from 'react'
import * as PropTypes from 'prop-types'

import DateElement from './date-element';

export default class DateMonth extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    setDate: PropTypes.func.isRequired,
    month: PropTypes.object.isRequired,
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
    return 'date-elements' + (this.state.showDropdown ? '' : ' hide');
  }

  getBtnClasses() {
    return 'fa ' + (this.state.showDropdown ? 'fa-angle-down' : 'fa-angle-right');
  }

  render() {
    const dateElementsList = this.props.month.days.map(date =>
      <DateElement
        actions={this.props.actions}
        setDate={this.handleDate.bind(this)}
        currentDate={this.props.currentDate}
        key={date.id}
        date={date.id} />
    );

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
