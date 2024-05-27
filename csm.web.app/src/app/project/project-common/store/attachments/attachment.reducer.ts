/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {unionBy} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {AttachmentListResourceLinks} from '../../api/attachments/resources/attachment-list.resource';
import {
    AttachmentActionEnum,
    AttachmentActions
} from './attachment.actions';
import {ATTACHMENT_SLICE_INITIAL_STATE} from './attachment.initial-state';
import {AttachmentSlice} from './attachment.slice';

export function attachmentReducer(state: AttachmentSlice = ATTACHMENT_SLICE_INITIAL_STATE, action: AttachmentActions): AttachmentSlice {
    switch (action.type) {

        case AttachmentActionEnum.InitializeAll:
            return ATTACHMENT_SLICE_INITIAL_STATE;

        case AttachmentActionEnum.RemoveAllByMessage:
            return Object.assign({}, state, {
                items: state.items.filter(item => !item.messageId || item.messageId !== action.payload),
            });

        case AttachmentActionEnum.RemoveAllByTopic:
            return Object.assign({}, state, {
                items: state.items.filter(item => !item.topicId || item.topicId !== action.payload),
            });

        case AttachmentActionEnum.DeleteOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case AttachmentActionEnum.DeleteOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case AttachmentActionEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success
                }),
                items: state.items.filter(item => item.id !== action.payload)
            });

        case AttachmentActionEnum.DeleteOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case AttachmentActionEnum.RequestAllByTask: {
            const requestAllAttachmentsAction = action;

            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<AttachmentListResourceLinks>>() : state.lists;

            return Object.assign({}, state, {
                lists: Object.assign(new Map(), lists, {
                    [requestAllAttachmentsAction.payload.objectIdentifier.stringify()]: Object.assign(
                        new AbstractList(),
                        lists[requestAllAttachmentsAction.payload.objectIdentifier.stringify()],
                        {requestStatus: RequestStatusEnum.progress}
                    )
                })
            });
        }

        case AttachmentActionEnum.RequestAllByTaskFulfilled: {
            const {attachmentList, objectIdentifier} = action.payload;
            const objectIdentifierId = objectIdentifier.stringify();
            const updatedAttachmentIds: string[] = attachmentList.attachments.map((attachment: AttachmentResource) => attachment.id);
            const lists = typeof state.lists === 'undefined' ? new Map<string, AbstractList<AttachmentListResourceLinks>>() : state.lists;
            const list = typeof lists[objectIdentifierId] === 'undefined' ? new AbstractList<AttachmentListResourceLinks>() : lists[objectIdentifierId];

            return Object.assign({}, state, {
                items: unionBy(attachmentList.attachments, state.items, 'id'),
                lists: Object.assign(new Map(), lists, {
                    [objectIdentifierId]: Object.assign(new AbstractList(), list[objectIdentifierId], {
                        ids: updatedAttachmentIds,
                        requestStatus: RequestStatusEnum.success,
                        _links: attachmentList._links
                    })
                })
            });
        }

        case AttachmentActionEnum.RequestAllByTaskRejected:
            const requestAllAttachmentsRejectedAction = action;

            return Object.assign({}, state, {
                lists: Object.assign(new Map(), state.lists, {
                    [requestAllAttachmentsRejectedAction.payload]: Object.assign(
                        new AbstractList(),
                        state.lists[requestAllAttachmentsRejectedAction.payload],
                        {requestStatus: RequestStatusEnum.error}
                    )
                })
            });

        default:
            return state;
    }
}

export const ATTACHMENT_REDUCER: ActionReducer<AttachmentSlice> = attachmentReducer;
