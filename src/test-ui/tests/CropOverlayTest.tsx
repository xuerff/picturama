import React from 'react'
import classnames from 'classnames'
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import { bindMany } from 'common/util/LangUtil'

import CropOverlay, { Props as CropOverlayProps } from 'app/ui/detail/CropOverlay'

import { addSection, action, TestContext } from 'test-ui/core/UiTester'


function createDefaultProps(width: number, height: number): CropOverlayProps {
    const insets = 50
    return {
        width,
        height,
        rect: {
            x: insets,
            y: insets,
            width: width - 2 * insets,
            height: height - 2 * insets
        },
    }
}


addSection('CropOverlay')
    .add('normal', context => (
        <CropOverlayTester
            createTestProps={(width: number, height: number) => ({
                ...createDefaultProps(width, height)
            })}
        />
    ))


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
