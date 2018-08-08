import * as classNames from 'classnames'
import * as React from 'react'

import { TagId, TagType } from '../../../common/models/Tag'
import TagButton from './TagButton'


interface Props {
    tags: TagType[]
    currentTagId: TagId
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
                    {props.tags.map(tag =>
                        <TagButton
                            key={tag.id}
                            className={classNames({ active: tag.id === props.currentTagId })}
                            tag={tag}
                            onTagSelected={props.onTagSelected}
                        />
                    )}
                </ul>
            </div>
        )
    }

}
