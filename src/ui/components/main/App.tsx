import React, { ReactNode } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'

import { ImportProgress } from 'common/CommonTypes'

import Export from 'ui/components/Export'
import PictureDetail from 'ui/components//detail/PictureDetail'
import PictureDiff from 'ui/components/PictureDiff'
import SettingsPane from 'ui/components/SettingsPane'
import Library from 'ui/components/library/Library'
import LibraryFilterButton from 'ui/components/library/LibraryFilterButton'
import ImportProgressButton from 'ui/components/ImportProgressButton'
import { openSettingsAction } from 'ui/state/actions'
import { AppState } from 'ui/state/reducers'
import { MainViewState } from 'ui/state/reducers/navigation'

import './App.less'


interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    mainView: MainViewState
    importProgress: ImportProgress | null
    showExport: boolean
}

interface DispatchProps {
    openSettings(): void
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
            modalView = <Export />
        }

        let mainView: ReactNode | null = null
        if (props.mainView === 'settings') {
            mainView = <SettingsPane className='App-mainView'/>
        } else if (props.mainView === 'detail') {
            mainView = <PictureDetail className='App-mainView' isActive={!modalView} />
        } else if (props.mainView === 'diff') {
            mainView = <PictureDiff className='App-mainView' />
        }

        return (
            <div className='App'>
                <Library
                    className='App-container'
                    topBarLeftItem={
                        <>
                            <LibraryFilterButton/>
                            <Button
                                minimal={true}
                                icon='cog'
                                onClick={props.openSettings}
                            />
                        </>
                    }
                    bottomBarLeftItem={props.importProgress &&
                        <ImportProgressButton progress={props.importProgress} />
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
            mainView: state.navigation.mainView,
            importProgress: state.import && state.import.progress,
            showExport: !!state.export,
        }
    },
    dispatch => ({
        ...bindActionCreators({
            openSettings: openSettingsAction
        }, dispatch)
    })
)(App)

export default Connected
