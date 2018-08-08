import * as React from 'react'
import SvgIcon, { Props as SvgIconProps } from './SvgIcon'


/**
 * Shows the 'save_alt' icon from [Material Design Icons by Google](https://material.io/tools/icons/).
 */
export default class MdSaveAlt extends React.Component<SvgIconProps, undefined> {
    render() {
        return (
            <SvgIcon viewBox="0 0 24 24" {...this.props}>
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
            </SvgIcon>
        )
    }
}
