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
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {
    BehaviorSubject,
    of,
} from 'rxjs';
import {
    deepEqual,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_B,
} from '../../../../../../test/mocks/day-cards';
import {
    MOCK_TASK,
    MOCK_TASK_2
} from '../../../../../../test/mocks/tasks';
import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {CalendarSelectionContextEnum} from '../../../enums/calendar-selection-context.enum';
import {DayCard} from '../../../models/day-cards/day-card';
import {Task} from '../../../models/tasks/task';
import {DayCardQueries} from '../../day-cards/day-card.queries';
import {PROJECT_MODULE_INITIAL_STATE} from '../../project-module.initial-state';
import {ProjectTaskQueries} from '../../tasks/task-queries';
import {CalendarSelectionQueries} from './calendar-selection.queries';

describe('Calendar Selection Queries', () => {
    let calendarSelectionQueries: CalendarSelectionQueries;
    let store: MockStore;

    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const dayCardQueriesMock: DayCardQueries = mock(DayCardQueries);

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: PROJECT_MODULE_INITIAL_STATE,
    };

    const calendarSelectionSlice = initialState.projectModule.calendarModule.calendarSelectionSlice;

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: DayCardQueries,
                useValue: instance(dayCardQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            CalendarSelectionQueries,
            provideMockStore({initialState}),
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        calendarSelectionQueries = TestBed.inject(CalendarSelectionQueries);
        store = TestBed.inject(MockStore);
    });

    it('should observe calendar selection items', () => {
        const expectedResult = calendarSelectionSlice.items;

        calendarSelectionQueries
            .observeCalendarSelectionItems()
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe calendar selection context', () => {
        const expectedResult = calendarSelectionSlice.context;

        calendarSelectionQueries
            .observeCalendarSelectionContext()
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe calendar selection by context', () => {
        const results = [];
        const newState = cloneDeep(initialState);

        calendarSelectionQueries
            .observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.Dependencies)
            .subscribe(result => results.push(result));

        newState.projectModule.calendarModule.calendarSelectionSlice.context = CalendarSelectionContextEnum.Dependencies;

        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toBeFalsy();
        expect(results[1]).toBeTruthy();
    });

    it('should observe daycard selection items', () => {
        const newState = cloneDeep(initialState);
        const expectedItems = [MOCK_DAY_CARD_A, MOCK_DAY_CARD_B];

        when(dayCardQueriesMock.observeDayCardById(expectedItems[0].id)).thenReturn(of(expectedItems[0]));
        when(dayCardQueriesMock.observeDayCardById(expectedItems[1].id)).thenReturn(of(expectedItems[1]));

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, expectedItems[0].id),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, expectedItems[1].id),
            new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'foo'),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeDayCardSelectionItems()
            .subscribe(items => expect(items).toEqual(expectedItems));
    });

    it('should observe daycard selection items when daycards are the same as the previously selected', () => {
        const observeDayCardByIdSubjectA = new BehaviorSubject<DayCard>(MOCK_DAY_CARD_A);
        const observeDayCardByIdSubjectB = new BehaviorSubject<DayCard>(MOCK_DAY_CARD_B);
        const newState = cloneDeep(initialState);
        const expectedItems = [MOCK_DAY_CARD_A, MOCK_DAY_CARD_B];
        const result = [];

        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_A.id)).thenReturn(observeDayCardByIdSubjectA);
        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_B.id)).thenReturn(observeDayCardByIdSubjectB);

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_A.id),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_B.id),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeDayCardSelectionItems()
            .subscribe(items => result.push(items));

        observeDayCardByIdSubjectA.next(MOCK_DAY_CARD_A);

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(expectedItems);
    });

    it('should observe daycard selection items when daycards are different than the previously selected', () => {
        const observeDayCardByIdSubjectA = new BehaviorSubject<DayCard>(MOCK_DAY_CARD_A);
        const observeDayCardByIdSubjectB = new BehaviorSubject<DayCard>(MOCK_DAY_CARD_B);
        const mockDayCardAChanged: DayCard = {
            ...MOCK_DAY_CARD_A,
            version: MOCK_DAY_CARD_A.version + 1,
        };
        const newState = cloneDeep(initialState);
        const firstResult = [MOCK_DAY_CARD_A, MOCK_DAY_CARD_B];
        const secondResult = [mockDayCardAChanged, MOCK_DAY_CARD_B];
        const result = [];

        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_A.id)).thenReturn(observeDayCardByIdSubjectA);
        when(dayCardQueriesMock.observeDayCardById(MOCK_DAY_CARD_B.id)).thenReturn(observeDayCardByIdSubjectB);

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_A.id),
            new ObjectIdentifierPair(ObjectTypeEnum.DayCard, MOCK_DAY_CARD_B.id),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeDayCardSelectionItems()
            .subscribe(items => result.push(items));

        observeDayCardByIdSubjectA.next(mockDayCardAChanged);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(firstResult);
        expect(result[1]).toEqual(secondResult);
    });

    it('should observe task calendar selection items', () => {
        const newState = cloneDeep(initialState);
        const expectedItems = [MOCK_TASK];
        const taskIdsArgumentByContentEqualityNotByReference = deepEqual([MOCK_TASK.id]);

        when(projectTaskQueriesMock.observeTasksById(taskIdsArgumentByContentEqualityNotByReference)).thenReturn(of([MOCK_TASK]));

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id),
            new ObjectIdentifierPair(ObjectTypeEnum.Milestone, 'foo'),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeTaskCalendarSelectionItems()
            .subscribe(items => expect(items).toEqual(expectedItems));
    });
    it('should observe task calendar selection items when tasks are the same as the previously selected', () => {
        const observeTasksByIdSubject = new BehaviorSubject<Task[]>([MOCK_TASK, MOCK_TASK_2]);
        const newState = cloneDeep(initialState);
        const expectedItems = [MOCK_TASK, MOCK_TASK_2];
        const result = [];

        when(projectTaskQueriesMock.observeTasksById(deepEqual([MOCK_TASK.id, MOCK_TASK_2.id]))).thenReturn(observeTasksByIdSubject);

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id),
            new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeTaskCalendarSelectionItems()
            .subscribe(items => result.push(items));

        observeTasksByIdSubject.next([MOCK_TASK, MOCK_TASK_2]);

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(expectedItems);
    });

    it('should observe task calendar selection items when task are different than the previously selected', () => {
        const observeTasksByIdSubject = new BehaviorSubject<Task[]>([MOCK_TASK, MOCK_TASK_2]);
        const mockTask2Changed: Task = {
            ...MOCK_TASK_2,
            version: MOCK_TASK_2.version + 1,
        };
        const newState = cloneDeep(initialState);
        const firstResult = [MOCK_TASK, MOCK_TASK_2];
        const secondResult = [MOCK_TASK, mockTask2Changed];
        const result = [];

        when(projectTaskQueriesMock.observeTasksById(deepEqual([MOCK_TASK.id, MOCK_TASK_2.id]))).thenReturn(observeTasksByIdSubject);

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [
            new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id),
            new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
        ];

        setStoreState(newState);

        calendarSelectionQueries.observeTaskCalendarSelectionItems()
            .subscribe(items => result.push(items));

        observeTasksByIdSubject.next([MOCK_TASK, mockTask2Changed]);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(firstResult);
        expect(result[1]).toEqual(secondResult);
    });

    it('should observe calendar selection items ids by type', () => {
        const newState = cloneDeep(initialState);
        const taskId = 'foo';
        const milestoneId = 'bar';
        const item1 = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const item2 = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);

        newState.projectModule.calendarModule.calendarSelectionSlice.items = [item1, item2];

        setStoreState(newState);

        calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task)
            .subscribe(ids => expect(ids).toEqual([taskId]));
    });

    it('should observe calendar selection is multiselecting', () => {
        calendarSelectionQueries
            .observeCalendarSelectionIsMultiSelecting()
            .subscribe(result => expect(result).toEqual(false));
    });

    it('should observe calendar selection action', () => {
        const expectedResult = calendarSelectionSlice.action;

        calendarSelectionQueries
            .observeCalendarSelectionAction()
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe calendar selection slice', () => {
        const expectedResult = calendarSelectionSlice;

        calendarSelectionQueries
            .observeCalendarSelectionSlice()
            .subscribe(result => expect(result).toEqual(expectedResult));
    });
});
