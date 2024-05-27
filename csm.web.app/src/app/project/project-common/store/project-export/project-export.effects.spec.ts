/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
    throwError
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../../test/mocks/store';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {ProjectExportService} from '../../api/project-export/project-export.service';
import {ProjectExportResource} from '../../api/project-export/resources/project-export.resource';
import {ProjectExportFormatEnum} from '../../enums/project-export-format.enum';
import {ProjectExportSchedulingTypeEnum} from '../../enums/project-export-scheduling-type.enum';
import {ProjectExportAction} from './project-export.actions';
import {ProjectExportEffects} from './project-export.effects';
import {PROJECT_EXPORT_INITIAL_STATE} from './project-export.initial-state';

describe('Project Export Effects', () => {
    let projectExportEffects: ProjectExportEffects;
    let actions: ReplaySubject<any>;

    const projectExportServiceMock: ProjectExportService = mock(ProjectExportService);

    const projectId = 'foo';

    const projectExportResource: ProjectExportResource = {
        format: ProjectExportFormatEnum.MSProject,
        includeComments: false,
        milestoneExportSchedulingType: ProjectExportSchedulingTypeEnum.ManuallyScheduled,
        taskExportSchedulingType: ProjectExportSchedulingTypeEnum.AutoScheduled,
    };

    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectExportEffects,
            {
                provide: ProjectExportService,
                useFactory: () => instance(projectExportServiceMock),
            },
            provideMockActions(() => actions),
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            calendarSlice: PROJECT_EXPORT_INITIAL_STATE,
                        },
                    }
                ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectExportEffects = TestBed.inject(ProjectExportEffects);
        actions = new ReplaySubject(1);
    });

    it('should trigger a ProjectExportAction.Export.OneFulfilled and a AlertActions.Add.NeutralAlert action ' +
        'after a successful project export request', () => {
        const results: Action[] = [];
        const jobId = 'bar';
        const {format} = projectExportResource;
        const response = new BehaviorSubject<AbstractResource>({id: jobId});
        const expectedFirstAction = new ProjectExportAction.Export.OneFulfilled(jobId);
        const expectedSecondAction = new AlertActions.Add.NeutralAlert(
            {message: new AlertMessageResource('Job_ProjectExportCard_RunningStatusTitle', {format})});

        when(projectExportServiceMock.getFile(projectId, projectExportResource)).thenReturn(response);

        actions.next(new ProjectExportAction.Export.One(projectId, projectExportResource));

        projectExportEffects.exportProject$.subscribe(result => results.push(result));

        const firstResult = results[0] as ProjectExportAction.Export.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.NeutralAlert;

        expect(firstResult).toEqual(expectedFirstAction);
        expect(secondResult.type).toBe(expectedSecondAction.type);
        expect(secondResult.payload.type).toBe(expectedSecondAction.payload.type);
        expect(secondResult.payload.message).toEqual(expectedSecondAction.payload.message);
    });

    it('should trigger a ProjectExportAction.Export.OneRejected action after a unsuccessful project export request', () => {
        const expectedAction = new ProjectExportAction.Export.OneRejected();

        when(projectExportServiceMock.getFile(projectId, projectExportResource)).thenReturn(errorResponse);

        actions.next(new ProjectExportAction.Export.One(projectId, projectExportResource));
        projectExportEffects.exportProject$.subscribe(result => expect(result).toEqual(expectedAction));
    });
});
