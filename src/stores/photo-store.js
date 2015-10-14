import alt from './../alt';

import PhotoActions from './../actions/photo-actions';

class PhotoStore {

  constructor() {
    this.bindActions(PhotoActions);
    this.photos = [];
    this.dates = [];
    this.currentDate = null;
    this.importing = false;
  }

  onGetPhotosSuccess(data) {
    let photos = data.toJSON();

    this.importing = false;
    this.photos = photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
        photo.versionNumber = 1 + photo.versions.length;

        let lastVersion = photo.versions.pop();

        photo.thumb = lastVersion.output;
        photo.thumb_250 = lastVersion.thumbnail;
      }

      return photo;
    });
  }

  onGetDatesSuccess(data) {
    var dates = { years: [] };
    this.dates = {};

    data.forEach(function(date) {
      let [ year, month, day ] = date.date.split('-');

      // Year
      if (dates.years.length === 0) {
        dates.years.push({ id: year, months: [] });

      } else {
        let foundYear = false;

        dates.years.forEach(function(dateYear) {
          if (dateYear.id == year)
            foundYear = true;
        });

        if (!foundYear)
          dates.years.push({ id: year, months: [] });
      }

      // Month
      dates.years = dates.years.map(function(dateYear) {
        if (dateYear.id == year) {
          if (dateYear.months.length === 0) {
            dateYear.months.push({ id: month, days: [] });

          } else {
            let foundMonth = false;

            dateYear.months.forEach(function(dateMonth) {
              if (dateMonth.id == month)
                foundMonth = true;
            });

            if (!foundMonth)
              dateYear.months.push({ id: month, days: [] });
          }
        }

        return dateYear;
      });

      // Day
      dates.years = dates.years.map(function(dateYear) {
        if (dateYear.id == year)
          dateYear.months.map(function(dateMonth) {
            if (dateMonth.id == month)
              dateMonth.days.push({ id: date.date });

            return dateMonth;
          });

        return dateYear;
      });
    });

    this.dates = dates;
    console.log('dates', dates);
  }

  //onSetDateFilterSuccess(photos) {
  //  this.photos = photos.toJSON();
  //}

  onUpdatedPhotoSuccess(photo) {
    let updatedPhoto = photo.toJSON();
    let lastVersion = {};

    if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
      var versionNumber = updatedPhoto.versions.length;
      lastVersion = updatedPhoto.versions.pop();
    }

    this.photos = this.photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.id == updatedPhoto.id) {
        photo = updatedPhoto;

        if (lastVersion) {
          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
          photo.versionNumber += versionNumber;
        }
      }

      return photo;
    });
  }

  onSetImport(value) {
    this.importing = true;
  }
}

export default alt.createStore(PhotoStore);
