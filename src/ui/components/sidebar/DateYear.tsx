import classNames from 'classnames'
import React from 'react'

import DateMonth from './DateMonth'


interface Props {
    year: { readonly id: string, readonly months: { readonly id: string, readonly days: { readonly id: string }[] }[] }
    currentDate: string
    onDateSelected: (date: string) => void
}

interface State {
    showDropdown: boolean
}

export default class DateYear extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.toggleDropdown = this.toggleDropdown.bind(this)

        this.state = { showDropdown: false }
    }

    toggleDropdown() {
        this.setState({
            showDropdown: !this.state.showDropdown
        })
    }

    render() {
        const props = this.props
        const state = this.state

        let dateMonthsList = props.year.months.map(month =>
            <DateMonth
                key={props.year.id + month.id}
                currentDate={props.currentDate}
                month={month}
                onDateSelected={props.onDateSelected}
            />
        )

        return (
            <li>
                <button className="year-dropdown" onClick={this.toggleDropdown}>
                    <i className={'fa ' + (state.showDropdown ? 'fa-angle-down' : 'fa-angle-right')}></i> {props.year.id}
                </button>

                <ul className={classNames({ hide: !state.showDropdown })}>{dateMonthsList}</ul>
            </li>
        )
    }

}
