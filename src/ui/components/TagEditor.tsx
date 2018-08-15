import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import TagsInput from 'react-tagsinput'

import { PhotoId, PhotoType, PhotoDetail } from '../../common/models/Photo'
import { bindMany } from '../../common/util/LangUtil'

import { createTagsAndAssociateToPhoto } from '../controller/PhotoTagController'
import { closeTagsEditorAction } from '../state/actions'
import { AppState } from '../state/reducers'
import { getPhotoById } from '../state/selectors'


const btnClass = 'button button--raised button--colored'

interface OwnProps {
    style?: any
}

interface StateProps {
    photo: PhotoType
    photoDetail: PhotoDetail
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

    constructor(props: Props) {
        super(props)

        bindMany(this, 'handleChange', 'handleSubmit')

        let tags = []
        if (props.photoDetail.tags.length > 0) {
            tags = props.photoDetail.tags.map(tag => tag.title)
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
        const currentPhoto = state.detail.currentPhoto
        return {
            ...props,
            photo: getPhotoById(currentPhoto.sectionId, currentPhoto.photoId),
            photoDetail: currentPhoto.photoDetail
        }
    },
    dispatch => ({
        createTagsAndAssociateToPhoto,
        closeTagsEditor: () => dispatch(closeTagsEditorAction())
    })
)(TagEditor)

export default Connected
