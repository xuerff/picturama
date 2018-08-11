import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'

import Export from '../Export'
import PictureDetail from '../detail/PictureDetail'
import PictureDiff from '../PictureDiff'
import TagEditor from '../TagEditor'
import Settings from '../Settings'
import Progress from '../Progress'
import Library from '../library/Library'
import Sidebar from '../sidebar/Sidebar'
import { AppState } from '../../state/reducers'
import { ImportProgress } from '../../state/reducers/import'
import { ModalState } from '../../state/reducers/navigation'
import { bindMany } from '../../../common/util/LangUtil'


interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    settingsExist: boolean
    importProgress: ImportProgress
    showDetail: boolean
    showDiff: boolean
    showExport: boolean
    modal: ModalState
}

interface DispatchProps {
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    showSidebar: boolean
}

class Ansel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        bindMany(this, 'toggleSidebar')

        this.state = {
            showSidebar: true
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const props = this.props
        if (prevProps.modal == 'splash' && props.modal != 'splash') {
            let splash = document.getElementById('splash')
            if (splash) splash.parentNode.removeChild(splash)
        }
    }

    componentDidMount() {
        window.addEventListener('core:toggleSidebar', this.toggleSidebar);
    }

    componentWillUnmount() {
        window.removeEventListener('core:toggleSidebar', this.toggleSidebar);
    }

    toggleSidebar() {
        this.setState({ showSidebar: !this.state.showSidebar })
    }

    render() {
        const props = this.props
        const state = this.state

        let modalView
        if (props.showExport) {
            modalView = <Export />
        } else if (props.modal === 'tags') {
            modalView = <TagEditor/>
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
        if (props.importProgress) {
            container =
                <div className="Ansel-container">
                    <Progress progress={props.importProgress} />
                </div>
        } else if (!props.settingsExist) {
            container = <Settings className="Ansel-container" />
        } else {
            container =
                <Library
                    className="Ansel-container"
                    isActive={!mainView && !modalView}
                />
        }

        return (
            <div id="ansel" className={classNames('Ansel', { hasSidebar: props.settingsExist && state.showSidebar })}>
                <Sidebar className="Ansel-sidebar" />
                {container}
                {mainView}
                {modalView}
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => {
        const currentPhoto = state.detail && state.detail.currentPhoto
        return {
            ...props,
            settingsExist: state.navigation.settingsExist,
            importProgress: state.import && state.import.progress,
            showDetail: !!state.detail,
            showDiff: state.detail && state.detail.showDiff,
            showExport: !!state.export,
            modal: state.navigation.modal
        }
    }
)(Ansel)

export default Connected
