/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectCopyActionEnum} from './project-copy.actions';
import {PROJECT_COPY_SLICE_INITIAL_STATE} from './project-copy.initial-state';
import {PROJECT_COPY_REDUCER} from './project-copy.reducer';
import {ProjectCopySlice} from './project-copy.slice';

describe('Project Copy Reducer', () => {
    let initialState: ProjectCopySlice;
    let nextState: ProjectCopySlice;

    beforeEach(() => {
        initialState = PROJECT_COPY_SLICE_INITIAL_STATE;
        nextState = cloneDeep(PROJECT_COPY_SLICE_INITIAL_STATE);
    });

    it('should handle ProjectCopyAction.Initialize.All()', () => {
        const initializeProjectCopyAction: Action = {type: ProjectCopyActionEnum.InitializeAll};
        expect(PROJECT_COPY_REDUCER(initialState, initializeProjectCopyAction)).toEqual(initialState);
    });

    it('should handle ProjectCopyAction.Copy.One()', () => {
        const copyOneProjectCopyAction: Action = {type: ProjectCopyActionEnum.CopyOne};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        const result: ProjectCopySlice = PROJECT_COPY_REDUCER(initialState, copyOneProjectCopyAction);
        expect(result).toEqual(nextState);
    });

    it('should handle ProjectCopyAction.Copy.OneFulfilled()', () => {
        const postCopyFulfilledAction: Action = {type: ProjectCopyActionEnum.CopyOneFulfilled};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PROJECT_COPY_REDUCER(initialState, postCopyFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectCopyAction.Copy.OneRejected()', () => {
        const postCopyRejectedAction: Action = {type: ProjectCopyActionEnum.CopyOneRejected};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_COPY_REDUCER(initialState, postCopyRejectedAction)).toEqual(nextState);
    });

    it('should handle ProjectCopyAction.Copy.OneReset()', () => {
        const postCopyResetAction: Action = {type: ProjectCopyActionEnum.CopyOneReset};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_COPY_REDUCER(initialState, postCopyResetAction)).toEqual(nextState);
    });
});
