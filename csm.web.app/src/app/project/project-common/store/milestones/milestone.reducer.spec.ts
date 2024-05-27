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
    MOCK_MILESTONE_FILTERS,
    MOCK_MILESTONE_LIST,
    MOCK_MILESTONE_RESOURCE_CRAFT,
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_MILESTONE_RESOURCE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {MilestoneListLinks} from '../../api/milestones/resources/milestone-list.resource';
import {MilestoneActions} from './milestone.actions';
import {MILESTONE_SLICE_INITIAL_STATE} from './milestone.initial-state';
import {MILESTONE_REDUCER} from './milestone.reducer';
import {MilestoneSlice} from './milestone.slice';

describe('Milestone Reducer', () => {
    let initialState: MilestoneSlice;
    let midState: MilestoneSlice;
    let nextState: MilestoneSlice;

    beforeEach(() => {
        initialState = MILESTONE_SLICE_INITIAL_STATE;
        midState = cloneDeep(MILESTONE_SLICE_INITIAL_STATE);
        nextState = cloneDeep(MILESTONE_SLICE_INITIAL_STATE);
    });

    it('should handle MilestoneActions.Initialize.All()', () => {
        const action = new MilestoneActions.Initialize.All();

        expect(MILESTONE_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle MilestoneActions.Initialize.List()', () => {
        const action: Action = new MilestoneActions.Initialize.List();
        const {ids, requestStatus} = MILESTONE_SLICE_INITIAL_STATE.list;
        const valuesToKeep: Partial<AbstractList<MilestoneListLinks>> = {
            _links: {
                self: {href: ''},
                createProjectMilestone: {href: ''},
                createInvestorMilestone: {href: ''},
                createCraftMilestone: {href: ''},
            },
        };

        midState.list = Object.assign(new AbstractList(), initialState.list,
            {
                ...valuesToKeep,
                ids: ['foo'],
                requestStatus: RequestStatusEnum.success,
            });

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            ...valuesToKeep,
            ids,
            requestStatus,
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.One()', () => {
        const action: Action = new MilestoneActions.Request.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.OneFulfilled()', () => {
        const milestone1 = {
            ...MOCK_MILESTONE_RESOURCE_WORKAREA,
            id: '1',
            position: 0,
        };
        const milestone2 = {
            ...MOCK_MILESTONE_RESOURCE_WORKAREA,
            id: '2',
            position: 0,
        };
        const milestone2WithUpdatedPosition = {
            ...milestone2,
            position: 1,
        };

        const action: Action = new MilestoneActions.Request.OneFulfilled(milestone1);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [milestone2.id],
        });
        midState.items = [milestone2];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [milestone2WithUpdatedPosition.id, milestone1.id],
        });
        nextState.items = [milestone1, milestone2WithUpdatedPosition];

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.OneRejected()', () => {
        const action: Action = new MilestoneActions.Request.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.All()', () => {
        const action: Action = new MilestoneActions.Request.All();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.AllFulfilled()', () => {
        const action: Action = new MilestoneActions.Request.AllFulfilled(MOCK_MILESTONE_LIST);

        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [MOCK_MILESTONE_RESOURCE_CRAFT.id],
        });
        midState.items = [MOCK_MILESTONE_RESOURCE_CRAFT];

        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: MOCK_MILESTONE_LIST.items.map(item => item.id),
            requestStatus: RequestStatusEnum.success,
            _links: MOCK_MILESTONE_LIST._links,
        });
        nextState.items = [...MOCK_MILESTONE_LIST.items, ...midState.items];

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.AllRejected()', () => {
        const action: Action = new MilestoneActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Create.One()', () => {
        const action: Action = new MilestoneActions.Create.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Create.OneFulfilled()', () => {
        const milestone1 = {
            ...MOCK_MILESTONE_RESOURCE_CRAFT,
            id: '1',
            position: 0,
        };
        const milestone2 = {
            ...MOCK_MILESTONE_RESOURCE_CRAFT,
            id: '2',
            position: 0,
        };
        const milestone3 = {
            ...MOCK_MILESTONE_RESOURCE_WORKAREA,
            id: '3',
            date: MOCK_MILESTONE_RESOURCE_CRAFT.date,
            position: 0,
        };
        const milestone4 = {
            ...MOCK_MILESTONE_RESOURCE_HEADER,
            id: '4',
            date: MOCK_MILESTONE_RESOURCE_CRAFT.date,
            position: 0,
        };
        const milestone2WithUpdatedPosition = {
            ...milestone2,
            position: 1,
        };

        const action: Action = new MilestoneActions.Create.OneFulfilled(milestone1);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [milestone2.id, milestone3.id, milestone4.id],
        });
        midState.items = [milestone2, milestone3, milestone4];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [milestone2WithUpdatedPosition.id, milestone3.id, milestone4.id, milestone1.id],
        });
        nextState.items = [milestone1, milestone2WithUpdatedPosition, milestone3, milestone4];

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Create.OneRejected()', () => {
        const action: Action = new MilestoneActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Create.OneReset()', () => {
        const action: Action = new MilestoneActions.Create.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Delete.One()', () => {
        const action: Action = new MilestoneActions.Delete.One(null, null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Delete.OneFulfilled()', () => {
        const action: Action = new MilestoneActions.Delete.OneFulfilled(MOCK_MILESTONE_RESOURCE_WORKAREA.id);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: [MOCK_MILESTONE_RESOURCE_CRAFT.id, MOCK_MILESTONE_RESOURCE_WORKAREA.id],
        });
        midState.items = [MOCK_MILESTONE_RESOURCE_CRAFT, MOCK_MILESTONE_RESOURCE_WORKAREA];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [MOCK_MILESTONE_RESOURCE_CRAFT.id],
        });
        nextState.items = [MOCK_MILESTONE_RESOURCE_CRAFT];

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Delete.OneRejected()', () => {
        const action: Action = new MilestoneActions.Delete.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Delete.OneReset()', () => {
        const action: Action = new MilestoneActions.Delete.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Update.One()', () => {
        const action: Action = new MilestoneActions.Update.One(null, null, null);

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Update.OneFulfilled()', () => {
        const milestone1 = {
            ...MOCK_MILESTONE_RESOURCE_CRAFT,
            id: '1',
            position: 0,
        };
        const milestone2 = {
            ...MOCK_MILESTONE_RESOURCE_CRAFT,
            id: '2',
            position: 1,
        };
        const milestone3 = {
            ...MOCK_MILESTONE_RESOURCE_CRAFT,
            id: '3',
            position: 2,
        };
        const milestone2WithUpdatedPosition = {
            ...milestone2,
            position: 2,
        };
        const milestone3WithUpdatedPosition = {
            ...milestone3,
            position: 1,
            version: milestone3.version + 1,
        };

        const action: Action = new MilestoneActions.Update.OneFulfilled(milestone3WithUpdatedPosition);

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });
        midState.items = [milestone1, milestone2, milestone3];

        nextState.currentItem = Object.assign(new AbstractItem(), midState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = [milestone1, milestone3WithUpdatedPosition, milestone2WithUpdatedPosition];

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Update.OneRejected()', () => {
        const action: Action = new MilestoneActions.Update.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Update.OneReset()', () => {
        const action: Action = new MilestoneActions.Update.OneReset();

        midState.currentItem = Object.assign(new AbstractItem(), initialState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle MilestoneActions.Request.AllByIdsFulfilled', () => {
        const action = new MilestoneActions.Request.AllByIdsFulfilled([MOCK_MILESTONE_RESOURCE_CRAFT]);

        midState.items = [MOCK_MILESTONE_RESOURCE_WORKAREA];
        midState.list = Object.assign(new AbstractList(), initialState.list, {ids: [MOCK_MILESTONE_RESOURCE_WORKAREA.id]});

        nextState.items = [MOCK_MILESTONE_RESOURCE_CRAFT, MOCK_MILESTONE_RESOURCE_WORKAREA];
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [MOCK_MILESTONE_RESOURCE_CRAFT.id, MOCK_MILESTONE_RESOURCE_WORKAREA.id],
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Request.AllByMilestoneListIdsFulfilled', () => {
        const action = new MilestoneActions.Request.AllByMilestoneListIdsFulfilled([MOCK_MILESTONE_RESOURCE_CRAFT]);

        midState.items = [MOCK_MILESTONE_RESOURCE_WORKAREA];
        midState.list = Object.assign(new AbstractList(), initialState.list, {ids: [MOCK_MILESTONE_RESOURCE_WORKAREA.id]});

        nextState.items = [MOCK_MILESTONE_RESOURCE_CRAFT, MOCK_MILESTONE_RESOURCE_WORKAREA];
        nextState.list = Object.assign(new AbstractList(), midState.list, {
            ids: [MOCK_MILESTONE_RESOURCE_CRAFT.id, MOCK_MILESTONE_RESOURCE_WORKAREA.id],
        });

        expect(MILESTONE_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle MilestoneActions.Set.Filters', () => {
        const action = new MilestoneActions.Set.Filters(MOCK_MILESTONE_FILTERS);

        nextState.filters = MOCK_MILESTONE_FILTERS;

        expect(MILESTONE_REDUCER(initialState, action)).toEqual(nextState);
    });
});
