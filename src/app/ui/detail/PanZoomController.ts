import { bindMany, isShallowEqual } from 'common/util/LangUtil'

import { CameraMetrics, zeroCameraMetrics, PhotoPosition, maxZoom, RequestedPhotoPosition, limitPhotoPosition } from 'app/renderer/CameraMetrics'


export interface PanZoomControllerOptions {
    mainElem: HTMLElement,
    onPhotoPositionChange(photoPosition: RequestedPhotoPosition): void
    onDraggingChange(isDragging: boolean): void
}

export interface Props {
    cameraMetrics: CameraMetrics
}

export default class PanZoomController {

    private props = {
        cameraMetrics: zeroCameraMetrics
    }
    private dragStart: { x: number, y: number, photoPosition: PhotoPosition } | null = null

    constructor(private options: PanZoomControllerOptions) {
        bindMany(this, 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onWheel')
    }

    setProps(props: Props) {
        this.props = props
    }

    onMouseDown(event: React.MouseEvent) {
        const { cameraMetrics } = this.props
        if (this.dragStart || cameraMetrics.requestedPhotoPosition === 'contain') {
            return
        }

        this.dragStart = { x: event.clientX, y: event.clientY, photoPosition: cameraMetrics.photoPosition }
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
    }

    close() {
        this.removeDragListeners()
    }

    private removeDragListeners() {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    private onMouseMove(event: MouseEvent) {
        const { dragStart } = this
        const { cameraMetrics } = this.props
        if (dragStart) {
            const startPhotoPosition = dragStart.photoPosition
            const zoom = startPhotoPosition.zoom

            let centerX = startPhotoPosition.centerX - (event.clientX - dragStart.x) / zoom
            let centerY = startPhotoPosition.centerY - (event.clientY - dragStart.y) / zoom
            const nextPhotoPosition = limitPhotoPosition(cameraMetrics, { centerX, centerY, zoom }, true)

            if (!isShallowEqual(nextPhotoPosition, cameraMetrics.photoPosition)) {
                this.options.onPhotoPositionChange(nextPhotoPosition)
            }
        }
    }

    private onMouseUp() {
        this.removeDragListeners()

        if (this.dragStart) {
            this.dragStart = null
        }
    }

    onWheel(event: React.WheelEvent<HTMLDivElement>) {
        const { cameraMetrics } = this.props
        const { photoPosition } = cameraMetrics
        const zoom = Math.min(maxZoom, photoPosition.zoom * Math.pow(1.01, -event.deltaY))
            // One wheel tick has a deltaY of ~ 4
        if (zoom === photoPosition.zoom) {
            // Nothing to do
        } else if (zoom < cameraMetrics.minZoom) {
            this.options.onPhotoPositionChange('contain')
        } else {
            const mainRect = this.options.mainElem.getBoundingClientRect()

            // The mouse position in the canvas (in device pixels, relative to the center of the canvas)
            const mouseX = event.clientX - mainRect.left - mainRect.width / 2
            const mouseY = event.clientY - mainRect.top - mainRect.height / 2

            // The photo pixel where the mouse is aiming relativ (in photo pixels, relative to the top/left corner of the photo)
            const mousePhotoX = photoPosition.centerX + mouseX / photoPosition.zoom
            const mousePhotoY = photoPosition.centerY + mouseY / photoPosition.zoom

            // The new center (in photo pixels)
            const centerX = mousePhotoX - mouseX / zoom
            const centerY = mousePhotoY - mouseY / zoom

            this.options.onPhotoPositionChange({ centerX, centerY, zoom })
        }
    }

}
