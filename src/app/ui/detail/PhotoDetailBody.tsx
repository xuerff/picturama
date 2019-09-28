import React from 'react'
import classnames from 'classnames'
import { ResizeSensor, IResizeEntry, Spinner } from '@blueprintjs/core'

import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { bindMany, isShallowEqual } from 'common/util/LangUtil'

import { CameraMetrics, CameraMetricsBuilder, RequestedPhotoPosition, limitPhotoPosition, PhotoPosition } from 'app/renderer/CameraMetrics'
import { Size, zeroSize } from 'app/UITypes'

import PhotoLayer from './PhotoLayer'
import ViewModeLayer from './ViewModeLayer'

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
    loading: boolean
    prevSrc: string | null
    canvasSize: Size
    textureSize: Size | null
    photoPosition: RequestedPhotoPosition
    cameraMetricsBuilder: CameraMetricsBuilder
    cameraMetrics: CameraMetrics | null
}

export default class PhotoDetailBody extends React.Component<Props, State> {

    private prevMinZoom: number | null = null


    constructor(props: Props) {
        super(props)
        bindMany(this, 'onLoadingChange', 'onResize', 'onTextureSizeChange', 'onPhotoPositionChange')
        const cameraMetricsBuilder = new CameraMetricsBuilder()
        this.state = {
            loading: true,
            prevSrc: null,
            canvasSize: zeroSize,
            textureSize: null,
            photoPosition: 'contain',
            cameraMetricsBuilder,
            cameraMetrics: null,
        }
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
        const { cameraMetricsBuilder } = prevState
        let nextState: Partial<State> | null = null

        let nextPhotoPosition = prevState.photoPosition
        if (nextProps.src !== prevState.prevSrc) {
            nextState = { prevSrc: nextProps.src, textureSize: null, photoPosition: 'contain' }
        } else {
            const prevCameraMetrics = prevState.cameraMetrics
            if (prevCameraMetrics && nextProps.zoom !== prevCameraMetrics.photoPosition.zoom) {
                nextPhotoPosition = limitPhotoPosition(prevCameraMetrics, { ...prevCameraMetrics.photoPosition, zoom: nextProps.zoom }, false)
                if (nextPhotoPosition.zoom <= prevCameraMetrics.minZoom) {
                    nextPhotoPosition = 'contain'
                }
                nextState = { photoPosition: nextPhotoPosition }
            }
        }

        if (prevState.textureSize && nextProps.photoWork) {
            const cameraMetrics = cameraMetricsBuilder
                .setCanvasSize(prevState.canvasSize)
                .setTextureSize(prevState.textureSize)
                .setExifOrientation(nextProps.orientation)
                .setPhotoWork(nextProps.photoWork)
                .setPhotoPosition(nextPhotoPosition)
                .getCameraMetrics()
            if (cameraMetrics !== prevState.cameraMetrics) {
                nextState = { ...nextState, cameraMetrics }
            }
        } else if (prevState.cameraMetrics) {
            nextState = { ...nextState, cameraMetrics: null }
        }

        return nextState
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { cameraMetrics } = this.state
        if (cameraMetrics) {
            const { photoPosition, minZoom, maxZoom } = cameraMetrics
            if (photoPosition && (photoPosition.zoom !== prevProps.zoom || minZoom !== this.prevMinZoom)) {
                // maxZoom is constant (so wo don't have to check it)
                this.prevMinZoom = minZoom
                this.props.onZoomChange(photoPosition.zoom, minZoom, maxZoom)
            }
        }
    }

    private onLoadingChange(loading: boolean) {
        this.setState({ loading })
    }

    private onResize(entries: IResizeEntry[]) {
        const { state } = this
        const contentRect = entries[0].contentRect
        if (state.canvasSize.width !== contentRect.width || state.canvasSize.height !== contentRect.height) {
            const canvasSize: Size = { width: contentRect.width, height: contentRect.height }
            this.setState({ canvasSize })
        }
    }

    private onTextureSizeChange(textureSize: Size | null) {
        const { state } = this
        if (!isShallowEqual(textureSize, state.textureSize)) {
            this.setState({ textureSize })
        }
    }

    private onPhotoPositionChange(photoPosition: PhotoPosition) {
        this.setState({ photoPosition })
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
                        cameraMetrics={state.cameraMetrics}
                        onLoadingChange={this.onLoadingChange}
                        onTextureSizeChange={this.onTextureSizeChange}
                    />
                    <ViewModeLayer
                        className='PhotoDetailBody-layer'
                        cameraMetrics={state.cameraMetrics}
                        onPhotoPositionChange={this.onPhotoPositionChange}
                    />
                    {state.loading &&
                        <Spinner className='PhotoDetailBody-spinner' size={Spinner.SIZE_LARGE} />
                    }
                </div>
            </ResizeSensor>
        )
    }

}