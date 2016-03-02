import React from 'react';

//import PhotoStore from './../stores/photo-store';
//import PhotoActions from './../actions/photo-actions';

import DateYear from './date-year';

class Dates extends React.Component {
  static propTypes = {
    dates: React.PropTypes.object.isRequired,
    //years: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired,
    currentDate: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.props.actions.getDates();
    //PhotoActions.getDates();
    //PhotoStore.listen(this.appendDates.bind(this));
  }

  //appendDates(data) {
  //  let state = this.state;

  //  state.dates = data.dates;
  //  state.currentDate = data.currentDate;

  //  this.setState(state);
  //}

  handleDate(date) {
    let state = this.state;

    state.currentDate = date;
    //PhotoActions.setDateFilter(date);
    this.setState(state);
  }

  render() {
    var dateYearsList = [];

    if (this.props.dates.years)
      dateYearsList = this.props.dates.years.map((year) => {
        return (
          <DateYear
            actions={this.props.actions}
            year={year}
            key={year.id}
            currentDate={this.props.currentDate}
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
