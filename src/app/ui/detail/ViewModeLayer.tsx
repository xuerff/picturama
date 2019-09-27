import React from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'

import { bindMany, isShallowEqual } from 'common/util/LangUtil'

import { CameraMetrics, PhotoPosition, maxZoom, RequestedPhotoPosition, limitPhotoPosition } from 'app/renderer/CameraMetrics'

import './ViewModeLayer.less'


export interface Props {
    className?: any
    cameraMetrics: CameraMetrics | null
    onPhotoPositionChange(photoPosition: RequestedPhotoPosition): void
}

interface State {
    dragStart: { x: number, y: number, photoPosition: PhotoPosition } | null
}

export default class ViewModeLayer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { dragStart: null }
        bindMany(this, 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onWheel')
    }

    componentWillUnmount() {
        this.removeDragListeners()
    }

    private onMouseDown(event: React.MouseEvent) {
        const { cameraMetrics } = this.props
        if (this.state.dragStart || !cameraMetrics || cameraMetrics.requestedPhotoPosition === 'contain') {
            return
        }

        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)

        const dragStart = { x: event.clientX, y: event.clientY, photoPosition: cameraMetrics.photoPosition }
        this.setState({ dragStart })
    }

    private removeDragListeners() {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    private onMouseMove(event: MouseEvent) {
        const { dragStart } = this.state
        const { cameraMetrics } = this.props
        if (dragStart && cameraMetrics) {
            const startPhotoPosition = dragStart.photoPosition
            const zoom = startPhotoPosition.zoom

            let centerX = startPhotoPosition.centerX - (event.clientX - dragStart.x) / zoom
            let centerY = startPhotoPosition.centerY - (event.clientY - dragStart.y) / zoom
            const nextPhotoPosition = limitPhotoPosition(cameraMetrics, { centerX, centerY, zoom }, true)

            if (!isShallowEqual(nextPhotoPosition, cameraMetrics.photoPosition)) {
                this.props.onPhotoPositionChange(nextPhotoPosition)
            }
        }
    }

    private onMouseUp() {
        this.removeDragListeners()

        if (this.state.dragStart) {
            this.setState({ dragStart: null })
        }
    }

    private onWheel(event: React.WheelEvent<HTMLDivElement>) {
        const { cameraMetrics } = this.props
        if (!cameraMetrics) {
            return
        }

        const { photoPosition } = cameraMetrics
        const zoom = Math.min(maxZoom, photoPosition.zoom * Math.pow(1.01, -event.deltaY))
            // One wheel tick has a deltaY of ~ 4
        if (zoom === photoPosition.zoom) {
            // Nothing to do
        } else if (zoom < cameraMetrics.minZoom) {
            this.props.onPhotoPositionChange('contain')
        } else {
            const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
            const mainRect = mainElem.getBoundingClientRect()

            // The mouse position in the canvas (in device pixels, relative to the center of the canvas)
            const mouseX = event.clientX - mainRect.left - mainRect.width / 2
            const mouseY = event.clientY - mainRect.top - mainRect.height / 2

            // The photo pixel where the mouse is aiming relativ (in photo pixels, relative to the top/left corner of the photo)
            const mousePhotoX = photoPosition.centerX + mouseX / photoPosition.zoom
            const mousePhotoY = photoPosition.centerY + mouseY / photoPosition.zoom

            // The new center (in photo pixels)
            const centerX = mousePhotoX - mouseX / zoom
            const centerY = mousePhotoY - mouseY / zoom

            this.props.onPhotoPositionChange({ centerX, centerY, zoom })
        }
    }

    render() {
        const { props, state } = this
        const requestedPhotoPosition = props.cameraMetrics && props.cameraMetrics.requestedPhotoPosition
        const isZoomed = requestedPhotoPosition && requestedPhotoPosition !== 'contain'
        return (
            <div
                ref='main'
                className={classnames(props.className, 'ViewModeLayer', { isZoomed, isDragging: state.dragStart })}
                onMouseDown={this.onMouseDown}
                onWheel={this.onWheel}
            />
        )
    }

}
