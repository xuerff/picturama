import React from 'react'
import { connect } from 'react-redux'
import { Popover, Button, IconName, Position, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'
import classnames from 'classnames'

import { msg } from 'common/i18n/i18n'
import { TagId, TagById, Device, PhotoFilter } from 'common/CommonTypes'

import FaIcon from 'ui/components/widget/icon/FaIcon'
import { setLibraryFilter } from 'ui/controller/PhotoController'
import { fetchTags } from 'ui/controller/PhotoTagController'
import { AppState } from 'ui/state/reducers'

import './LibraryFilterButton.less'


type SimpleFilterType = 'all' | 'flagged' | 'trash'
const simpleFilterTypes: SimpleFilterType[] = [ 'all', 'flagged', 'trash' ]
    // TODO: Revive Legacy code of 'version' feature
    // -> Add 'processed'

type FilterType = SimpleFilterType | 'tag'

const iconByFilterType: { [K in FilterType]: IconName | JSX.Element } = {
    all: 'book',
    flagged: <FaIcon name='flag' />,
    // TODO: Revive Legacy code of 'version' feature
    //processed: 'settings',
    trash: 'trash',
    tag: 'tag',
}

export interface OwnProps {
    className?: any
}

interface StateProps {
    libraryFilter: PhotoFilter
    tagIds: TagId[]
    tagById: TagById
    devices: Device[]
}

interface DispatchProps {
    setLibraryFilter(newFilter: PhotoFilter): void
}

export interface Props extends OwnProps, StateProps, DispatchProps {}

export class LibraryFilterButton extends React.Component<Props> {

    private onSimpleFilterClick(type: SimpleFilterType) {
        let libraryFilter: PhotoFilter
        if (type === 'all') {
            libraryFilter = { mainFilter: null, showOnlyFlagged: false }
        } else if (type === 'flagged') {
            libraryFilter = { mainFilter: null, showOnlyFlagged: true }
        } else {
            libraryFilter = { mainFilter: { type }, showOnlyFlagged: false }
        }

        this.props.setLibraryFilter(libraryFilter)
    }

    private onTagFilterClick(tagId: TagId) {
        this.props.setLibraryFilter({ mainFilter: { type: 'tag', tagId }, showOnlyFlagged: false })
    }

    render() {
        const { props } = this
        const mainFilter = props.libraryFilter.mainFilter

        const activeFilterType = getTypeForFilter(props.libraryFilter)

        const menu = (
            <Menu className='LibraryFilterButton-menu'>
                {simpleFilterTypes.map(type =>
                    <MenuItem
                        key={type}
                        icon={iconByFilterType[type]}
                        text={msg(`LibraryFilterButton_filter_${type}` as any)}
                        active={type === activeFilterType}
                        onClick={() => this.onSimpleFilterClick(type)}
                    />
                )}
                {!!props.tagIds.length &&
                    <>
                        <MenuDivider title={msg('LibraryFilterButton_tag_title')} />
                        {props.tagIds.map(tagId =>
                            <MenuItem
                                key={tagId}
                                icon={iconByFilterType['tag']}
                                text={props.tagById[tagId].title}
                                active={!!(mainFilter && mainFilter.type === 'tag' && mainFilter.tagId === tagId)}
                                onClick={() => this.onTagFilterClick(tagId)}
                            />
                        )}
                    </>
                }
            </Menu>
        )

        let activeFilterLabel: string
        if (mainFilter && mainFilter.type === 'tag') {
            activeFilterLabel = msg('LibraryFilterButton_filter_tag', props.tagById[mainFilter.tagId].title)
        } else {
            activeFilterLabel = msg(`LibraryFilterButton_filter_${activeFilterType}` as any)
        }

        return (
            <Popover
                className={classnames(props.className, 'LibraryFilterButton')}
                content={menu}
                position={Position.BOTTOM}
            >
                <Button
                    minimal={true}
                    rightIcon='caret-down'
                    text={msg('LibraryFilterButton_shown', activeFilterLabel)} />
            </Popover>
        )
    }

}


function getTypeForFilter(libraryFilter: PhotoFilter): FilterType {
    if (libraryFilter.mainFilter) {
        const type = libraryFilter.mainFilter.type
        switch (type) {
            // TODO: Revive Legacy code of 'version' feature
            //case 'processed':
            case 'trash':
            case 'tag':
                return type
            default:
                console.warn('Unknown mainFilter type: ' + type)
                return 'all'
        }
    } else {
        return libraryFilter.showOnlyFlagged ? 'flagged' : 'all'
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => {
        return {
            ...props,
            libraryFilter: state.library.filter,
            tagIds: state.data.tags.ids,
            tagById: state.data.tags.byId,
            devices: state.data.devices,
        }
    },
    dispatch => ({
        setLibraryFilter,
    })
)(LibraryFilterButton)

export default Connected
