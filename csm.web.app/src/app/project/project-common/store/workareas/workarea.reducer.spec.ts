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
    MOCK_SAVE_WORKAREA,
    MOCK_UPDATE_WORKAREA,
    MOCK_UPDATE_WORKAREA_C_TO_A,
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B,
    MOCK_WORKAREA_C,
    MOCK_WORKAREAS_LIST
} from '../../../../../test/mocks/workareas';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaListLinks} from '../../api/workareas/resources/workarea-list.resource';
import {WorkareaActions} from './workarea.actions';
import {WORKAREA_SLICE_INITIAL_STATE} from './workarea.initial-state';
import {WORKAREA_REDUCER} from './workarea.reducer';
import {WorkareaSlice} from './workarea.slice';

describe('Workarea Reducer', () => {
    let initialState: WorkareaSlice;
    let initialStateWithWorkareas: WorkareaSlice;
    let nextState: WorkareaSlice;

    beforeEach(() => {
        initialState = WORKAREA_SLICE_INITIAL_STATE;
        initialStateWithWorkareas = cloneDeep(WORKAREA_SLICE_INITIAL_STATE);
        nextState = cloneDeep(WORKAREA_SLICE_INITIAL_STATE);
    });

    it('should handle WorkareaActions.Initialize.All', () => {
        const action = new WorkareaActions.Initialize.All();
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle WorkareaActions.Initialize.Current', () => {
        const action = new WorkareaActions.Initialize.Current();
        nextState.currentItem = new AbstractItem();
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Initialize.List', () => {
        const action = new WorkareaActions.Initialize.List();
        nextState.list = new AbstractList();
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Request.All', () => {
        const action = new WorkareaActions.Request.All();

        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            requestStatus: RequestStatusEnum.progress
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Request.AllRejected', () => {
        const action = new WorkareaActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            requestStatus: RequestStatusEnum.error
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Request.AllFulfilled', () => {
        const action = new WorkareaActions.Request.AllFulfilled(MOCK_WORKAREAS_LIST);

        nextState.items = MOCK_WORKAREAS_LIST.workAreas;
        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            ids: MOCK_WORKAREAS_LIST.workAreas.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_WORKAREAS_LIST.version,
            _links: MOCK_WORKAREAS_LIST._links
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Create.One', () => {
        const action = new WorkareaActions.Create.One(MOCK_SAVE_WORKAREA);

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Create.OneFulfilled', () => {
        const action = new WorkareaActions.Create.OneFulfilled(MOCK_WORKAREAS_LIST);

        nextState.items = MOCK_WORKAREAS_LIST.workAreas;
        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            ids: MOCK_WORKAREAS_LIST.workAreas.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_WORKAREAS_LIST.version,
            _links: MOCK_WORKAREAS_LIST._links
        });
        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.success,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Create.OneRejected', () => {
        const action = new WorkareaActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.error,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Create.OneReset', () => {
        const action = new WorkareaActions.Create.OneReset();

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.One', () => {
        const action = new WorkareaActions.Update.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.OneFulfilled', () => {
        const action = new WorkareaActions.Update.OneFulfilled(MOCK_WORKAREA_A);

        initialStateWithWorkareas.items = [
            MOCK_WORKAREA_A
        ];

        nextState.items = [MOCK_WORKAREA_A];
        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.success,
        });
        expect(WORKAREA_REDUCER(initialStateWithWorkareas, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.OneRejected', () => {
        const action = new WorkareaActions.Update.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.error,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.OneReset', () => {
        const action = new WorkareaActions.Update.OneReset();

        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.List up to bottom', () => {
        const action = new WorkareaActions.Update.List(MOCK_UPDATE_WORKAREA);

        initialStateWithWorkareas.items = [
            MOCK_WORKAREA_A,
            MOCK_WORKAREA_B,
            MOCK_WORKAREA_C
        ];
        initialStateWithWorkareas.list = Object.assign(new AbstractList(),
            initialStateWithWorkareas.list,
            {
                ids: initialStateWithWorkareas.items.map((workarea: WorkareaResource) => workarea.id),
                version: 3,
            });

        nextState.items = [
            Object.assign(new WorkareaResource(), MOCK_WORKAREA_B, {position: 1}),
            Object.assign(new WorkareaResource(), MOCK_WORKAREA_A, {position: 2}),
            MOCK_WORKAREA_C
        ];

        nextState.list = Object.assign(
            new AbstractList(),
            initialStateWithWorkareas.list,
            {
                ids: nextState.items.map((workarea: WorkareaResource) => workarea.id),
                version: 4,
            });

        expect(WORKAREA_REDUCER(initialStateWithWorkareas, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.List bottom up', () => {
        const action = new WorkareaActions.Update.List(MOCK_UPDATE_WORKAREA_C_TO_A);

        initialStateWithWorkareas.items = [
            MOCK_WORKAREA_A,
            MOCK_WORKAREA_B,
            MOCK_WORKAREA_C
        ];
        initialStateWithWorkareas.list = Object.assign(new AbstractList(),
            initialStateWithWorkareas.list,
            {
                ids: initialStateWithWorkareas.items.map((workarea: WorkareaResource) => workarea.id),
                version: 3,
            });

        nextState.items = [
            Object.assign(new WorkareaResource(), MOCK_WORKAREA_C, {position: 1}),
            Object.assign(new WorkareaResource(), MOCK_WORKAREA_A, {position: 2}),
            Object.assign(new WorkareaResource(), MOCK_WORKAREA_B, {position: 3})
        ];

        nextState.list = Object.assign(
            new AbstractList(),
            initialStateWithWorkareas.list,
            {
                ids: nextState.items.map((workarea: WorkareaResource) => workarea.id),
                version: 4,
            });

        expect(WORKAREA_REDUCER(initialStateWithWorkareas, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Update.ListFulfilled', () => {
        const action = new WorkareaActions.Update.ListFulfilled(MOCK_WORKAREAS_LIST);

        nextState.items = MOCK_WORKAREAS_LIST.workAreas;
        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            ids: MOCK_WORKAREAS_LIST.workAreas.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_WORKAREAS_LIST.version,
            _links: MOCK_WORKAREAS_LIST._links
        });
        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Delete.One', () => {
        const action = new WorkareaActions.Delete.One(null);

        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            requestStatus: RequestStatusEnum.progress
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Delete.OneFulfilled', () => {
        const action = new WorkareaActions.Delete.OneFulfilled(MOCK_WORKAREAS_LIST);

        nextState.items = MOCK_WORKAREAS_LIST.workAreas;
        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            ids: MOCK_WORKAREAS_LIST.workAreas.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_WORKAREAS_LIST.version,
            _links: MOCK_WORKAREAS_LIST._links
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Delete.OneRejected', () => {
        const action = new WorkareaActions.Delete.OneRejected();

        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            requestStatus: RequestStatusEnum.error
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkareaActions.Delete.OneReset', () => {
        const action = new WorkareaActions.Delete.OneReset();

        nextState.list = Object.assign(new AbstractList<WorkareaListLinks>(), {
            requestStatus: RequestStatusEnum.empty
        });

        expect(WORKAREA_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(WORKAREA_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });
});
