import React from 'react';

import PhotoStore from './../stores/photo-store';
import TagStore from './../stores/tag-store';
import DeviceStore from './../stores/device-store';

import PhotoActions from './../actions/photo-actions';
import TagActions from './../actions/tag-actions';

import DateYear from './date-year';
import TagButton from './tag-button';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);

    this.state = { 
      dates: { years: [] }, 
      devices: [],
      currentDate: null, 
      currentTag: null,
      tags: [] 
    };
  }

  componentDidMount() {
    PhotoActions.getDates();
    TagActions.getTags();
    PhotoStore.listen(this.appendDates.bind(this));
    TagStore.listen(this.appendTags.bind(this));
    DeviceStore.listen(this.appendDevices.bind(this));
  }

  appendDevices(data) {
    console.log('append devices', data);
    let state = this.state;
    state.devices = data.devices;
    this.setState(state);
  }

  appendDates(data) {
    let state = this.state;
    state.dates = data.dates;
    this.setState(state);
  }

  appendTags(data) {
    console.log('append tags', data);
    let state = this.state;
    state.tags = data.tags;
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

  handleTag(tag) {
    let state = this.state;
    state.currentTag = tag;

    PhotoActions.setTagFilter(tag);
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

    var tagsList = this.state.tags.map((tag) => {
      return (
        <TagButton 
          setTag={this.handleTag.bind(this)} 
          tag={tag} />
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

          <div className="tags">
            <h3><i className="fa fa-tags"></i> Tags</h3>
            <ul>{tagsList}</ul>
          </div>

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
