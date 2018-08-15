import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Spinner } from '@blueprintjs/core'

import keymapManager from '../keymap-manager'
import { PhotoType, PhotoDetail } from '../../common/models/Photo'
import { VersionType } from '../../common/models/Version'
import { getNonRawImgPath } from '../data/ImageProvider'
import { closeDiffAction } from '../state/actions'
import { AppState } from '../state/reducers'


let rotation = {}

rotation[1] = ''
rotation[8] = 'minus-ninety'


interface OwnProps {
    className?: any
}

interface StateProps {
    photo: PhotoType
    photoDetail: PhotoDetail
}

interface DispatchProps {
    closeDiff: () => {}
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    loaded: boolean
    loadingCount: number
}

export class PictureDiff extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.onImgLoad = this.onImgLoad.bind(this)

        this.state = {
            loaded: false,
            loadingCount: 0
        }
    }

    componentDidMount() {
        window.addEventListener('core:cancel', this.props.closeDiff)
        window.addEventListener('diff:cancel', this.props.closeDiff)

        keymapManager.bind(this.refs.diff)
    }

    onImgLoad() {
        let nextState = { ...this.state }

        nextState.loadingCount++

        if (nextState.loadingCount >= 2) {
            nextState.loaded = true
        }

        this.setState(nextState)
    }

    componentWillUnmount() {
        window.removeEventListener('core:cancel', this.props.closeDiff)
        window.removeEventListener('diff:cancel', this.props.closeDiff)
        keymapManager.unbind()
    }

    render() {
        const props = this.props

        let className = [
            'shadow--2dp',
            rotation[props.photo.orientation]
        ].join(' ')

        const photoDetail = props.photoDetail
        let last: VersionType
        if (photoDetail) {
            last = photoDetail.versions[photoDetail.versions.length - 1]
        }

        return (
            <div className={classNames(props.className, "picture-diff")} ref="diff">
                <div className="before v-align">
                    <h3>Before</h3>
                    <img
                        src={getNonRawImgPath(props.photo)}
                        onLoad={this.onImgLoad}
                        className={className} />
                </div>

                <div className="after v-align">
                    <h3>After</h3>
                    <img
                        src={last.output}
                        onLoad={this.onImgLoad}
                        className={className} />
                </div>

                {!this.state.loaded &&
                    <Spinner size={Spinner.SIZE_LARGE} />
                }
            </div>
        )
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        const mainFilter = state.library.filter.mainFilter
        return {
            ...props,
            photo: state.library.photos.data[state.detail.currentPhoto.id],
            photoDetail: state.detail.currentPhoto.photoDetail
        }
    },
    {
        closeDiff: closeDiffAction
    }
)(PictureDiff)

export default Connected
