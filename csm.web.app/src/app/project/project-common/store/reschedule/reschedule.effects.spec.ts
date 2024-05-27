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
import {provideMockStore} from '@ngrx/store/testing';
import {
    of,
    ReplaySubject,
    throwError
} from 'rxjs';
import {
    take,
    toArray
} from 'rxjs/operators';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_RESCHEDULE_JOB_ID_RESOURCE,
    MOCK_RESCHEDULE_ONE_FULFILLED_ALERT_ID,
    MOCK_RESCHEDULE_RESOURCE,
    MOCK_SAVE_RESCHEDULE_RESOURCE
} from '../../../../../test/mocks/project-reschedule';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {RescheduleService} from '../../api/reschedule/reschedule.service';
import {MilestoneActions} from '../milestones/milestone.actions';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectTaskActions} from '../tasks/task.actions';
import {RescheduleActions} from './reschedule.actions';
import {RescheduleEffects} from './reschedule.effects';

describe('Reschedule Effects', () => {
    let rescheduleEffects: RescheduleEffects;
    let rescheduleService: any;
    let actions: ReplaySubject<any>;

    const projectSliceServiceMock = mock(ProjectSliceService);
    const projectId = MOCK_PROJECT_1.id;
    const alertResourceId = MOCK_RESCHEDULE_ONE_FULFILLED_ALERT_ID;
    const errorResponse = throwError('error');
    const validateResponse = MOCK_RESCHEDULE_RESOURCE;
    const validateResponseWithFailedItems = {
        ...MOCK_RESCHEDULE_RESOURCE,
        failed: {
            tasks: ['foo'],
            milestones: ['bar'],
        },
    };
    const rescheduleResponse = MOCK_RESCHEDULE_JOB_ID_RESOURCE;

    const moduleDef: TestModuleMetadata = {
        providers: [
            RescheduleEffects,
            provideMockStore({}),
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceServiceMock),
            },
            {
                provide: RescheduleService,
                useValue: jasmine.createSpyObj('RescheduleService', ['validate', 'reschedule']),
            },
        ],
    };

    when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        rescheduleEffects = TestBed.inject(RescheduleEffects);
        rescheduleService = TestBed.inject(RescheduleService);
        actions = new ReplaySubject(1);

        rescheduleService.validate.calls.reset();
        rescheduleService.reschedule.calls.reset();
    });

    it('should call RescheduleService::validate on dispatch of RescheduleActions.Validate.One ' +
        'and then trigger a RescheduleActions.Validate.OneFulfilled after validate responded successfully', (done) => {
        const expectedResult = new RescheduleActions.Validate.OneFulfilled(MOCK_RESCHEDULE_RESOURCE);

        rescheduleService.validate.and.returnValue(of(validateResponse));

        actions.next(new RescheduleActions.Validate.One(MOCK_SAVE_RESCHEDULE_RESOURCE));

        rescheduleEffects.validate$
            .pipe(
                take(1)
            )
            .subscribe(result => {
                expect(rescheduleService.validate).toHaveBeenCalledWith(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE);
                expect(result).toEqual(expectedResult);
                done();
            });
    });

    it('should call RescheduleService::validate on dispatch of RescheduleActions.Validate.One '
        + 'and then trigger a RescheduleActions.Validate.OneFulfilled '
        + 'and also ProjectTaskActions.Request.AllByIds and MilestoneActions.Request.AllByIds '
        + 'after validate responded successfully but with failed items', (done) => {
        const expectedResult = [
            new RescheduleActions.Validate.OneFulfilled(validateResponseWithFailedItems),
            new ProjectTaskActions.Request.AllByIds(validateResponseWithFailedItems.failed.tasks),
            new MilestoneActions.Request.AllByIds(validateResponseWithFailedItems.failed.milestones),
        ];

        rescheduleService.validate.and.returnValue(of(validateResponseWithFailedItems));

        actions.next(new RescheduleActions.Validate.One(MOCK_SAVE_RESCHEDULE_RESOURCE));

        rescheduleEffects.validate$
            .pipe(
                take(3),
                toArray(),
            )
            .subscribe(result => {
                expect(rescheduleService.validate).toHaveBeenCalledWith(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE);
                expect(result).toEqual(expectedResult);
                done();
            });
    });

    it('should call RescheduleService::validate on dispatch of RescheduleActions.Validate.One '
        + 'and then trigger a RescheduleActions.Validate.OneRejected after validate responded with an error', (done) => {
        const expectedResult = new RescheduleActions.Validate.OneRejected();

        rescheduleService.validate.and.returnValue(errorResponse);

        actions.next(new RescheduleActions.Validate.One(MOCK_SAVE_RESCHEDULE_RESOURCE));

        rescheduleEffects.validate$
            .pipe(
                take(1),
            )
            .subscribe(result => {
                expect(rescheduleService.validate).toHaveBeenCalledWith(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE);
                expect(result).toEqual(expectedResult);
                done();
            });
    });

    it('should call RescheduleService::reschedule on dispatch of RescheduleActions.Reschedule.One ' +
        'and then trigger a RescheduleActions.Reschedule.OneFulfilled after reschedule responded successfully', (done) => {
        spyOn(UUID, 'v4').and.returnValue(alertResourceId);

        const expectedResult = [
            new RescheduleActions.Reschedule.OneFulfilled(rescheduleResponse.id),
            new AlertActions.Add.NeutralAlert(
                {message: new AlertMessageResource('Job_ProjectRescheduleCard_RunningStatusTitle')}),
        ];

        rescheduleService.reschedule.and.returnValue(of(rescheduleResponse));

        actions.next(new RescheduleActions.Reschedule.One(MOCK_SAVE_RESCHEDULE_RESOURCE));

        rescheduleEffects.reschedule$
            .pipe(
                take(2),
                toArray()
            )
            .subscribe(result => {
                expect(rescheduleService.reschedule).toHaveBeenCalledWith(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE);
                expect(result).toEqual(expectedResult);
                done();
            });
    });

    it('should call RescheduleService::reschedule on dispatch of RescheduleActions.Reschedule.One ' +
    'and then trigger a RescheduleActions.Reschedule.OneRejected after reschedule responded with an error', (done) => {
        const expectedResult = new RescheduleActions.Reschedule.OneRejected();

        rescheduleService.reschedule.and.returnValue(errorResponse);

        actions.next(new RescheduleActions.Reschedule.One(MOCK_SAVE_RESCHEDULE_RESOURCE));

        rescheduleEffects.reschedule$
            .pipe(
                take(1)
            )
            .subscribe(result => {
                expect(rescheduleService.reschedule).toHaveBeenCalledWith(projectId, MOCK_SAVE_RESCHEDULE_RESOURCE);
                expect(result).toEqual(expectedResult);
                done();
            });
    });
});
