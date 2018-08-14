import React from 'react'


interface Props {
    devices: { readonly name: string }[]
}

export default class Devices extends React.Component<Props> {
    render() {
        return (
            <div className="devices">
                <h3><i className="fa fa-usb"></i> Devices</h3>
                <ul>
                    {this.props.devices.map((device, i) => <li key={i}>{device.name}</li>)}
                </ul>
            </div>
        )
    }
}
