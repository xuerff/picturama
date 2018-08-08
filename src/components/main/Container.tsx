import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'

import Settings from '../Settings'
import Progress from '../progress'
import Library from '../library/Library'
import { AppState } from '../../state/reducers'
import { ImportProgress } from '../../state/reducers/import'



interface OwnProps {
    className?: any
    isActive: boolean
}

interface StateProps {
    settingsExist: boolean
    importProgress: ImportProgress
}

interface DispatchProps {
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

class Container extends React.Component<Props> {

    render() {
        const props = this.props

        let content
        if (props.importProgress) {
            content = <Progress progress={props.importProgress} />
        } else if (!props.settingsExist) {
            content = <Settings />
        } else {
            content =
                <Library
                    className="Container-body"
                    isActive={props.isActive}
                />
        }

        return (
            <div ref="container" className={classNames(props.className, 'Container')}>
                {content}
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => {
        return {
            ...props,
            settingsExist: state.navigation.settingsExist,
            importProgress: state.import && state.import.progress
        }
    }
)(Container)

export default Connected
