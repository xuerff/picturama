import React from 'react'
import SvgIcon, { Props as SvgIconProps } from './SvgIcon'


/**
 * Shows the `restore_from_trash` icon from [Material Design Icons by Google](https://material.io/tools/icons/).
 *
 * This icon doesn't exist in `react-icons` - therefore we need this class.
 */
export default class MdRestoreFromTrash extends React.Component<SvgIconProps> {
    render() {
        return (
            <SvgIcon viewBox="0 0 24 24" {...this.props}>
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zM6 7v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zm8 7v4h-4v-4H8l4-4 4 4h-2z"/>
            </SvgIcon>
        )
    }
}
