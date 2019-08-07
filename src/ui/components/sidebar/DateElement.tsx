import classNames from 'classnames'
import React from 'react'


interface Props {
    date: string
    currentDate: string | null
    onDateSelected: (date: string) => void
}

export default class DateElement extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        const props = this.props
        props.onDateSelected(props.date)
    }

    render() {
        const props = this.props
        return (
            <li className={classNames({ active: props.date === props.currentDate })}>
                <button onClick={this.handleClick} className="button">
                    <i className="fa fa-calendar-o"></i> {props.date}
                </button>
            </li>
        )
    }
}
