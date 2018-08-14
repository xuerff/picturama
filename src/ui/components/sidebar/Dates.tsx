import React from 'react'

import DateYear from './DateYear'


interface Props {
    dates: { readonly years: { readonly id: string, readonly months: { readonly id: string, readonly days: { readonly id: string }[] }[] }[] }
    currentDate: string
    fetchDates: () => void
    onDateSelected: (date: string) => void
}

export default class Dates extends React.Component<Props> {
    componentDidMount() {
        this.props.fetchDates()
    }

    render() {
        let dateYearsList = []

        if (this.props.dates.years) {
            dateYearsList = this.props.dates.years.map(year =>
                <DateYear
                    key={year.id}
                    year={year}
                    currentDate={this.props.currentDate}
                    onDateSelected={this.props.onDateSelected}
                />
            )
        }

        return (
            <div className="dates">
                <h3>
                    <i className="fa fa-calendar"></i> Date Captured
                </h3>

                <ul>{dateYearsList}</ul>
            </div>
        )
    }

}
