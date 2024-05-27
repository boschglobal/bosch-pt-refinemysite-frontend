/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore,
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {take} from 'rxjs/operators';

import {
    PROJECT_IMPORT_ANALYZE_RESOURCE_1,
    PROJECT_IMPORT_UPLOAD_RESOURCE_1,
} from '../../../../../test/mocks/project-import';
import {
    INITIAL_STATE,
    State,
} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {ProjectImportQueries} from './project-import.queries';
import {ProjectImportStep} from './project-import.slice';

describe('Project Import Queries', () => {
    let projectImportQueries: ProjectImportQueries;
    let store: MockStore;

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const steps: ProjectImportStep[] = ['upload', 'analyze', 'import'];
    const initialState: State = INITIAL_STATE;
    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            ProjectImportQueries,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        projectImportQueries = TestBed.inject(ProjectImportQueries);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => store.setState(initialState));

    it('should observe analyze response', () => {
        const newState = cloneDeep(initialState);
        const results = [];

        projectImportQueries.observeAnalyzeResponse()
            .pipe(take(2))
            .subscribe(result => results.push(result));

        newState.projectModule.projectImportSlice.analyzeResponse = PROJECT_IMPORT_ANALYZE_RESOURCE_1;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toBeNull();
        expect(results[1]).toEqual(PROJECT_IMPORT_ANALYZE_RESOURCE_1);
    });

    it('should observe upload response', () => {
        const newState = cloneDeep(initialState);
        const results = [];

        projectImportQueries.observeUploadResponse()
            .pipe(take(2))
            .subscribe(result => results.push(result));

        newState.projectModule.projectImportSlice.uploadResponse = PROJECT_IMPORT_UPLOAD_RESOURCE_1;
        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toBeNull();
        expect(results[1]).toEqual(PROJECT_IMPORT_UPLOAD_RESOURCE_1);
    });

    steps.forEach(step => {
        it(`should observe request status for step ${step}`, () => {
            const newState = cloneDeep(initialState);
            const defaultRequestStatus = PROJECT_MODULE_INITIAL_STATE.projectImportSlice.requestStatus[step];
            const newRequestStatus = RequestStatusEnum.progress;
            const results = [];

            projectImportQueries.observeRequestStatus(step)
                .pipe(take(2))
                .subscribe(result => results.push(result));

            newState.projectModule.projectImportSlice.requestStatus[step] = newRequestStatus;

            setStoreState(newState);

            expect(results.length).toBe(2);
            expect(results[0]).toBe(defaultRequestStatus);
            expect(results[1]).toBe(newRequestStatus);
        });
    });
});
