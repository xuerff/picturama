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

	clearFilters() {
		this.props.setDateFilter();
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
				<h2>Library</h2>

				<button onClick={this.clearFilters.bind(this)}>All content</button>

				<div className="date">
					<h3>Date Captured</h3>
					<ul>{datesList}</ul>
				</div>
      </div>
    );
  }
}

export default Sidebar;
