import React from 'react'
import SvgIcon, { Props as SvgIconProps } from './SvgIcon'


export default class Logo extends React.Component<SvgIconProps> {
    render() {
        return (
            <SvgIcon viewBox='0 0 90 103.9' {...this.props}>
                <path opacity='.6' fill='#009741' d='M45 34.6l15 8.7V26L30 8.7 0 26v34.6l30 17.3 30-17.3-15 8.7-15-8.7V43.3z'/>
                <path opacity='.6' fill='#dedc0a' d='M30 60.6V43.3l15-8.7L30 26 0 43.3v34.6l30 17.4 30-17.4V60.6l-15 8.7z'/>
                <path opacity='.6' fill='#f39208' d='M45 34.6l15 8.7v17.3l-15 8.7-15-8.7V43.3l15-8.7L15 52v34.6l30 17.3 30-17.3V52z'/>
                <path opacity='.6' fill='#e72174' d='M60 26l-15 8.6 15 8.7v17.3l-15 8.7-15-8.7v17.3l30 17.4 30-17.4V43.3z'/>
                <path opacity='.6' fill='#253887' d='M60 8.7L30 26v17.3l15-8.7 15 8.7v17.3l-15 8.7-15-8.7 30 17.3 30-17.3V26z'/>
                <path opacity='.6' fill='#3ba9e0' d='M45 0L15 17.3V52l15 8.6V43.3l15-8.7 15 8.7v17.3L75 52V17.3z'/>
            </SvgIcon>
        )
    }
}
