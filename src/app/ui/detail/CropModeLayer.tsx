import React from 'react'
import classnames from 'classnames'


export interface Props {
    className?: any
}

export default class CropModeLayer extends React.Component<Props> {

    render() {
        const { props } = this
        return (
            <div className={classnames(props.className, 'CropModeLayer')}>   
            </div>
        )
    }

}
