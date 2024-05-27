/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {WorkDaysQueries} from './work-days.queries';

describe('Work Days Queries', () => {
    let workDaysQueries: WorkDaysQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            WorkDaysQueries,
            {
                provide: Store,
                useValue: new MockStore({
                    projectModule: {
                        workDaysSlice: {
                            item: MOCK_WORK_DAYS,
                            requestStatus: RequestStatusEnum.success,
                        },
                    },
                }),
            },
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        workDaysQueries = TestBed.inject(WorkDaysQueries);
    });

    it('should observe start of the week', () => {
        workDaysQueries
            .observeStartOfWeek()
            .subscribe((result: WeekDaysEnum) =>
                expect(result).toEqual(MOCK_WORK_DAYS.startOfWeek));
    });

    it('should observe work days', () => {
        workDaysQueries
            .observeWorkDays()
            .subscribe((result: WorkDaysResource) =>
                expect(result).toEqual(MOCK_WORK_DAYS));
    });

    it('should observe work days request status', () => {
        workDaysQueries
            .observeWorkDaysRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe working days list', () => {
        workDaysQueries
            .observeWorkingDays()
            .subscribe((result: WeekDaysEnum[]) =>
                expect(result).toEqual(MOCK_WORK_DAYS.workingDays));
    });

    it('should observe allow work on non working days flag', () => {
        workDaysQueries
            .observeAllowWorkOnNonWorkingDays()
            .subscribe((result: boolean) =>
                expect(result).toEqual(MOCK_WORK_DAYS.allowWorkOnNonWorkingDays));
    });

    it('should observe holidays list', () => {
        workDaysQueries
            .observeHolidays()
            .subscribe((result: WorkDaysHoliday[]) =>
                expect(result).toEqual(MOCK_WORK_DAYS.holidays));
    });
});
