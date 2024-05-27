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
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';
import {take} from 'rxjs/operators';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    PROJECT_IMPORT_ANALYZE_RESOURCE_1,
    PROJECT_IMPORT_UPLOAD_RESOURCE_1,
    SAVE_PROJECT_IMPORT_ANALYZE_RESOURCE_1,
} from '../../../../../test/mocks/project-import';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectImportService} from '../../api/project-import/project-import.service';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectImportActions} from './project-import.actions';
import {ProjectImportEffects} from './project-import.effects';
import SpyObj = jasmine.SpyObj;

describe('Project Import Effects', () => {
    let actions: ReplaySubject<any>;
    let projectImportEffects: ProjectImportEffects;
    let projectImportService: SpyObj<ProjectImportService>;

    const uploadResource = PROJECT_IMPORT_UPLOAD_RESOURCE_1;
    const saveAnalyzeResource = SAVE_PROJECT_IMPORT_ANALYZE_RESOURCE_1;
    const analyzeResource = PROJECT_IMPORT_ANALYZE_RESOURCE_1;
    const projectId = 'foo';
    const jobId = 'bar';
    const file = new File([''], 'filename');
    const version = 1;

    const errorResponse: Observable<any> = throwError('error');
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectImportEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceServiceMock),
            },
            {
                provide: ProjectImportService,
                useValue: jasmine.createSpyObj('ProjectImportService', [
                    'upload',
                    'analyze',
                    'import',
                ]),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

        projectImportService = TestBed.inject(ProjectImportService) as SpyObj<ProjectImportService>;
        projectImportEffects = TestBed.inject(ProjectImportEffects);

        actions = new ReplaySubject(1);

        projectImportService.upload.calls.reset();
        projectImportService.analyze.calls.reset();
        projectImportService.import.calls.reset();
    });

    it('should trigger a ProjectImportActions.Upload.OneFulfilled action after uploading a project file successfully', () => {
        const expectedResult = new ProjectImportActions.Upload.OneFulfilled(uploadResource);

        projectImportService.upload.and.returnValue(of(uploadResource));

        actions.next(new ProjectImportActions.Upload.One(file));
        projectImportEffects.uploadOne$
            .pipe(take(1))
            .subscribe(result => {
                expect(projectImportService.upload).toHaveBeenCalledWith(projectId, file);
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger a ProjectImportActions.Upload.OneRejected action after uploading a project file failed', () => {
        const expectedResult = new ProjectImportActions.Upload.OneRejected();

        projectImportService.upload.and.returnValue(errorResponse);

        actions.next(new ProjectImportActions.Upload.One(file));
        projectImportEffects.uploadOne$
            .pipe(take(1))
            .subscribe(result => {
                expect(projectImportService.upload).toHaveBeenCalledWith(projectId, file);
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger a ProjectImportActions.Analyze.OneFulfilled action after analyzing a project file successfully', () => {
        const expectedResult = new ProjectImportActions.Analyze.OneFulfilled(analyzeResource);

        projectImportService.analyze.and.returnValue(of(analyzeResource));

        actions.next(new ProjectImportActions.Analyze.One(saveAnalyzeResource, version));
        projectImportEffects.analyzeOne$
            .pipe(take(1))
            .subscribe(result => {
                expect(projectImportService.analyze).toHaveBeenCalledWith(projectId, saveAnalyzeResource, version);
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger a ProjectImportActions.Analyze.OneRejected action after analyzing a project file failed', () => {
        const expectedResult = new ProjectImportActions.Analyze.OneRejected();

        projectImportService.analyze.and.returnValue(errorResponse);

        actions.next(new ProjectImportActions.Analyze.One(saveAnalyzeResource, version));
        projectImportEffects.analyzeOne$
            .pipe(take(1))
            .subscribe(result => {
                expect(projectImportService.analyze).toHaveBeenCalledWith(projectId, saveAnalyzeResource, version);
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger a ProjectImportActions.Import.OneFulfilled and a AlertActions.Add.NeutralAlert action after importing a' +
        ' project file successfully', () => {
        const effectResults = [];
        const key = 'Job_ProjectImportCard_RunningStatusTitle';
        const expectedSecondResult = new AlertActions.Add.NeutralAlert({message: new AlertMessageResource(key)});
        const expectedFirsResult = new ProjectImportActions.Import.OneFulfilled(jobId);

        projectImportService.import.and.returnValue(of({id: jobId}));

        actions.next(new ProjectImportActions.Import.One(version));

        projectImportEffects.importOne$.subscribe(result => effectResults.push(result));
        expect(projectImportService.import).toHaveBeenCalledWith(projectId, version);
        expect(effectResults.length).toEqual(2);

        expect(effectResults[0]).toEqual(expectedFirsResult);

        expect(effectResults[1].type).toBe(expectedSecondResult.type);
        expect(effectResults[1].payload.type).toBe(expectedSecondResult.payload.type);
        expect(effectResults[1].payload.message).toEqual(expectedSecondResult.payload.message);
    });

    it('should trigger a ProjectImportActions.Import.OneRejected action after importing a project file failed', () => {
        const expectedResult = new ProjectImportActions.Import.OneRejected();

        projectImportService.import.and.returnValue(errorResponse);

        actions.next(new ProjectImportActions.Import.One(version));
        projectImportEffects.importOne$
            .pipe(take(1))
            .subscribe(result => {
                expect(projectImportService.import).toHaveBeenCalledWith(projectId, version);
                expect(result).toEqual(expectedResult);
            });
    });
});
