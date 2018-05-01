import * as classNames from 'classnames'
import * as React from 'react'

interface Props {
    className?: any
    style?: any
    name: string
}

class Icon extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <i
                className={classNames(props.className, `Icon fa fa-${props.name}`)}
                style={props.style}
            />
        )
    }
}

export default Icon
