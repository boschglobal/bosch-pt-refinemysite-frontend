/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_QUICK_FILTER_LIST,
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS,
} from '../../../../../test/mocks/quick-filters';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {QuickFilterActions} from './quick-filter.actions';
import {QUICK_FILTER_SLICE_INITIAL_STATE} from './quick-filter.initial-state';
import {QUICK_FILTER_REDUCER} from './quick-filter.reducer';
import {
    QuickFilterContext,
    QuickFilterSlice,
} from './quick-filter.slice';

describe('Quick Filter Reducer', () => {
    let initialState: QuickFilterSlice;
    let midState: QuickFilterSlice;
    let nextState: QuickFilterSlice;

    beforeEach(() => {
        initialState = QUICK_FILTER_SLICE_INITIAL_STATE;
        midState = cloneDeep(QUICK_FILTER_SLICE_INITIAL_STATE);
        nextState = cloneDeep(QUICK_FILTER_SLICE_INITIAL_STATE);
    });

    it('should handle QuickFilterActions.Initialize.All()', () => {
        const action = new QuickFilterActions.Initialize.All();

        expect(QUICK_FILTER_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle QuickFilterActions.Request.All()', () => {
        const action: Action = new QuickFilterActions.Request.All();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Request.AllFulfilled()', () => {
        const action: Action = new QuickFilterActions.Request.AllFulfilled(MOCK_QUICK_FILTER_LIST);

        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS.id],
        });
        midState.items = [MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS];

        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: MOCK_QUICK_FILTER_LIST.items.map(item => item.id),
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_QUICK_FILTER_LIST._links,
        });
        nextState.items = [...MOCK_QUICK_FILTER_LIST.items, ...midState.items];

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Request.AllRejected()', () => {
        const action: Action = new QuickFilterActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Create.One()', () => {
        const action: Action = new QuickFilterActions.Create.One(null, null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Create.OneFulfilled()', () => {
        const createdQuickFilter = MOCK_QUICK_FILTER_RESOURCE;
        const existingQuickFilter = MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS;
        const action: Action = new QuickFilterActions.Create.OneFulfilled(createdQuickFilter);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [existingQuickFilter.id],
        });
        midState.items = [existingQuickFilter];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [createdQuickFilter.id, existingQuickFilter.id],
        });
        nextState.items = [createdQuickFilter, existingQuickFilter];

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Create.OneRejected()', () => {
        const action: Action = new QuickFilterActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Create.OneReset()', () => {
        const action: Action = new QuickFilterActions.Create.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Delete.One()', () => {
        const action: Action = new QuickFilterActions.Delete.One(null, null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Delete.OneFulfilled()', () => {
        const deletedQuickFilter = MOCK_QUICK_FILTER_RESOURCE;
        const existingQuickFilter = MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS;
        const action: Action = new QuickFilterActions.Delete.OneFulfilled(deletedQuickFilter.id);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [existingQuickFilter.id, deletedQuickFilter.id],
        });
        midState.items = [existingQuickFilter, deletedQuickFilter];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [existingQuickFilter.id],
        });
        nextState.items = [existingQuickFilter];

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Delete.OneRejected()', () => {
        const action: Action = new QuickFilterActions.Delete.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Delete.OneReset()', () => {
        const action: Action = new QuickFilterActions.Delete.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Set.AppliedFilter()', () => {
        const filterId = 'foo';
        const context: QuickFilterContext = 'list';
        const action: Action = new QuickFilterActions.Set.AppliedFilter(filterId, context);

        nextState.appliedFilterId[context] = filterId;

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Update.One()', () => {
        const action: Action = new QuickFilterActions.Update.One(null, null, null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Update.OneFulfilled()', () => {
        const quickFilterToUpdate = MOCK_QUICK_FILTER_RESOURCE;
        const updatedQuickFilter = {
            ...MOCK_QUICK_FILTER_RESOURCE,
            version: 2,
        };
        const action: Action = new QuickFilterActions.Update.OneFulfilled(updatedQuickFilter);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.items = [quickFilterToUpdate];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [updatedQuickFilter];

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Update.OneRejected()', () => {
        const action: Action = new QuickFilterActions.Update.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle QuickFilterActions.Update.OneReset()', () => {
        const action: Action = new QuickFilterActions.Update.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(QUICK_FILTER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(QUICK_FILTER_REDUCER(initialState, action)).toEqual(initialState);
    });
});
