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
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B,
    MOCK_PROJECT_CRAFT_C,
    MOCK_PROJECT_CRAFT_LIST,
    MOCK_SAVE_PROJECT_CRAFT,
    MOCK_UPDATE_PROJECT_CRAFT,
    MOCK_UPDATE_PROJECT_CRAFT_C_TO_A
} from '../../../../../test/mocks/crafts';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectCraftListLinks} from '../../api/crafts/resources/project-craft-list.resource';
import {ProjectCraftActions} from './project-craft.actions';
import {PROJECT_CRAFT_SLICE_INITIAL_STATE} from './project-craft.initial-state';
import {PROJECT_CRAFT_REDUCER} from './project-craft.reducer';
import {ProjectCraftSlice} from './project-craft.slice';

describe('Project Craft Reducer', () => {
    let initialState: ProjectCraftSlice;
    let midState: ProjectCraftSlice;
    let nextState: ProjectCraftSlice;

    beforeEach(() => {
        initialState = PROJECT_CRAFT_SLICE_INITIAL_STATE;
        midState = cloneDeep(PROJECT_CRAFT_SLICE_INITIAL_STATE);
        nextState = cloneDeep(PROJECT_CRAFT_SLICE_INITIAL_STATE);
    });

    it('should handle ProjectCraftsActionEnum.Initialize.All', () => {
        const action = new ProjectCraftActions.Initialize.All();
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle ProjectCraftsActionEnum.Initialize.Current', () => {
        const action = new ProjectCraftActions.Initialize.Current();
        nextState.currentItem = PROJECT_CRAFT_SLICE_INITIAL_STATE.currentItem;
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Initialize.List', () => {
        const action = new ProjectCraftActions.Initialize.List();
        nextState.list = PROJECT_CRAFT_SLICE_INITIAL_STATE.list;
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Request.All', () => {
        const action = new ProjectCraftActions.Request.All();

        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Request.AllRejected', () => {
        const action = new ProjectCraftActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Request.AllFulfilled', () => {
        const action = new ProjectCraftActions.Request.AllFulfilled(MOCK_PROJECT_CRAFT_LIST);

        nextState.items = MOCK_PROJECT_CRAFT_LIST.projectCrafts;
        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            ids: MOCK_PROJECT_CRAFT_LIST.projectCrafts.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_PROJECT_CRAFT_LIST.version,
            _links: MOCK_PROJECT_CRAFT_LIST._links,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.CreateOne', () => {
        const action = new ProjectCraftActions.Create.One(MOCK_SAVE_PROJECT_CRAFT);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Create.OneFulfilled', () => {
        const action = new ProjectCraftActions.Create.OneFulfilled(MOCK_PROJECT_CRAFT_LIST);

        nextState.items = MOCK_PROJECT_CRAFT_LIST.projectCrafts;
        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            ids: MOCK_PROJECT_CRAFT_LIST.projectCrafts.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_PROJECT_CRAFT_LIST.version,
            _links: MOCK_PROJECT_CRAFT_LIST._links,
        });
        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Create.OneRejected', () => {
        const action = new ProjectCraftActions.Create.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Create.OneReset', () => {
        const action = new ProjectCraftActions.Create.OneReset();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Update.One', () => {
        const action = new ProjectCraftActions.Update.One(null);

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Update.OneFulfilled', () => {
        const action = new ProjectCraftActions.Update.OneFulfilled(MOCK_PROJECT_CRAFT_A);

        midState.items = [
            MOCK_PROJECT_CRAFT_A,
        ];

        nextState.items = [MOCK_PROJECT_CRAFT_A];
        nextState.currentItem = Object.assign(new AbstractItem(), {
            requestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_CRAFT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Update.OneRejected', () => {
        const action = new ProjectCraftActions.Update.OneRejected();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Update.OneReset', () => {
        const action = new ProjectCraftActions.Update.OneReset();

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftActions.Update.List when moving craft from up to bottom', () => {
        const action = new ProjectCraftActions.Update.List(MOCK_UPDATE_PROJECT_CRAFT);

        midState.items = [
            MOCK_PROJECT_CRAFT_A,
            MOCK_PROJECT_CRAFT_B,
            MOCK_PROJECT_CRAFT_C,
        ];
        midState.list = Object.assign(new AbstractList(),
            midState.list,
            {
                ids: midState.items.map((projectCraft: ProjectCraftResource) => projectCraft.id),
                version: 3,
            });

        nextState.items = [
            Object.assign(new ProjectCraftResource(), MOCK_PROJECT_CRAFT_B, {position: 1}),
            Object.assign(new ProjectCraftResource(), MOCK_PROJECT_CRAFT_A, {position: 2}),
            MOCK_PROJECT_CRAFT_C,
        ];

        nextState.list = Object.assign(
            new AbstractList(),
            midState.list,
            {
                ids: nextState.items.map((projectCraft: ProjectCraftResource) => projectCraft.id),
                version: 4,
            });

        expect(PROJECT_CRAFT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftActions.Update.List when moving craft from bottom to up', () => {
        const action = new ProjectCraftActions.Update.List(MOCK_UPDATE_PROJECT_CRAFT_C_TO_A);

        midState.items = [
            MOCK_PROJECT_CRAFT_A,
            MOCK_PROJECT_CRAFT_B,
            MOCK_PROJECT_CRAFT_C,
        ];
        midState.list = Object.assign(new AbstractList(),
            midState.list,
            {
                ids: midState.items.map((projectCraft: ProjectCraftResource) => projectCraft.id),
                version: 3,
            });

        nextState.items = [
            Object.assign(new ProjectCraftResource(), MOCK_PROJECT_CRAFT_C, {position: 1}),
            Object.assign(new ProjectCraftResource(), MOCK_PROJECT_CRAFT_A, {position: 2}),
            Object.assign(new ProjectCraftResource(), MOCK_PROJECT_CRAFT_B, {position: 3}),
        ];

        nextState.list = Object.assign(
            new AbstractList(),
            midState.list,
            {
                ids: nextState.items.map((projectCraft: ProjectCraftResource) => projectCraft.id),
                version: 4,
            });

        expect(PROJECT_CRAFT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftActions.Update.ListFulfilled', () => {
        const action = new ProjectCraftActions.Update.ListFulfilled(MOCK_PROJECT_CRAFT_LIST);

        nextState.items = MOCK_PROJECT_CRAFT_LIST.projectCrafts;
        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            ids: MOCK_PROJECT_CRAFT_LIST.projectCrafts.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_PROJECT_CRAFT_LIST.version,
            _links: MOCK_PROJECT_CRAFT_LIST._links,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Delete.One', () => {
        const action = new ProjectCraftActions.Delete.One(null);

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Delete.OneFulfilled()', () => {
        const action = new ProjectCraftActions.Delete.OneFulfilled(MOCK_PROJECT_CRAFT_LIST);

        nextState.items = MOCK_PROJECT_CRAFT_LIST.projectCrafts;
        nextState.list = Object.assign(new AbstractList<ProjectCraftListLinks>(), {
            ids: MOCK_PROJECT_CRAFT_LIST.projectCrafts.map((item) => item.id),
            requestStatus: RequestStatusEnum.success,
            version: MOCK_PROJECT_CRAFT_LIST.version,
            _links: MOCK_PROJECT_CRAFT_LIST._links,
        });

        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.Delete.OneRejected', () => {
        const action = new ProjectCraftActions.Delete.OneRejected();

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_CRAFT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectCraftsActionEnum.OneReset', () => {
        const action = new ProjectCraftActions.Delete.OneReset();

        midState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_CRAFT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(PROJECT_CRAFT_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });
});
