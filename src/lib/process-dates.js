export default function processDates(data) {
  let dates = { years: [] };

  data.forEach((date) => {
    let [ year, month ] = date.date.split('-');

    // Year
    if (dates.years.length === 0) {
      dates.years.push({ id: year, months: [] });

    } else {
      let foundYear = false;

      dates.years.forEach((dateYear) => {
        if (dateYear.id == year)
          foundYear = true;
      });

      if (!foundYear)
        dates.years.push({ id: year, months: [] });
    }

    // Month
    dates.years = dates.years.map((dateYear) => {
      if (dateYear.id == year) {
        if (dateYear.months.length === 0) {
          dateYear.months.push({ id: month, days: [] });

        } else {
          let foundMonth = false;

          dateYear.months.forEach((dateMonth) => {
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
    dates.years = dates.years.map((dateYear) => {
      if (dateYear.id == year)
        dateYear.months.map((dateMonth) => {
          if (dateMonth.id == month)
            dateMonth.days.push({ id: date.date });

          return dateMonth;
        });

      return dateYear;
    });
  });

  return dates;
}


