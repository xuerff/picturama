var React = require('react');
var Photo = require('./../models/photo');
var Picture = require('./picture.jsx');

var Library = React.createClass({
  getInitialState: function() {
    return { photos: [] };
  },

  componentDidMount: function() {
    var self = this;

    new Photo().fetchAll().then(function(photos) {
      console.log('photos', photos.toJSON());
      self.setState({ photos: photos.toJSON() });
    });
  },

  render: function() {
    var pictures = this.state.photos.map(function(photo) {
      return (
        <Picture photo={photo} />
      );
    });

    return (
      <div id="library">
        {pictures}
      </div>
    );
  }
});

module.exports = Library;
