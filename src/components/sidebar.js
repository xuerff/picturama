import React from 'react';

import Photo from './../models/photo';

import DateElement from './date-element';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = { dates: [] };
  }

  componentDidMount() {
    Photo.getDates()
      .then(this.appendDates.bind(this))
      .catch(function(err) {
        console.log('err', err);
      });
  }

  appendDates(dates) {
    this.setState({ dates: dates });
  }

	handleDate(date) {
		this.props.setDateFilter(date);
	}

  render() {
		var handleDate = this.handleDate.bind(this);

    var datesList = this.state.dates.map(function(date) {
      return (
				<DateElement date={date.date} setDate={handleDate} />
      )
    });

    return (
      <div id="sidebar">
				<ul>{datesList}</ul>
      </div>
    );
  }
}

export default Sidebar;
