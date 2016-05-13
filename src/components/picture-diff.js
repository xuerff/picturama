//import KeymapManager from 'atom-keymap';
import React from 'react';
import Loader from 'react-loader';

import keymapManager from './../keymap-manager';
import Photo from './../models/photo';

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDiff extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    photo: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.updateState = this.updateState.bind(this);
    //this.keyboardListener = this.keyboardListener.bind(this);
    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.onImgLoad = this.onImgLoad.bind(this);

    this.state = { 
      photo: { thumb: null }, 
      loaded: false,
      loadingCount: 0
    };
  }

  componentDidMount() {
    new Photo({ id: this.props.photo.id })
      .fetch({ withRelated: ['versions'] })
      .then(this.updateState);

    window.addEventListener('core:cancel', this.props.actions.toggleDiff);
    window.addEventListener('diff:cancel', this.props.actions.toggleDiff);

    keymapManager.bind(this.refs.diff);
  }

  updateState(photo) {
    let state = this.state;
    state.photo = photo.toJSON();
    console.log('updated state', state);
    this.setState(state);
  }

  onImgLoad() {
    let state = this.state;
    state.loadingCount++;

    if (state.loadingCount >= 2)
      state.loaded = true;

    this.setState(state);
  }

  componentWillUnmount() {
    window.removeEventListener('core:cancel', this.props.actions.toggleDiff);
    window.removeEventListener('diff:cancel', this.props.actions.toggleDiff);
    keymapManager.unbind();
  }

  bindEventListeners() {
    //document.addEventListener('keyup', this.keyboardListener);
  }

  unbindEventListeners() {
    //document.removeEventListener('keyup', this.keyboardListener);
  }

  //keyboardListener(e) {
  //  e.preventDefault();

  //  if ([27, 89].indexOf(e.keyCode) != -1) {
  //    this.unbindEventListeners();
  //    this.props.actions.toggleDiff();
  //  }
  //}

  render() {
    var last = { thumb: null };

    var className = [
      'shadow--2dp',
      rotation[this.props.photo.orientation]
    ].join(' ');

    if (this.state.photo.hasOwnProperty('versions'))
      last = this.state.photo.versions[this.state.photo.versions.length - 1];

    return (
      <div className="picture-diff" ref="diff">
        <div className="before v-align">
          <h3>Before</h3>
          <img
            src={this.state.photo.thumb} 
            onLoad={this.onImgLoad}
            className={className} />
        </div>

        <div className="after v-align">
          <h3>After</h3>
          <img
            src={last.output} 
            onLoad={this.onImgLoad}
            className={className} />
        </div>

        <Loader loaded={this.state.loaded} />
      </div>
    );
  }
}

export default PictureDiff;
