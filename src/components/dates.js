import React from 'react';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import DateYear from './date-year';

class Dates extends React.Component {

  constructor(props) {
    super(props);

    this.state = { dates: { years: [] }};
  }

  componentDidMount() {
    PhotoActions.getDates();
    PhotoStore.listen(this.appendDates.bind(this));
  }

  appendDates(data) {
    let state = this.state;

    state.dates = data.dates;
    state.currentDate = data.currentDate;

    this.setState(state);
  }

  handleDate(date) {
    let state = this.state;

    state.currentDate = date;
    PhotoActions.setDateFilter(date);
    this.setState(state);
  }

  render() {
    var dateYearsList = [];

    if (this.state.dates.years)
      dateYearsList = this.state.dates.years.map((year) => {
        return (
          <DateYear
            year={year}
            currentDate={this.state.currentDate}
            setDate={this.handleDate.bind(this)} />
        );
      });

    return (
      <div className="dates">
        <h3>
          <i className="fa fa-calendar"></i> Date Captured <i className="fa fa-angle-down"></i>
        </h3>

        <ul>{dateYearsList}</ul>
      </div>
    );
  }

}

export default Dates;
