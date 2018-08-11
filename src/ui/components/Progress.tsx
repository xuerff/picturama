import * as React from 'react'

import { ImportProgress } from '../state/reducers/import'


interface Props {
    progress: ImportProgress
}

/** Shows the progress of import or export */
export default class Progress extends React.Component<Props> {

    constructor(props: Props) {
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
