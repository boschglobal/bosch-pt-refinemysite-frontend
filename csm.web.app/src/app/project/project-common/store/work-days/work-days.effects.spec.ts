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
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_UPDATE_WORK_DAYS_PAYLOAD,
    MOCK_WORK_DAYS
} from '../../../../../test/mocks/workdays';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {WorkDaysService} from '../../api/work-days/work-days.service';
import {ProjectDateLocaleHelper} from '../../helpers/project-date-locale.helper.service';
import {WorkDaysActions} from './work-days.actions';
import {WorkDaysEffects} from './work-days.effects';

describe('Work Days Effects', () => {
    let projectDateLocaleHelper: jasmine.SpyObj<ProjectDateLocaleHelper>;
    let workDaysService: jasmine.SpyObj<WorkDaysService>;
    let workDaysEffects: WorkDaysEffects;
    let actions: ReplaySubject<any>;

    const getWorkDaysResponse: Observable<WorkDaysResource> = of(MOCK_WORK_DAYS);
    const updateWorkDaysResponse: Observable<WorkDaysResource> = of(MOCK_WORK_DAYS);
    const errorResponse: Observable<any> = throwError('error');

    const moduleDef: TestModuleMetadata = {
        providers: [
            WorkDaysEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectDateLocaleHelper,
                useValue: jasmine.createSpyObj('ProjectDateLocaleHelper', ['configProjectMomentLocaleFirstDayOfWeek']),
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id,
                                },
                            },
                            workDaysSlice: {
                                item: MOCK_WORK_DAYS,
                                requestStatus: RequestStatusEnum.success,
                            },
                        },
                    }
                ),
            },
            {
                provide: WorkDaysService,
                useValue: jasmine.createSpyObj('WorkDaysService', ['findAll', 'update']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectDateLocaleHelper = TestBed.inject(ProjectDateLocaleHelper) as jasmine.SpyObj<ProjectDateLocaleHelper>;
        workDaysService = TestBed.inject(WorkDaysService) as jasmine.SpyObj<WorkDaysService>;
        workDaysEffects = TestBed.inject(WorkDaysEffects);

        actions = new ReplaySubject(1);

        projectDateLocaleHelper.configProjectMomentLocaleFirstDayOfWeek.calls.reset();
    });

    it('should trigger a WorkDaysActions.Request.OneFulfilled after a successful get work days request', () => {
        const expectedResult = new WorkDaysActions.Request.OneFulfilled(MOCK_WORK_DAYS);

        workDaysService.findAll.and.returnValue(getWorkDaysResponse);
        actions.next(new WorkDaysActions.Request.One());

        workDaysEffects.requestOne$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should config project moment locale first day of week after a successful get work days request', () => {
        const expectedResult = MOCK_WORK_DAYS.startOfWeek;

        workDaysService.findAll.and.returnValue(getWorkDaysResponse);
        actions.next(new WorkDaysActions.Request.One());

        workDaysEffects.requestOne$.subscribe(() =>
            expect(projectDateLocaleHelper.configProjectMomentLocaleFirstDayOfWeek).toHaveBeenCalledWith(expectedResult));
    });

    it('should trigger a WorkDaysActions.Request.OneRejected after a unsuccessful request', () => {
        const expectedResult = new WorkDaysActions.Request.OneRejected();

        workDaysService.findAll.and.returnValue(errorResponse);
        actions.next(new WorkDaysActions.Request.One());

        workDaysEffects.requestOne$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a WorkDaysActions.Update.OneFulfilled and AlertActions.Add.SuccessAlert actions after a ' +
        'successful request', () => {
        const results: Action[] = [];
        const firstExpectedResult = new WorkDaysActions.Update.OneFulfilled(MOCK_WORK_DAYS);
        const secondExpectedResult = new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('WorkingDays_Update_SuccessMessage'),
        });

        workDaysService.update.and.returnValue(updateWorkDaysResponse);
        actions.next(new WorkDaysActions.Update.One(MOCK_UPDATE_WORK_DAYS_PAYLOAD, MOCK_WORK_DAYS.version));

        workDaysEffects.updateOne$.subscribe(result => results.push(result));

        const firstResult = results[0] as WorkDaysActions.Update.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should config project moment locale first day of week after a successful update work days request', () => {
        const expectedResult = MOCK_WORK_DAYS.startOfWeek;

        workDaysService.findAll.and.returnValue(updateWorkDaysResponse);
        actions.next(new WorkDaysActions.Update.One(MOCK_UPDATE_WORK_DAYS_PAYLOAD, MOCK_WORK_DAYS.version));

        workDaysEffects.updateOne$.subscribe(() =>
            expect(projectDateLocaleHelper.configProjectMomentLocaleFirstDayOfWeek).toHaveBeenCalledWith(expectedResult));
    });

    it('should trigger a WorkDaysActions.Update.OneRejected after a unsuccessful request', () => {
        const expectedResult = new WorkDaysActions.Update.OneRejected();

        workDaysService.update.and.returnValue(errorResponse);
        actions.next(new WorkDaysActions.Update.One(MOCK_UPDATE_WORK_DAYS_PAYLOAD, MOCK_WORK_DAYS.version));

        workDaysEffects.updateOne$.subscribe(result => expect(result).toEqual(expectedResult));
    });
});
