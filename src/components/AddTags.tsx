import * as React from 'react'
import { findDOMNode } from 'react-dom'
import TagsInput from 'react-tagsinput'
import { PhotoType } from '../models/Photo'
import { bindMany } from '../util/LangUtil'


const btnClass = 'button button--raised button--colored'

interface Props {
    photo: PhotoType
    closeTagDialog: () => void
    actions: any
}

interface State {
    tags: string[]
}

export default class AddTags extends React.Component<Props, State> {

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

        window.addEventListener('core:cancel', this.props.closeTagDialog)
    }

    componentWillUnmount() {
        window.removeEventListener('core:cancel', this.props.closeTagDialog)
    }

    handleChange(tags: string[]) {
        this.setState({ tags })
    }

    handleSubmit(e) {
        e.preventDefault()
        let tags = this.state.tags.map(tag => tag.trim())

        this.props.actions.createTagsAndAssociateToPhoto(tags, this.props.photo.id)
        this.props.closeTagDialog()
    }

    render() {
        return (
            <div className="outer-modal" id="add-tags">
                <div className="modal shadow--2dp">
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
