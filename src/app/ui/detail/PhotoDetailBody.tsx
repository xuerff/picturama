import React from 'react'
import classnames from 'classnames'
import { ResizeSensor, IResizeEntry, Spinner } from '@blueprintjs/core'

import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { bindMany } from 'common/util/LangUtil'

import { Size, zeroSize } from 'app/UITypes'

import PhotoLayer from './PhotoLayer'

import './PhotoDetailBody.less'


export interface Props {
    className?: any
    style?: any
    src: string
    srcPrev: string | null
    srcNext: string | null
    orientation: ExifOrientation
    photoWork: PhotoWork | null
    zoom: number
    onZoomChange(zoom: number, minZoom: number, maxZoom: number): void
}

interface State {
    canvasSize: Size
    loading: boolean
}

export default class PhotoDetailBody extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { canvasSize: zeroSize, loading: true }
        bindMany(this, 'onResize', 'onLoadingChange')
    }

    private onResize(entries: IResizeEntry[]) {
        const { canvasSize } = this.state
        const contentRect = entries[0].contentRect
        if (canvasSize.width !== contentRect.width || canvasSize.height !== contentRect.height) {
            this.setState({ canvasSize: { width: contentRect.width, height: contentRect.height } })
        }
    }

    private onLoadingChange(loading: boolean) {
        this.setState({ loading })
    }

    render() {
        const { props, state } = this
        return (
            <ResizeSensor onResize={this.onResize}>
                <div className={classnames(props.className, 'PhotoDetailBody bp3-dark')}>
                    <PhotoLayer
                        className='PhotoDetailBody-layer'
                        canvasSize={state.canvasSize}
                        src={props.src}
                        srcPrev={props.srcPrev}
                        srcNext={props.srcNext}
                        orientation={props.orientation}
                        photoWork={props.photoWork}
                        zoom={props.zoom}
                        onLoadingChange={this.onLoadingChange}
                        onZoomChange={props.onZoomChange}
                    />
                    {state.loading &&
                        <Spinner className='PhotoDetailBody-spinner' size={Spinner.SIZE_LARGE} />
                    }
                </div>
            </ResizeSensor>
        )
    }

}
