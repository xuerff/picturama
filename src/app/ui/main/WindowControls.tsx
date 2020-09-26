import React from 'react'
import classnames from 'classnames'
import { remote } from 'electron'

import { bindMany } from 'common/util/LangUtil'

import SvgIcon from 'app/ui/widget/icon/SvgIcon'

import './WindowControls.less'


const currentWindow = remote.getCurrentWindow()


export interface Props {
    className?: any
}

export default class WindowControls extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onClose', 'onMaximize', 'onMinimize', 'onMaximizeChange')
    }

    componentDidMount() {
        currentWindow.on('maximize', this.onMaximizeChange)
        currentWindow.on('unmaximize', this.onMaximizeChange)
    }

    componentWillUnmount() {
        currentWindow.off('maximize', this.onMaximizeChange)
        currentWindow.off('unmaximize', this.onMaximizeChange)
    }

    private onClose() {
        currentWindow.close()
    }

    private onMaximize() {
        if (currentWindow.isMaximized()) {
            currentWindow.unmaximize()
        } else {
            currentWindow.maximize()
        }
    }

    private onMinimize() {
        currentWindow.minimize()
    }

    private onMaximizeChange() {
        this.forceUpdate()
    }

    render() {
        const { props } = this
        return (
            <div className={classnames(props.className, 'WindowControls')}>
                <div className='WindowControls-button' onClick={this.onMinimize}>
                    <SvgIcon size={10}>
                        <path d='M0,5.5l10,0'/>
                    </SvgIcon>
                </div>
                <div className='WindowControls-button' onClick={this.onMaximize}>
                    <SvgIcon size={10}>
                        <path d={currentWindow.isMaximized() ? 'M0.5,2.5l7,0l0,7l-7,0zM2.5,2.5l0,-2l7,0l0,7l-2,0' : 'M0.5,0.5l9,0l0,9l-9,0z'}/>
                    </SvgIcon>
                </div>
                <div className='WindowControls-button WindowControls-closeButton' onClick={this.onClose}>
                    <SvgIcon size={10}>
                        <path d='M0,0l10,10M0,10l10,-10'/>
                    </SvgIcon>
                </div>
            </div>
        )
    }

}
