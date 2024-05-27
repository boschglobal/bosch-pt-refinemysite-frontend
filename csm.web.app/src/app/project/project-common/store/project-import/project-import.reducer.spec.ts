/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    PROJECT_IMPORT_ANALYZE_RESOURCE_1,
    PROJECT_IMPORT_UPLOAD_RESOURCE_1,
} from '../../../../../test/mocks/project-import';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectImportActions} from './project-import.actions';
import {PROJECT_IMPORT_INITIAL_STATE} from './project-import.initial-state';
import {PROJECT_IMPORT_REDUCER} from './project-import.reducer';
import {ProjectImportSlice} from './project-import.slice';

describe('Project Import Reducer', () => {
    let initialState: ProjectImportSlice;
    let midState: ProjectImportSlice;
    let nextState: ProjectImportSlice;

    beforeEach(() => {
        initialState = PROJECT_IMPORT_INITIAL_STATE;
        midState = cloneDeep(PROJECT_IMPORT_INITIAL_STATE);
        nextState = cloneDeep(PROJECT_IMPORT_INITIAL_STATE);
    });

    it('should handle ProjectImportActions.Initialize.All()', () => {
        const action = new ProjectImportActions.Initialize.All();

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle ProjectImportActions.Upload.One()', () => {
        const action = new ProjectImportActions.Upload.One(null);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            upload: RequestStatusEnum.progress,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Upload.OneFulfilled()', () => {
        const action = new ProjectImportActions.Upload.OneFulfilled(PROJECT_IMPORT_UPLOAD_RESOURCE_1);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            upload: RequestStatusEnum.success,
        });
        nextState.uploadResponse = PROJECT_IMPORT_UPLOAD_RESOURCE_1;

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Upload.OneRejected()', () => {
        const action = new ProjectImportActions.Upload.OneRejected();

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            upload: RequestStatusEnum.error,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Upload.OneReset()', () => {
        const action = new ProjectImportActions.Upload.OneReset();

        midState.requestStatus = Object.assign({}, nextState.requestStatus, {
            upload: RequestStatusEnum.progress,
        });

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            upload: RequestStatusEnum.empty,
        });

        expect(PROJECT_IMPORT_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Analyze.One()', () => {
        const action = new ProjectImportActions.Analyze.One(null, null);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            analyze: RequestStatusEnum.progress,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Analyze.OneFulfilled()', () => {
        const action = new ProjectImportActions.Analyze.OneFulfilled(PROJECT_IMPORT_ANALYZE_RESOURCE_1);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            analyze: RequestStatusEnum.success,
        });
        nextState.analyzeResponse = PROJECT_IMPORT_ANALYZE_RESOURCE_1;

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Analyze.OneRejected()', () => {
        const action = new ProjectImportActions.Analyze.OneRejected();

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            analyze: RequestStatusEnum.error,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Import.One()', () => {
        const action = new ProjectImportActions.Import.One(null);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            import: RequestStatusEnum.progress,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Import.OneFulfilled()', () => {
        const action = new ProjectImportActions.Import.OneFulfilled(null);

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            import: RequestStatusEnum.success,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectImportActions.Import.OneRejected()', () => {
        const action = new ProjectImportActions.Import.OneRejected();

        nextState.requestStatus = Object.assign({}, nextState.requestStatus, {
            import: RequestStatusEnum.error,
        });

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(PROJECT_IMPORT_REDUCER(initialState, action)).toEqual(initialState);
    });
});
