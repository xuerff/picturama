import React from 'react'
import classnames from 'classnames'
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import { bindMany } from 'common/util/LangUtil'

import CropOverlay, { Props as CropOverlayProps } from 'app/ui/detail/CropOverlay'
import { Point, Rect, Corner } from 'app/util/GeometryTypes'

import { addSection, action, TestContext } from 'test-ui/core/UiTester'


addSection('CropOverlay')
    .add('normal', context => (
        <CropOverlayTester
            createTestProps={(width: number, height: number) => ({
                ...createDefaultProps(context, width, height)
            })}
        />
    ))


function createDefaultProps(context: TestContext, width: number, height: number): CropOverlayProps {
    const { state } = context
    const minRectSize = 45

    let rect: Rect
    if (!state.rect || width !== state.prevWidth || height !== state.prevHeight) {
        const insetsX = 120
        const insetsY = 60
        rect = {
            x: insetsX,
            y: insetsY,
            width:  Math.max(minRectSize, width - 2 * insetsX),
            height: Math.max(minRectSize, height - 2 * insetsY)
        }
        state.prevWidth = width
        state.prevHeight = height
        state.rect = rect
    } else {
        rect = state.rect
    }

    return {
        width,
        height,
        rect,
        tilt: state.tilt || 0,
        onCornerDrag(corner: Corner, point: Point, isFinished: boolean) {
            const prevRect: Rect = state.rect
            const nextRect: Rect = { ...prevRect }

            if (corner === 'nw' || corner === 'sw') {
                const prevRight = prevRect.x + prevRect.width
                nextRect.x = Math.min(prevRight - minRectSize, point.x)
                nextRect.width = prevRight - nextRect.x
            } else {
                nextRect.width = Math.max(minRectSize, point.x - nextRect.x)
            }

            if (corner === 'nw' || corner === 'ne') {
                const prevBottom = prevRect.y + prevRect.height
                nextRect.y = Math.min(prevBottom - minRectSize, point.y)
                nextRect.height = prevBottom - nextRect.y
            } else {
                nextRect.height = Math.max(minRectSize, point.y - nextRect.y)
            }

            state.rect = nextRect
            context.forceUpdate()
        },
        onTiltChange(tilt: number) {
            state.tilt = tilt
            context.forceUpdate()
        },
    }
}


interface CropOverlayTesterProps {
    className?: any
    style?: any
    createTestProps(width: number, height: number): CropOverlayProps
}

interface CropOverlayTesterState {
    width: number
    height: number
}

export default class CropOverlayTester extends React.Component<CropOverlayTesterProps, CropOverlayTesterState> {

    constructor(props: CropOverlayTesterProps) {
        super(props)
        this.state = { width: 0, height: 0 }
        bindMany(this, 'onResize')
    }

    private onResize(entries: IResizeEntry[]) {
        const contentRect = entries[0].contentRect
        this.setState({ width: contentRect.width, height: contentRect.height })
    }

    render() {
        const { props, state } = this
        const gap = 10
        const containerWidth = Math.floor(Math.max(0, (state.width - 3 * gap) / 2))
        const commonContainerStyle: React.CSSProperties = {
            position: 'absolute',
            top: gap,
            bottom: gap,
            width: containerWidth,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
        }
        const testProps = props.createTestProps(containerWidth, state.height - 2 * gap)
        return (
            <ResizeSensor onResize={this.onResize}>
                <div
                    className={classnames(props.className, 'CropOverlayTester')}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    }}
                >
                    <div style={{ ...commonContainerStyle, left: gap, backgroundImage: 'url(../test-data/photos/800/ice-cubes.jpg)' }}>
                        <CropOverlay {...testProps}/>
                    </div>
                    <div style={{ ...commonContainerStyle, right: gap, backgroundImage: 'url(../test-data/photos/portrait.jpg)' }}>
                        <CropOverlay {...testProps}/>
                    </div>
                </div>
            </ResizeSensor>
        )
    }

}
