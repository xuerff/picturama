import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'
import classnames from 'classnames'

import { Settings } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { bindMany, cloneDeep } from 'common/util/LangUtil'

import BackgroundClient from 'ui/BackgroundClient'
import Toolbar from 'ui/components/widget/Toolbar'
import FaIcon from 'ui/components/widget/icon/FaIcon'
import List from 'ui/components/widget/List'
import { closeSettingsAction } from 'ui/state/actions'
import { AppState } from 'ui/state/reducers'

import './SettingsPane.less'


export interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    initialSettings: Settings
}

interface DispatchProps {
    selectDirectories(): Promise<string[] | undefined>
    onClose(settings: Settings, startImport: boolean): void
}

export interface Props extends OwnProps, StateProps, DispatchProps {}

interface State {
    settings: Settings
}

export class SettingsPane extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { settings: cloneDeep(props.initialSettings) }
        bindMany(this, 'onPhotoDirsChange', 'onAddPhotoDir', 'onClose', 'onCloseAndImport')
    }

    private onPhotoDirsChange(photoDirs: string[]) {
        this.setState({ settings: { ...this.state.settings, photoDirs } })
    }

    private onAddPhotoDir() {
        const { props, state } = this
        props.selectDirectories()
            .then(dirs => {
                if (dirs) {
                    const nextPhotoDirs = [ ...state.settings.photoDirs, ...dirs ]
                    nextPhotoDirs.sort()
                    this.setState({ settings: { ...state.settings, photoDirs: nextPhotoDirs } })
                }
            })
            .catch(error => {
                console.error('Selecting dirs failed', error)
            })
    }

    private onClose() {
        this.props.onClose(this.state.settings, false)
    }

    private onCloseAndImport() {
        this.props.onClose(this.state.settings, true)
    }

    render() {
        const { props, state } = this
        const { settings } = state
        return (
            <div className={classnames(props.className, 'SettingsPane')} style={props.style}>
                <Toolbar className="SettingsPane-topBar" isLeft={true}>
                    <Button onClick={this.onClose}>
                        <FaIcon name="chevron-left"/>
                        <span>{msg('common_backToLibrary')}</span>
                    </Button>
                </Toolbar>                
                <div className='SettingsPane-body'>
                    <div className='SettingsPane-content'>
                        <h1>{msg('Settings_title')}</h1>
                        {settings.photoDirs.length === 0 &&
                            <p>{msg('Settings_selectPhotoDirs')}</p>
                        }
                        {settings.photoDirs.length > 0 &&
                            <>
                                <p>{msg('Settings_photoDirs')}</p>
                                <List
                                    items={settings.photoDirs}
                                    renderItem={renderPhotoDir}
                                    onItemsChange={this.onPhotoDirsChange}
                                />
                            </>
                        }
                        <Button
                            className='SettingsPane-addPhotoDir'
                            text={msg('Settings_addPhotoDir')}
                            onClick={this.onAddPhotoDir}
                        />
                    </div>
                </div>
                <div className='SettingsPane-buttonBar'>
                    <Button
                        large={true}
                        text={msg('common_close')}
                        onClick={this.onClose}
                    />
                    <Button
                        large={true}
                        intent='primary'
                        text={msg('Settings_closeAndImport')}
                        onClick={this.onCloseAndImport}
                    />
                </div>
            </div>
        )
    }

}


function renderPhotoDir(photoDir: string): ReactNode {
    return photoDir
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => {
        return {
            ...props,
            initialSettings: state.data.settings
        }
    },
    dispatch => ({
        selectDirectories: BackgroundClient.selectDirectories,
        onClose(settings: Settings, startImport: boolean) {
            dispatch(closeSettingsAction(settings))
            BackgroundClient.storeSettings(settings)
                .then(() => {
                    if (startImport) {
                        BackgroundClient.startImport()
                    }
                })
                .catch(error => {
                    // TODO: Show in UI
                    console.error('Applying new settings failed', error)
                })
        },
    })
)(SettingsPane)

export default Connected
