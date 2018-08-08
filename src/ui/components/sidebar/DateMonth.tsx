import * as classNames from 'classnames'
import * as React from 'react'

import DateElement from './DateElement'

interface Props {
    month: { readonly id: string, readonly days: { readonly id: string }[] }
    currentDate: string
    onDateSelected: (date: string) => void
}

interface State {
    showDropdown: boolean
}

export default class DateMonth extends React.Component<Props, State> {

    constructor(props) {
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

        const dateElementsList = props.month.days.map(date =>
            <DateElement
                key={date.id}
                date={date.id}
                currentDate={props.currentDate}
                onDateSelected={props.onDateSelected}
            />
        )

        return (
            <li>
                <button className="month-dropdown" onClick={this.toggleDropdown}>
                    <i className={'fa ' + (state.showDropdown ? 'fa-angle-down' : 'fa-angle-right')}></i> {props.month.id}
                </button>

                <ul className={classNames('date-elements', { hide: state.showDropdown })}>{dateElementsList}</ul>
            </li>
        )
    }

}
