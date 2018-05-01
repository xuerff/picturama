import * as classNames from 'classnames'
import * as React from 'react'

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
            <div id={props.id} className={classNames(props.className, "Toolbar")} style={props.style}>
                {props.children}
            </div>
        )
    }
}

export default Toolbar
