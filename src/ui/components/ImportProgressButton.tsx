import React from 'react'
import classnames from 'classnames'
import { Popover, Position, Button, Spinner } from '@blueprintjs/core'

import { bindMany } from 'common/util/LangUtil'
import { ImportProgress } from 'common/CommonTypes'

import { msg } from 'ui/i18n/i18n'

import './ImportProgressButton.less'


export interface Props {
    className?: any
    progress: ImportProgress
}

interface State {
    isShowingPopover: boolean
}

export default class ImportProgressButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { isShowingPopover: false }
        bindMany(this, 'onOpening', 'onClosed')
    }

    private onOpening() {
        this.setState({ isShowingPopover: true })
    }

    private onClosed() {
        this.setState({ isShowingPopover: false })
    }

    render() {
        const { props, state } = this
        const { progress } = props

        const spinnerProgress = progress.total ? progress.processed / progress.total : undefined

        const popoverContent = (
            <div className='ImportProgressButton-popoverBody'>
                {state.isShowingPopover &&
                    <>
                        <div className='ImportProgressButton-phase'>
                            {msg('ImportProgressButton_phase')}
                        </div>
                        {progress.photosDir &&
                            <div className='ImportProgressButton-photosDir'>
                                {progress.photosDir}
                            </div>
                        }
                        {spinnerProgress &&
                            <div className='ImportProgressButton-percent'>
                                {`${Math.round(spinnerProgress * 100)}%`}
                            </div>
                        }
                        {!!progress.total &&
                            <div className='ImportProgressButton-ratio'>
                                {msg('ImportProgressButton_ratio', progress.processed, progress.total)}
                            </div>
                        }
                    </>
                }
            </div>
        )

        return (
            <Popover
                className={classnames(props.className, 'ImportProgressButton')}
                content={popoverContent}
                position={Position.TOP}
                onOpening={this.onOpening}
                onClosed={this.onClosed}
            >
                <Button minimal={true} rightIcon='caret-up'>
                    <Spinner
                        size={20}
                        value={spinnerProgress}
                    />
                </Button>
            </Popover>
        )

    }

}
