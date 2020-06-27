import React, { ReactNode } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, NonIdealState } from '@blueprintjs/core'
import classNames from 'classnames'

import { msg } from 'common/i18n/i18n'
import { ImportProgress } from 'common/CommonTypes'

import BackgroundClient from 'app/BackgroundClient'
import PhotoDetailPane from 'app/ui/detail/PhotoDetailPane'
import ExportDialog from 'app/ui/export/ExportDialog'
import Library from 'app/ui/library/Library'
import LibraryFilterButton from 'app/ui/library/LibraryFilterButton'
import ImportProgressButton from 'app/ui/ImportProgressButton'
import PictureDiff from 'app/ui/PictureDiff'
import SettingsPane from 'app/ui/SettingsPane'
import { openSettingsAction } from 'app/state/actions'
import { AppState, MainViewState } from 'app/state/StateTypes'

import './App.less'


interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    isFullScreen: boolean
    hasWebGLSupport: boolean
    hasNativeTrafficLightButtons: boolean
    mainView: MainViewState
    importProgress: ImportProgress | null
    showExport: boolean
}

interface DispatchProps {
    toggleFullScreen(): void
    openSettings(): void
    toggleImportPaused(): void
    cancelImport(): void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

class App extends React.Component<Props> {

    componentDidMount() {
        const splashElem = document.getElementById('splash')
        if (splashElem) splashElem.parentNode!.removeChild(splashElem)
    }

    render() {
        const { props } = this

        let modalView: ReactNode | null = null
        if (props.showExport) {
            modalView = <ExportDialog />
        }

        let mainView: ReactNode | null = null
        if (!props.hasWebGLSupport) {
            mainView = (
                <div className='App-mainView App-globalError'>
                    <NonIdealState
                        icon='media'
                        title={msg('App_error_noWebGL_title')}
                        description={msg('App_error_noWebGL_desc')}
                    />
                </div>
            )
        } else if (props.mainView === 'settings') {
            mainView = <SettingsPane className='App-mainView'/>
        } else if (props.mainView === 'detail') {
            mainView = <PhotoDetailPane className='App-mainView' isActive={!modalView} />
        } else if (props.mainView === 'diff') {
            mainView = <PictureDiff className='App-mainView' />
        }

        return (
            <div className={classNames('App', { hasNativeTrafficLightButtons: props.hasNativeTrafficLightButtons })}>
                <Library
                    className='App-container'
                    topBarLeftItem={
                        <>
                            {props.isFullScreen &&
                                <Button
                                    minimal={true}
                                    icon='minimize'
                                    onClick={props.toggleFullScreen}
                                />
                            }
                            <LibraryFilterButton/>
                            <Button
                                minimal={true}
                                icon='cog'
                                onClick={props.openSettings}
                            />
                        </>
                    }
                    bottomBarLeftItem={props.importProgress &&
                        <ImportProgressButton
                            progress={props.importProgress}
                            toggleImportPaused={props.toggleImportPaused}
                            cancelImport={props.cancelImport}
                        />
                    }
                    isActive={!mainView && !modalView}
                />
                {mainView}
                {modalView}
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => {
        return {
            ...props,
            isFullScreen: state.navigation.isFullScreen,
            hasWebGLSupport: state.navigation.hasWebGLSupport,
            hasNativeTrafficLightButtons: state.data.uiConfig.platform === 'darwin' && !state.navigation.isFullScreen,
            mainView: state.navigation.mainView,
            importProgress: state.import && state.import.progress,
            showExport: !!state.export,
        }
    },
    dispatch => ({
        toggleFullScreen() { BackgroundClient.toggleFullScreen() },
        toggleImportPaused() { BackgroundClient.toggleImportPaused() },
        cancelImport() { BackgroundClient.cancelImport() },
        ...bindActionCreators({
            openSettings: openSettingsAction
        }, dispatch)
    })
)(App)

export default Connected
