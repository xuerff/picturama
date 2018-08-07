import * as React from 'react'
import { connect } from 'react-redux'

import AppState from '../reducers/AppState'


interface OwnProps {
}

interface StateProps {
    progress: { processed: number, total: number, photosDir: string }
}

interface DispatchProps {
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

export class Progress extends React.Component<Props> {

    constructor(props) {
        super(props)

        this.getProgress = this.getProgress.bind(this)

        this.state = {
            progress: { processed: 0, total: 0 },
            timer: new Date().getTime()
        }
    }

    getProgress() {
        const progress = this.props.progress
        return progress.processed / (progress.total / 100) || 0
    }

    render() {
        const progress = this.props.progress
        return (
            <div id="progress">
                <h2>scanning: {progress.photosDir}</h2>

                <div className="progress-bar">
                    <div
                        className="progress-value"
                        style={{ width: this.getProgress() + '%' }}></div>
                </div>

                <p>{Math.round(this.getProgress())}%</p>
                <p>{progress.processed} / {progress.total}</p>
            </div>
        )
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => ({
        ...props,
        progress: state.progress
    })
)(Progress)

export default Connected
