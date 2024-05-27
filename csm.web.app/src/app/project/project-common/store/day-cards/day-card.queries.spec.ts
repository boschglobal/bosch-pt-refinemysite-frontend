/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {
    MOCK_DAY_CARD_WITHOUT_DATE,
    MOCK_DAY_CARD_WITHOUT_DATE_2
} from '../../../../../test/mocks/day-cards';
import {MockStore} from '../../../../../test/mocks/store';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    TaskScheduleLinks,
    TaskScheduleResource,
    TaskScheduleSlotResource
} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {DayCard} from '../../models/day-cards/day-card';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {TaskScheduleSlice} from '../task-schedules/task-schedule.slice';
import {DayCardQueries} from './day-card.queries';
import {DayCardSlice} from './day-card.slice';

describe('Day Card Queries', () => {
    let dayCardQueries: DayCardQueries;
    let store: any;

    const taskId = MOCK_DAY_CARD_WITHOUT_DATE.task.id;
    const date = '2018-01-20';
    const date2 = '2018-01-21';

    const dayCardList: AbstractList<TaskScheduleLinks> = {
        ids: [MOCK_DAY_CARD_WITHOUT_DATE.id],
        requestStatus: RequestStatusEnum.success,
        version: 0,
    };

    const dayCardSlice: DayCardSlice = {
        currentItem: {
            id: MOCK_DAY_CARD_WITHOUT_DATE.id,
            requestStatus: RequestStatusEnum.success,
        },
        items: [
            MOCK_DAY_CARD_WITHOUT_DATE,
            MOCK_DAY_CARD_WITHOUT_DATE_2,
        ],
    };

    const taskScheduleResource: TaskScheduleResource = {
        id: 'scheduleId',
        start: date,
        end: date2,
        task: new ResourceReference(taskId, 'taskName'),
        slots: [
            new TaskScheduleSlotResource(new ResourceReference(MOCK_DAY_CARD_WITHOUT_DATE.id, MOCK_DAY_CARD_WITHOUT_DATE.title), date),
            new TaskScheduleSlotResource(new ResourceReference(MOCK_DAY_CARD_WITHOUT_DATE_2.id, MOCK_DAY_CARD_WITHOUT_DATE_2.title), date2),
        ],
        _links: {
            self: {
                href: '',
            },
            add: {
                href: '',
            },
        },
        createdBy: new ResourceReference('userID', 'userName'),
        createdDate: date,
        lastModifiedBy: new ResourceReference('userID', 'userName'),
        lastModifiedDate: date,
    };
    const taskScheduleEntity = TaskScheduleEntity.fromResource(taskScheduleResource);

    const taskScheduleSlice: TaskScheduleSlice = {
        items: [taskScheduleEntity],
        lists: Object.assign(new Map(), {
            [taskId]: dayCardList,
        }),
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            DayCardQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            dayCardSlice,
                            taskScheduleSlice,
                        },
                    }
                ),
            },
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        dayCardQueries = TestBed.inject(DayCardQueries);
        store = TestBed.inject(Store);
    });

    it('should observe day cards by task', () => {

        const expectedResult: DayCard[] = [
            DayCard.fromDayCardResource(MOCK_DAY_CARD_WITHOUT_DATE, date),
            DayCard.fromDayCardResource(MOCK_DAY_CARD_WITHOUT_DATE_2, date2),
        ];

        dayCardQueries
            .observeDayCardsByTask(taskId)
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should filter correctly day cards by task when dayCards slice does not have data yet', () => {
        const initItems = store._value.projectModule.dayCardSlice.items;

        store._value.projectModule.dayCardSlice.items = [];

        dayCardQueries
            .observeDayCardsByTask(taskId)
            .subscribe(result => {
                store._value.projectModule.dayCardSlice.items = initItems;
                expect(result).toEqual([]);
            });
    });

    it('should observe task schedule by task', () => {
        dayCardQueries
            .observeTaskScheduleByTaskId(taskId)
            .subscribe(result =>
                expect(result).toEqual(TaskSchedule.fromTaskScheduleEntity(taskScheduleEntity)));
    });

    it('should observe day card by id', () => {
        const expectedResult = DayCard.fromDayCardResource(MOCK_DAY_CARD_WITHOUT_DATE, date);

        dayCardQueries
            .observeDayCardById(MOCK_DAY_CARD_WITHOUT_DATE.id)
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe day card null', () => {
        const expectedResult = undefined;

        dayCardQueries
            .observeDayCardById('missingID')
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe day cards request status by task', () => {
        dayCardQueries
            .observeDayCardRequestStatusByTask(taskId)
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should observe current day card request status', () => {
        dayCardQueries
            .observeCurrentDayCardRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toEqual(RequestStatusEnum.success));
    });

    it('should check add day card permission', () => {
        expect(dayCardQueries.hasAddPermissionByTask(taskId)).toBeTruthy();
    });

    it('should check if a day card exists', () => {
        expect(dayCardQueries.dayCardExists(MOCK_DAY_CARD_WITHOUT_DATE.id)).toBeTruthy();
        expect(dayCardQueries.dayCardExists('MISSING-ID')).toBeFalsy();
    });

    it('should retrieve a day card by its id', () => {
        const expectedResult = DayCard.fromDayCardResource(MOCK_DAY_CARD_WITHOUT_DATE, date);

        expect(dayCardQueries.getDayCardById(MOCK_DAY_CARD_WITHOUT_DATE.id)).toEqual(expectedResult);
    });
});
