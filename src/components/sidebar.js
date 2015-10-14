import React from 'react';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import DateElement from './date-element';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = { dates: [], currentDate: null };
  }

  componentDidMount() {
    PhotoActions.getDates();
    PhotoStore.listen(this.appendDates.bind(this));
  }

  appendDates(data) {
    let state = this.state;

    state.dates = data.dates;
    this.setState(state);
  }

  clearFilters() {
    let state = this.state;

    this.state.currentDate = null;
    this.setState(state);

    PhotoActions.getPhotos();
  }

  handleDate(date) {
    let state = this.state;

    state.currentDate = date;
    PhotoActions.setDateFilter(date);
    this.setState(state);
  }

  isActive(date) {
    return (date.date == this.state.currentDate) ? 'active' : '';
  }

  render() {
    var handleDate = this.handleDate.bind(this);
    var isActive = this.isActive.bind(this);

    var datesList = this.state.dates.map(function(date) {
      return (
        <DateElement
          date={date.date}
          active={isActive(date)}
          setDate={handleDate} />
      )
    });

    return (
      <div id="sidebar">
        <h2>Library</h2>

        <button onClick={this.clearFilters.bind(this)} className="mdl-button mdl-js-button">
          <i className="fa fa-book"></i> All content
        </button>

        <button className="mdl-button mdl-js-button flagged">
          <i className="fa fa-flag"></i> Flagged
        </button>

        <div className="dates">
          <h3><i className="fa fa-calendar"></i> Date Captured</h3>
          <ul>{datesList}</ul>
        </div>

        <div className="tags">
          <h3><i className="fa fa-tags"></i> Tags</h3>
        </div>
      </div>
    );
  }
}

export default Sidebar;
