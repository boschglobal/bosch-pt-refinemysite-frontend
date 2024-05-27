/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {
    cloneDeep,
    unionBy
} from 'lodash';

import {
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../test/mocks/constraints';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SaveConstraintResource} from '../../api/constraints/resources/save-constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintActions} from './constraint.actions';
import {CONSTRAINT_INITIAL_STATE} from './constraint.initial-state';
import {CONSTRAINT_REDUCER} from './constraint.reducer';
import {ConstraintSlice} from './constraint.slice';

describe('Constraint Reducer', () => {
    let initialState: ConstraintSlice;
    let midState: ConstraintSlice;
    let nextState: ConstraintSlice;

    const constraintEntityList: ConstraintEntity[] = [
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
    ];
    const constraintEntity = constraintEntityList[0];

    beforeEach(() => {
        initialState = CONSTRAINT_INITIAL_STATE;
        midState = cloneDeep(CONSTRAINT_INITIAL_STATE);
        nextState = cloneDeep(CONSTRAINT_INITIAL_STATE);
    });

    it('should handle ConstraintActions.Initialize.All()', () => {
        const action: Action = new ConstraintActions.Initialize.All();

        expect(CONSTRAINT_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle ConstraintActions.Request.All()', () => {
        const action: Action = new ConstraintActions.Request.All();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Request.AllFulfilled()', () => {
        const action: Action = new ConstraintActions.Request.AllFulfilled(constraintEntityList);

        nextState.items = constraintEntityList;

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: constraintEntityList.map(item => item.id),
            requestStatus: RequestStatusEnum.success,
        });

        expect(CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Request.AllRejected()', () => {
        const action: Action = new ConstraintActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(CONSTRAINT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.One()', () => {
        const constraintSaveResource: SaveConstraintResource = {
            key: constraintEntity.key,
            active: constraintEntity.active,
            name: constraintEntity.name,
        };
        const action: Action = new ConstraintActions.Update.One(constraintSaveResource);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.OneFulfilled()', () => {
        const action: Action = new ConstraintActions.Update.OneFulfilled(constraintEntity);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.OneRejected()', () => {
        const action: Action = new ConstraintActions.Update.OneRejected(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Update.OneReset()', () => {
        const action: Action = new ConstraintActions.Update.OneReset(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Activate.One()', () => {
        const constraintSaveResource: SaveConstraintResource = {
            key: constraintEntity.key,
            active: constraintEntity.active,
            name: constraintEntity.name,
        };
        const action: Action = new ConstraintActions.Activate.One(constraintSaveResource);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Activate.OneFulfilled()', () => {
        const action: Action = new ConstraintActions.Activate.OneFulfilled(constraintEntity);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Activate.OneRejected()', () => {
        const action: Action = new ConstraintActions.Activate.OneRejected(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Activate.OneReset()', () => {
        const action: Action = new ConstraintActions.Activate.OneReset(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Deactivate.One()', () => {
        const constraintSaveResource: SaveConstraintResource = {
            key: constraintEntity.key,
            active: constraintEntity.active,
            name: constraintEntity.name,
        };
        const action: Action = new ConstraintActions.Deactivate.One(constraintSaveResource);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Deactivate.OneFulfilled()', () => {
        const action: Action = new ConstraintActions.Deactivate.OneFulfilled(constraintEntity);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Deactivate.OneRejected()', () => {
        const action: Action = new ConstraintActions.Deactivate.OneRejected(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ConstraintActions.Deactivate.OneReset()', () => {
        const action: Action = new ConstraintActions.Deactivate.OneReset(constraintEntity.id);
        const constraintWithUpdatedRequestStatus = Object.assign({}, constraintEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = constraintEntityList;

        nextState.items = unionBy([constraintWithUpdatedRequestStatus], constraintEntityList, 'id');

        expect(CONSTRAINT_REDUCER(midState, action)).toEqual(nextState);
    });
});
