import React from 'react'
import { Provider } from 'react-redux'

import Ansel from './main/Ansel'
import store from '../state/store'


export default class App extends React.Component {

    render() {
        return (
            <Provider store={store}>
                <Ansel />
            </Provider>
        )
    }
}
