import React from 'react'

import { TagType } from '../../../common/models/Tag'


interface Props {
    className: any
    tag: TagType
    onTagSelected: (tag: TagType) => void
}

export default class TagButton extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.onTagSelected(this.props.tag)
    }

    render() {
        return (
            <li>
                <button
                    onClick={this.handleClick}
                    className={this.props.className}>
                    <i className="fa fa-tag"></i> {this.props.tag.title}
                </button>
            </li>
        )
    }

}
