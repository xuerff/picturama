import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import * as TagsInput from 'react-tagsinput'

import { createTagsAndAssociateToPhoto } from '../data/PhotoTagStore'
import { PhotoId, PhotoType } from '../../common/models/Photo'
import { closeTagsEditorAction } from '../state/actions'
import { AppState } from '../state/reducers'
import { bindMany } from '../../common/util/LangUtil'


const btnClass = 'button button--raised button--colored'

interface OwnProps {
    style?: any
}

interface StateProps {
    photo: PhotoType
}

interface DispatchProps {
    createTagsAndAssociateToPhoto: (tags: string[], photoId: PhotoId) => void
    closeTagsEditor: () => void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

interface State {
    tags: string[]
}

export class TagEditor extends React.Component<Props, State> {

    constructor(props) {
        super(props)

        bindMany(this, 'handleChange', 'handleSubmit')

        let tags = []
        if (this.props.photo.tags.length > 0) {
            tags = this.props.photo.tags.map(tag => tag.title)
        }

        this.state = { tags: tags }
    }

    componentDidMount() {
        const tagsElem = findDOMNode(this.refs.tags) as HTMLElement
        tagsElem.focus()

        window.addEventListener('core:cancel', this.props.closeTagsEditor)
    }

    componentWillUnmount() {
        window.removeEventListener('core:cancel', this.props.closeTagsEditor)
    }

    handleChange(tags: string[]) {
        this.setState({ tags })
    }

    handleSubmit(e) {
        e.preventDefault()
        let tags = this.state.tags.map(tag => tag.trim())

        this.props.createTagsAndAssociateToPhoto(tags, this.props.photo.id)
        this.props.closeTagsEditor()
    }

    render() {
        return (
            <div className="ansel-outer-modal" id="add-tags" style={this.props.style}>
                <div className="ansel-modal shadow--2dp">
                    <form onSubmit={this.handleSubmit}>
                        <h3>Add a tag</h3>

                        <div className="textfield">
                            <TagsInput
                                id="tags"
                                ref="tags"
                                value={this.state.tags}
                                onChange={this.handleChange} />
                        </div>

                        <button className={btnClass}>Add</button>
                    </form>
                </div>
            </div>
        )
    }

}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props) => {
        return {
            ...props,
            photo: state.library.photos.data[state.detail.currentPhoto.id]
        }
    },
    dispatch => ({
        createTagsAndAssociateToPhoto,
        closeTagsEditor: () => dispatch(closeTagsEditorAction())
    })
)(TagEditor)

export default Connected
