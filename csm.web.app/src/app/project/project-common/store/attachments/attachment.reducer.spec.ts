/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */
import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2,
    MOCK_ATTACHMENT_3,
    MOCK_ATTACHMENTS_LIST
} from '../../../../../test/mocks/attachments';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {AttachmentActions} from './attachment.actions';
import {ATTACHMENT_SLICE_INITIAL_STATE} from './attachment.initial-state';
import {ATTACHMENT_REDUCER} from './attachment.reducer';
import {AttachmentSlice} from './attachment.slice';

describe('Attachment Reducer', () => {
    let initialState: AttachmentSlice;
    let midState: AttachmentSlice;
    let nextState: AttachmentSlice;

    const testDataTaskObjectIdentifier = new ObjectListIdentifierPair(ObjectTypeEnum.Task, '123', true);

    const testDataId = testDataTaskObjectIdentifier.stringify();

    const testDataRequestAllAttachmentsPayload = {
        objectIdentifier: testDataTaskObjectIdentifier
    };

    const testDataRequestAllAttachmentsFulfilledPayload = {
        attachmentList: MOCK_ATTACHMENTS_LIST,
        objectIdentifier: testDataTaskObjectIdentifier,
        _links: {
            self: {
                href: ''
            }
        }
    };

    beforeEach(() => {
        initialState = ATTACHMENT_SLICE_INITIAL_STATE;
        midState = cloneDeep((ATTACHMENT_SLICE_INITIAL_STATE));
        nextState = cloneDeep((ATTACHMENT_SLICE_INITIAL_STATE));
    });

    it('should handle INITIALIZE_ALL_ATTACHMENTS', () => {
        const action = new AttachmentActions.Initialize.All();

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle AttachmentActions.Remove.AllByMessage()', () => {
        const action = new AttachmentActions.Remove.AllByMessage(MOCK_ATTACHMENT_1.messageId);

        midState.items = [MOCK_ATTACHMENT_1, MOCK_ATTACHMENT_2, MOCK_ATTACHMENT_3];

        nextState.items = [MOCK_ATTACHMENT_3];

        expect(ATTACHMENT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Remove.AllByTopic()', () => {
        const action = new AttachmentActions.Remove.AllByTopic(MOCK_ATTACHMENT_1.topicId);

        midState.items = [MOCK_ATTACHMENT_1, MOCK_ATTACHMENT_2, MOCK_ATTACHMENT_3];

        nextState.items = [MOCK_ATTACHMENT_3];

        expect(ATTACHMENT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Delete.One()', () => {
        const action: Action = new AttachmentActions.Delete.One(MOCK_ATTACHMENT_1.id);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Delete.OneFulfilled()', () => {
        const action: Action = new AttachmentActions.Delete.OneFulfilled(MOCK_ATTACHMENT_1.id);

        midState.items = [MOCK_ATTACHMENT_1, MOCK_ATTACHMENT_2, MOCK_ATTACHMENT_3];

        nextState.items = [MOCK_ATTACHMENT_2, MOCK_ATTACHMENT_3];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success
        });

        expect(ATTACHMENT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Delete.OneRejected()', () => {
        const action: Action = new AttachmentActions.Delete.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Delete.OneReset()', () => {
        const action: Action = new AttachmentActions.Delete.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty
        });

        expect(ATTACHMENT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Request.AllByTask()', () => {
        const action = new AttachmentActions.Request.AllByTask(testDataRequestAllAttachmentsPayload);

        nextState.lists[testDataId] = Object.assign(new AbstractList(), {
            requestStatus: RequestStatusEnum.progress
        });
        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Request.AllByTaskFulfilled()', () => {
        const action = new AttachmentActions.Request.AllByTaskFulfilled(testDataRequestAllAttachmentsFulfilledPayload);

        nextState.items = MOCK_ATTACHMENTS_LIST.attachments;
        nextState.lists[testDataId] = Object.assign(new AbstractList(), {
            ids: MOCK_ATTACHMENTS_LIST.attachments.map((attachment: AttachmentResource) => attachment.id),
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_ATTACHMENTS_LIST._links
        });

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle AttachmentActions.Request.AllByTaskRejected()', () => {
        const action = new AttachmentActions.Request.AllByTaskRejected(testDataId);

        nextState.lists[testDataId] = Object.assign(new AbstractList(), {
            requestStatus: RequestStatusEnum.error
        });

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action = {type: 'UNKNOWN'};

        expect(ATTACHMENT_REDUCER(initialState, action)).toEqual(initialState);
    });
});
