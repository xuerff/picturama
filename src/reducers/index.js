import processDates from './../lib/process-dates';

const initialState = {
  importing: false,
  currentDate: null,
  photos: [],
  dates: { years: [] }
};

//const processDates = (data) => {
//  let dates = { years: [] };

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

//  return dates;
//};

export default function reducers(state = initialState, action) {
  switch (action.type) {
  case 'GET_PHOTOS_SUCCESS':
    return {
      ...state,
      currentDate: action.hasOwnProperty('date') ? action.date : null,
      photos: action.photos.map(function(photo) {
        photo.versionNumber = 1;

        if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
          photo.versionNumber = 1 + photo.versions.length;

          let lastVersion = photo.versions[photo.versions.length - 1];

          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
        }

        return photo;
      })
    };

  case 'GET_DATES_SUCCESS':
    return {
      ...state,
      dates: processDates(action.dates)
    };

  default:
    return state;
  }
}
