/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {
    cloneDeep,
    union
} from 'lodash';

import {
    MOCK_PAT_LIST_RESOURCE,
    MOCK_PAT_RESOURCE,
    MOCK_SAVE_PAT_RESOURCE
} from '../../../../test/mocks/pat';
import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {PATListLinks} from '../../../project/project-common/api/pats/resources/pat-list.resource';
import {AbstractList} from '../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PATActions} from './pat.actions';
import {PAT_SLICE_INITIAL_STATE} from './pat.initial-state';
import {PAT_REDUCER} from './pat.reducer';
import {PATSlice} from './pat.slice';

describe('PAT Reducer', () => {
    let initialState: PATSlice;
    let midState: PATSlice;
    let nextState: PATSlice;

    beforeEach(() => {
        initialState = PAT_SLICE_INITIAL_STATE;
        midState = cloneDeep(PAT_SLICE_INITIAL_STATE);
        nextState = cloneDeep(PAT_SLICE_INITIAL_STATE);
    });

    it('should handle PATActionEnum.Initialize.All', () => {
        const action = new PATActions.Initialize.All();

        expect(PAT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle PATActionEnum.Initialize.Current', () => {
        const action = new PATActions.Initialize.Current();

        nextState.currentItem = PAT_SLICE_INITIAL_STATE.currentItem;

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Initialize.List', () => {
        const action = new PATActions.Initialize.List();

        nextState.list = PAT_SLICE_INITIAL_STATE.list;

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Request.All', () => {
        const action = new PATActions.Request.All();

        nextState.list = Object.assign(new AbstractList<PATListLinks>(), {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Request.AllRejected', () => {
        const action = new PATActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList<PATListLinks>(), {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Request.AllFulfilled', () => {
        const action = new PATActions.Request.AllFulfilled(MOCK_PAT_LIST_RESOURCE);

        nextState.items = MOCK_PAT_LIST_RESOURCE.items;
        nextState.list = Object.assign(new AbstractList<PATListLinks>(), {
            ids: MOCK_PAT_LIST_RESOURCE.items.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.CreateOne', () => {
        const action = new PATActions.Create.One(MOCK_SAVE_PAT_RESOURCE);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Create.OneFulfilled', () => {
        const action = new PATActions.Create.OneFulfilled(MOCK_PAT_RESOURCE);

        nextState.items = [MOCK_PAT_RESOURCE];
        nextState.list = Object.assign(new AbstractList<PATListLinks>(), {
            ids: union(PAT_SLICE_INITIAL_STATE.list.ids, [MOCK_PAT_RESOURCE.id]),
            requestStatus: RequestStatusEnum.success,
        });
        nextState.currentItem = Object.assign(new AbstractItem(), {
            id: MOCK_PAT_RESOURCE.id,
            requestStatus: RequestStatusEnum.success,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Create.OneRejected', () => {
        const action = new PATActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Update.One', () => {
        const action = new PATActions.Update.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Update.OneFulfilled', () => {
        const updatedPat: PATResource = {...MOCK_PAT_RESOURCE, description: 'new description'};
        const action = new PATActions.Update.OneFulfilled(updatedPat);

        midState.items = [
            MOCK_PAT_RESOURCE,
        ];

        nextState.items = [updatedPat];
        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PAT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Update.OneRejected', () => {
        const action = new PATActions.Update.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Delete.One', () => {
        const action = new PATActions.Delete.One('foo');

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Delete.OneFulfilled()', () => {
        const action = new PATActions.Delete.OneFulfilled(MOCK_PAT_LIST_RESOURCE.items[0].id);

        midState.items = MOCK_PAT_LIST_RESOURCE.items;

        nextState.items = [MOCK_PAT_LIST_RESOURCE.items[1]];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PAT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle PATActionEnum.Delete.OneRejected', () => {
        const action = new PATActions.Delete.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PAT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};

        expect(PAT_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });
});
