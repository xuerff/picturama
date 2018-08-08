import Photo from '../models/Photo'
import { DatesState } from '../state/reducers/library'
import store from '../state/store'
import { fetchDatesAction } from '../state/actions'
import { assertRendererProcess } from '../util/ElectronUtil'


assertRendererProcess()

export function fetchDates() {
    Photo.forge()
        .query()
        .distinct('date')
        .orderBy('date', 'desc')
        .then(dates => {
            store.dispatch(fetchDatesAction(processDates(dates as { date: string }[])))
        })
        // TODO: Error handling
}


function processDates(data: { date: string }[]): DatesState {
    let dates = { years: [] }

    data.forEach(date => {
        const [ year, month ] = date.date.split('-')

        // Year
        if (dates.years.length === 0) {
            dates.years.push({ id: year, months: [] })
        } else {
            let foundYear = false

            dates.years.forEach(dateYear => {
                if (dateYear.id === year) {
                    foundYear = true
                }
            })

            if (!foundYear) {
                dates.years.push({ id: year, months: [] })
            }
        }

        // Month
        dates.years = dates.years.map(dateYear => {
            if (dateYear.id === year) {
                if (dateYear.months.length === 0) {
                    dateYear.months.push({ id: month, days: [] })
                } else {
                    let foundMonth = false

                    dateYear.months.forEach(dateMonth => {
                        if (dateMonth.id === month)
                            foundMonth = true
                    })

                    if (!foundMonth) {
                        dateYear.months.push({ id: month, days: [] })
                    }
                }
            }

            return dateYear
        })

        // Day
        dates.years = dates.years.map(dateYear => {
            if (dateYear.id === year) {
                dateYear.months.map(dateMonth => {
                    if (dateMonth.id === month) {
                        dateMonth.days.push({ id: date.date })
                    }

                    return dateMonth
                })
            }

            return dateYear
        })
    })

    return dates
}
