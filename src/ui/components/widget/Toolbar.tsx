import classNames from 'classnames'
import React from 'react'

interface Props {
    id?: string
    className?: any
    style?: any
    children?: any
}

class Toolbar extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <div id={props.id} className={classNames(props.className, "Toolbar bp3-dark")} style={props.style}>
                {props.children}
            </div>
        )
    }
}

export default Toolbar
