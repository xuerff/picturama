import React from 'react';

import Photo from './../models/photo';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDiff extends React.Component {

  constructor(props) {
    super(props);

    this.updateState = this.updateState.bind(this);

    this.state = { photo: { thumb: null } };
  }

  componentDidMount() {
    new Photo({ id: this.props.photo.id })
      .fetch({ withRelated: ['versions'] })
      .then(this.updateState);
  }

  updateState(photo) {
    let state = this.state;
    state.photo = photo.toJSON();
    console.log('updated state', state);
    this.setState(state);
  }

  render() {
    var last = { thumb: null };

    var className = [
      'mdl-shadow--2dp',
      rotation[this.props.photo.orientation]
    ].join(' ');

    if (this.state.photo.hasOwnProperty('versions'))
      last = this.state.photo.versions[this.state.photo.versions.length - 1];

    return (
      <div className="picture-diff">
        <div className="before v-align">
          <img
            src={this.state.photo.thumb} 
            className={className} />
        </div>

        <div className="after v-align">
          <img
            src={last.output} 
            className={className} />
        </div>
      </div>
    );
  }
}

export default PictureDiff;
