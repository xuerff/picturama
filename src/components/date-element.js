import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class DateElement extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    showOnlyFlagged: PropTypes.bool.isRequired,
    currentDate: PropTypes.string,
    date: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.isActive.bind(this);
  }

  handleClick() {
    this.props.actions.setDateFilter(
      this.props.date,
      this.props.showOnlyFlagged
    );
  }

  isActive(date) {
    return date === this.props.currentDate ? 'active' : '';
  }

  render() {
    return (
      <li className={this.isActive(this.props.date)}>
        <button onClick={this.handleClick.bind(this)} className="button">
          <i className="fa fa-calendar-o"></i> {this.props.date}
        </button>
      </li>
    );
  }
}

const ReduxDateElement = connect(state => ({
  showOnlyFlagged: state.showOnlyFlagged
}))(DateElement);

export default ReduxDateElement;
export { DateElement };
