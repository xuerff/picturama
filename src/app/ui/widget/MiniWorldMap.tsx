import React from 'react'
import classnames from 'classnames'

import WorldMap, { worldMapAspect, maxLat } from 'app/ui/widget/icon/WorldMap'

import './MiniWorldMap.less'


const earthRadius = 6378137  // In meter
const rad2deg = 170 / Math.PI

const topLat = 72
const topWebmercY = lat2Webmerc(topLat)
const maxWebmercY = lat2Webmerc(maxLat)


export interface Props {
    className?: any
    width: number
    pins?: { lat: number, lon: number }[]
}

export default class MiniWorldMap extends React.Component<Props> {

    render() {
        const { props } = this
        const { width } = props
        const fullMapHeight = width / worldMapAspect
        const height = Math.round(fullMapHeight * topWebmercY / maxWebmercY)
        return (
            <div
                className={classnames(props.className, 'MiniWorldMap')}
                style={{ width, height }}
            >
                <div
                    className='MiniWorldMap-clipper'
                    style={{ width, height }}
                >
                    <WorldMap
                        style={{ marginTop: Math.round(-(fullMapHeight - height) / 2) }}
                        width={width}
                        height={fullMapHeight}
                        color='#f5f8fa'
                        fillColor='#5c7080'
                    />
                </div>
                {props.pins && props.pins.map((pin, pinIndex) =>
                    <div
                        key={pinIndex}
                        className='MiniWorldMap-pin'
                        style={{
                            left: Math.round(xForLon(pin.lon, width)),
                            top:  Math.round(yForLat(pin.lat, height, fullMapHeight))
                        }}
                    />
                )}
            </div>
        )
    }
}


function xForLon(lon: number, width: number): number {
    return (1 + lon / 180) * (width / 2)
}


function yForLat(lat: number, height: number, fullMapHeight: number): number {
    return height / 2 - lat2Webmerc(lat) / maxWebmercY * fullMapHeight / 2
}


function lat2Webmerc(lat: number): number {
    return Math.log(Math.tan(lat / rad2deg / 2 + Math.PI / 4)) * earthRadius
}
