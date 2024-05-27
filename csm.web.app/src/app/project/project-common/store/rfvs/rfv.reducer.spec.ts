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
    MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
} from '../../../../../test/mocks/rfvs';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SaveRfvResource} from '../../api/rfvs/resources/save-rfv.resource';
import {RfvActions} from './rfv.actions';
import {RFV_SLICE_INITIAL_STATE} from './rfv.initial-state';
import {RFV_REDUCER} from './rfv.reducer';
import {RfvSlice} from './rfv.slice';

describe('RFV Reducer', () => {
    let initialState: RfvSlice;
    let midState: RfvSlice;
    let nextState: RfvSlice;

    const projectId = 'foo';
    const rfvEntityList = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    ];
    const rfvEntity = rfvEntityList[0];

    beforeEach(() => {
        initialState = RFV_SLICE_INITIAL_STATE;
        midState = cloneDeep(RFV_SLICE_INITIAL_STATE);
        nextState = cloneDeep(RFV_SLICE_INITIAL_STATE);
    });

    it('should handle RfvActions.Initialize.All()', () => {
        const action: Action = new RfvActions.Initialize.All();

        expect(RFV_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle RfvActions.Request.All()', () => {
        const action: Action = new RfvActions.Request.All();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(RFV_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Request.AllFulfilled()', () => {
        const action: Action = new RfvActions.Request.AllFulfilled(rfvEntityList);

        nextState.items = rfvEntityList;

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            ids: rfvEntityList.map(item => item.id),
            requestStatus: RequestStatusEnum.success,
        });

        expect(RFV_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Request.AllRejected()', () => {
        const action: Action = new RfvActions.Request.AllRejected();

        nextState.list = Object.assign(new AbstractList(), initialState.list, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(RFV_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Update.One()', () => {
        const rfvSaveResource: SaveRfvResource = {key: rfvEntity.key, active: rfvEntity.active, name: rfvEntity.name};
        const action: Action = new RfvActions.Update.One(projectId, rfvSaveResource);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Update.OneFulfilled()', () => {
        const action: Action = new RfvActions.Update.OneFulfilled(rfvEntity);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Update.OneRejected()', () => {
        const action: Action = new RfvActions.Update.OneRejected(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Update.OneReset()', () => {
        const action: Action = new RfvActions.Update.OneReset(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Activate.One()', () => {
        const rfvSaveResource: SaveRfvResource = {key: rfvEntity.key, name: rfvEntity.name, active: rfvEntity.active};
        const action: Action = new RfvActions.Activate.One(projectId, rfvSaveResource);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Activate.OneFulfilled()', () => {
        const action: Action = new RfvActions.Activate.OneFulfilled(rfvEntity);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Activate.OneRejected()', () => {
        const action: Action = new RfvActions.Activate.OneRejected(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Activate.OneReset()', () => {
        const action: Action = new RfvActions.Activate.OneReset(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Deactivate.One()', () => {
        const rfvSaveResource: SaveRfvResource = {key: rfvEntity.key, name: rfvEntity.name, active: rfvEntity.active};
        const action: Action = new RfvActions.Deactivate.One(projectId, rfvSaveResource);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.progress});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Deactivate.OneFulfilled()', () => {
        const action: Action = new RfvActions.Deactivate.OneFulfilled(rfvEntity);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.success});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Deactivate.OneRejected()', () => {
        const action: Action = new RfvActions.Deactivate.OneRejected(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.error});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RfvActions.Deactivate.OneReset()', () => {
        const action: Action = new RfvActions.Deactivate.OneReset(rfvEntity.id);
        const rfvWithUpdatedRequestStatus = Object.assign({}, rfvEntity, {requestStatus: RequestStatusEnum.empty});

        midState.items = rfvEntityList;

        nextState.items = unionBy([rfvWithUpdatedRequestStatus], rfvEntityList, 'id');

        expect(RFV_REDUCER(midState, action)).toEqual(nextState);
    });
});
