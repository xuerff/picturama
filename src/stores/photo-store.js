import alt from './../alt';

import PhotoActions from './../actions/photo-actions';

class PhotoStore {
  constructor() {
    this.bindActions(PhotoActions);
    this.photos = [];
    this.dates = [];
    this.currentDate = null;
    this.importing = false;
    this.progress = {};
  }

  //onGetPhotosSuccess(data) {
  //  let photos = data.photos.toJSON();

  //  if (data.hasOwnProperty('date'))
  //    this.currentDate = data.date;
  //  else
  //    this.currentDate = null;

  //  this.importing = false;
  //  this.photos = photos.map(function(photo) {
  //    photo.versionNumber = 1;

  //    if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
  //      photo.versionNumber = 1 + photo.versions.length;

  //      let lastVersion = photo.versions[photo.versions.length - 1];

  //      photo.thumb = lastVersion.output;
  //      photo.thumb_250 = lastVersion.thumbnail;
  //    }

  //    return photo;
  //  });
  //}

  //onGetDatesSuccess(data) {
  //  var dates = { years: [] };
  //  this.dates = {};

  //  data.forEach((date) => {
  //    let [ year, month ] = date.date.split('-');

  //    // Year
  //    if (dates.years.length === 0) {
  //      dates.years.push({ id: year, months: [] });

  //    } else {
  //      let foundYear = false;

  //      dates.years.forEach((dateYear) => {
  //        if (dateYear.id == year)
  //          foundYear = true;
  //      });

  //      if (!foundYear)
  //        dates.years.push({ id: year, months: [] });
  //    }

  //    // Month
  //    dates.years = dates.years.map((dateYear) => {
  //      if (dateYear.id == year) {
  //        if (dateYear.months.length === 0) {
  //          dateYear.months.push({ id: month, days: [] });

  //        } else {
  //          let foundMonth = false;

  //          dateYear.months.forEach((dateMonth) => {
  //            if (dateMonth.id == month)
  //              foundMonth = true;
  //          });

  //          if (!foundMonth)
  //            dateYear.months.push({ id: month, days: [] });
  //        }
  //      }

  //      return dateYear;
  //    });

  //    // Day
  //    dates.years = dates.years.map((dateYear) => {
  //      if (dateYear.id == year)
  //        dateYear.months.map((dateMonth) => {
  //          if (dateMonth.id == month)
  //            dateMonth.days.push({ id: date.date });

  //          return dateMonth;
  //        });

  //      return dateYear;
  //    });
  //  });

  //  this.dates = dates;
  //}

  onUpdatedPhotoSuccess(photo) {
    let updatedPhoto = photo.toJSON();
    let lastVersion = null;

    if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
      var versionNumber = updatedPhoto.versions.length;
      lastVersion = updatedPhoto.versions.pop();
    }

    console.log('updated photo', updatedPhoto);

    this.photos = this.photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.id == updatedPhoto.id) {
        photo = updatedPhoto;

        if (lastVersion) {
          console.log('last version', lastVersion);
          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
          photo.versionNumber += versionNumber;
        }
      }

      return photo;
    });
  }

  //onSetImporting(isImporting) {
  //  console.log('on set importing', isImporting);
  //  this.importing = isImporting;
  //}

  //onSetImportProgress(progress) {
  //  console.log('on set import progress', progress);
  //  this.progress = progress;
  //}
}

export default alt.createStore(PhotoStore);
