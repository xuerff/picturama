import classNames from 'classnames'
import React from 'react'

import { TagId, TagType, TagById } from '../../../common/models/Tag'
import TagButton from './TagButton'


interface Props {
    tagIds: TagId[]
    tagById: TagById
    currentTagId: TagId | null
    fetchTags: () => void
    onTagSelected: (tag: TagType) => void
}

export default class Tags extends React.Component<Props> {

    componentDidMount() {
        this.props.fetchTags()
    }

    render() {
        const props = this.props
        return (
            <div className="tags">
                <h3><i className="fa fa-tags"></i> Tags</h3>
                <ul>
                    {props.tagIds.map(tagId =>
                        <TagButton
                            key={tagId}
                            className={classNames({ active: tagId === props.currentTagId })}
                            tag={props.tagById[tagId]}
                            onTagSelected={props.onTagSelected}
                        />
                    )}
                </ul>
            </div>
        )
    }

}
