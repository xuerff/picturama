import React from 'react';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import DateElement from './date-element';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = { dates: [] };
  }

  componentDidMount() {
    PhotoActions.getDates();
    PhotoStore.listen(this.appendDates.bind(this));
  }

  appendDates(data) {
    this.setState({ dates: data.dates });
  }

  clearFilters() {
    PhotoActions.getPhotos();
  }

  handleDate(date) {
    PhotoActions.setDateFilter(date);
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

        <button onClick={this.clearFilters.bind(this)} className="mdl-button mdl-js-button">
          <i className="fa fa-book"></i> All content
        </button>

        <div className="date">
          <h3><i className="fa fa-calendar"></i> Date Captured</h3>
          <ul>{datesList}</ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
