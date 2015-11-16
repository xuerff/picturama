import React from 'react';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import DateYear from './date-year';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = { dates: { years: [] }, currentDate: null };
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
    console.log(date);
    let state = this.state;

    state.currentDate = date;
    PhotoActions.setDateFilter(date);
    this.setState(state);
  }

  filterFlagged() {
    console.log('filter flagged');
    PhotoActions.getFlagged();
  }

  isActive(date) {
    return (date.date == this.state.currentDate) ? 'active' : '';
  }

  render() {
    var handleDate = this.handleDate.bind(this)
      , currentDate = this.state.currentDate;

    var dateYearsList = this.state.dates.years.map(function(year) {
      return (
        <DateYear
          year={year}
          currentDate={currentDate}
          setDate={handleDate} />
      );
    });

    return (
      <div id="sidebar">
        <h2><i className="fa fa-camera-retro"></i> Library</h2>

        <div className="sidebar-content">
          <button 
            onClick={this.clearFilters.bind(this)} 
            className="mdl-button mdl-js-button">
            <i className="fa fa-book"></i> All content
          </button>

          <button
            onClick={this.filterFlagged.bind(this)}
            className="mdl-button mdl-js-button flagged">
            <i className="fa fa-flag"></i> Flagged
          </button>

          <div className="dates">
            <h3>
              <i className="fa fa-calendar"></i> Date Captured <i class="fa fa-angle-down"></i>
            </h3>

            <ul>{dateYearsList}</ul>
          </div>

          <div className="tags">
            <h3><i className="fa fa-tags"></i> Tags</h3>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
