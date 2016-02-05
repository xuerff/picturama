import React from 'react';

import PhotoStore from './../stores/photo-store';
import DeviceStore from './../stores/device-store';

import PhotoActions from './../actions/photo-actions';

import DateYear from './date-year';
import Tags from './tags';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);

    this.state = { 
      dates: { years: [] }, 
      devices: [],
      currentDate: null
    };
  }

  componentDidMount() {
    PhotoActions.getDates();
    PhotoStore.listen(this.appendDates.bind(this));
    DeviceStore.listen(this.appendDevices.bind(this));
  }

  appendDevices(data) {
    let state = this.state;
    state.devices = data.devices;
    this.setState(state);
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

  filterFlagged() {
    PhotoActions.getFlagged();
  }

  isActive(date) {
    return (date.date == this.state.currentDate) ? 'active' : '';
  }

  render() {
    var handleDate = this.handleDate.bind(this)
      , currentDate = this.state.currentDate;

    var dateYearsList = [];

    if (this.state.dates.years)
      dateYearsList = this.state.dates.years.map(function(year) {
        return (
          <DateYear
            year={year}
            currentDate={currentDate}
            setDate={handleDate} />
        );
      });

    var devicesList = this.state.devices.map((device) => {
      return (
        <li>{device.name}</li>
      );
    });

    return (
      <div id="sidebar">
        <h2><i className="fa fa-camera-retro"></i> Library</h2>

        <div className="sidebar-content">
          <button 
            onClick={this.clearFilters.bind(this)} 
            className="button">
            <i className="fa fa-book"></i> All content
          </button>

          <button
            onClick={this.filterFlagged.bind(this)}
            className="button flagged">
            <i className="fa fa-flag"></i> Flagged
          </button>

          <div className="dates">
            <h3>
              <i className="fa fa-calendar"></i> Date Captured <i class="fa fa-angle-down"></i>
            </h3>

            <ul>{dateYearsList}</ul>
          </div>

          <Tags />

          <div className="devices">
            <h3><i className="fa fa-usb"></i> Devices</h3>
            <ul>{devicesList}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
