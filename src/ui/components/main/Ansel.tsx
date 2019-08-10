import React from 'react'
import { connect } from 'react-redux'

import Export from 'ui/components/Export'
import PictureDetail from 'ui/components//detail/PictureDetail'
import PictureDiff from 'ui/components/PictureDiff'
import Settings from 'ui/components/Settings'
import Progress from 'ui/components/Progress'
import Library from 'ui/components/library/Library'
import LibraryFilterButton from 'ui/components/library/LibraryFilterButton'
import { AppState } from 'ui/state/reducers'
import { ImportProgress } from 'ui/state/reducers/import'
import { ModalState } from 'ui/state/reducers/navigation'

import './Ansel.less'


interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    settingsExist: boolean
    importProgress: ImportProgress | null
    showDetail: boolean
    showDiff: boolean
    showExport: boolean
    modal: ModalState
}

interface DispatchProps {
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

class Ansel extends React.Component<Props> {

    componentDidUpdate(prevProps: Props, prevState: {}) {
        const props = this.props
        if (prevProps.modal == 'splash' && props.modal != 'splash') {
            let splash = document.getElementById('splash')
            if (splash) splash.parentNode!.removeChild(splash)
        }
    }

    render() {
        const props = this.props
        const state = this.state

        if (props.modal == 'splash') {
            return null
        }

        let modalView
        if (props.showExport) {
            modalView = <Export />
        }

        let mainView
        if (props.showDetail) {
            if (props.showDiff) {
                mainView = <PictureDiff className="Ansel-detail" />
            } else {
                mainView = <PictureDetail className="Ansel-detail" isActive={!modalView} />
            }
        }

        let container
        if (!props.settingsExist) {
            container = <Settings className="Ansel-container" />
        } else if (props.importProgress) {
            container =
                <div className="Ansel-container">
                    <Progress progress={props.importProgress} />
                </div>
        } else {
            container =
                <Library
                    className='Ansel-container'
                    topBarLeftItem={
                        <LibraryFilterButton/>
                    }
                    isActive={!mainView && !modalView}
                />
        }

        return (
            <div id='ansel' className='Ansel'>
                {container}
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
            settingsExist: state.navigation.settingsExist,
            importProgress: state.import && state.import.progress,
            showDetail: !!state.detail,
            showDiff: !!(state.detail && state.detail.showDiff),
            showExport: !!state.export,
            modal: state.navigation.modal
        }
    }
)(Ansel)

export default Connected
