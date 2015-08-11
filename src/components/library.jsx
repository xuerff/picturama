var React = require('react');
var Photo = require('./../models/photo');
var Picture = require('./picture.jsx');
var PictureDetail = require('./picture-detail.jsx');

var Library = React.createClass({
  handleCurrent: function(photo) {
    var state = this.state;
    state.current = photo;
    this.setState(state);
  },

  getInitialState: function() {
    return { photos: [], current: null };
  },

  componentDidMount: function() {
    var self = this;

    new Photo().fetchAll().then(function(photos) {
      console.log('photos', photos.toJSON());
      self.setState({ photos: photos.toJSON() });
    });
  },

  render: function() {
    var currentView;
    var handleCurrent = this.handleCurrent;
    console.log('current photo', this.state.current);

    if (!this.state.current)
      currentView = this.state.photos.map(function(photo) {
        return (
          <Picture photo={photo} setCurrent={handleCurrent} />
        );
      });
    else
      currentView = <PictureDetail photo={this.state.current} setCurrent={handleCurrent} />;

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
});

module.exports = Library;
