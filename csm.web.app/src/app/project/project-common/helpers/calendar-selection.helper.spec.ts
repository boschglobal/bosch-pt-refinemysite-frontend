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
import {Store} from '@ngrx/store';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../test/mocks/store';
import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {
    KeyboardHelper,
    KeyboardShortcutEnum,
} from '../../../shared/misc/helpers/keyboard.helper';
import {CalendarSelectionContextEnum} from '../enums/calendar-selection-context.enum';
import {CalendarSelectionActions} from '../store/calendar/calendar-selection/calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from '../store/calendar/calendar-selection/calendar-selection.initial-state';
import {CalendarSelectionQueries} from '../store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarSelectionSlice} from '../store/calendar/calendar-selection/calendar-selection.slice';
import {CalendarSelectionHelper} from './calendar-selection.helper';

describe('Calendar Selection Helper', () => {
    let store: Store;
    let calendarSelectionHelperMock: CalendarSelectionHelper;

    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const keyboardHelperMock = mock(KeyboardHelper);

    const calendarSelectionItemsTasksMock: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Task, '1')];
    const calendarSelectionItemsDaycardsMock: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '1')];
    const calendarSelectionItemsEmpty: ObjectIdentifierPair[] = [];

    const objectIdentifierPairId = '2';
    const defaultCalendarSelectionSlice: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;

    const calendarSelectionItemsSubject = new BehaviorSubject<ObjectIdentifierPair[]>(calendarSelectionItemsEmpty);
    const calendarSelectionSliceSubject = new BehaviorSubject<CalendarSelectionSlice>(defaultCalendarSelectionSlice);
    const keyboardHelperSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    const moduleDef: TestModuleMetadata = {
        providers: [
            CalendarSelectionHelper,
            {
                provide: CalendarSelectionQueries,
                useValue: instance(calendarSelectionQueriesMock),
            },
            {
                provide: KeyboardHelper,
                useValue: instance(keyboardHelperMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(calendarSelectionQueriesMock.observeCalendarSelectionSlice()).thenReturn(calendarSelectionSliceSubject);
        when(calendarSelectionQueriesMock.observeCalendarSelectionItems()).thenReturn(calendarSelectionItemsSubject);
        when(keyboardHelperMock.getShortcutPressedState(KeyboardShortcutEnum.CherryPick)).thenReturn(keyboardHelperSubject);

        store = TestBed.inject(Store);
        calendarSelectionHelperMock = TestBed.inject(CalendarSelectionHelper);

        calendarSelectionItemsSubject.next(calendarSelectionItemsEmpty);
    });

    it('should return true when calling canSelectItemType with a task type when selected items are of ' +
        'task type', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsTasksMock);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.Task)).toBeTruthy();
    });

    it('should return true when calling canSelectItemType with a DayCard type when selected items are of ' +
        'DayCard type', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.DayCard)).toBeTruthy();
    });

    it('should return true when calling canSelectItemType with a Task type when selected items array is ' +
        'empty', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsEmpty);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.Task)).toBeTruthy();
    });

    it('should return true when calling canSelectItemType with a DayCard type when selected items array is ' +
        'empty', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsEmpty);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.DayCard)).toBeTruthy();
    });

    it('should return false when calling canSelectItemType with a Task type when selected items are ' +
        'of DayCard type', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.Task)).toBeFalsy();
    });

    it('should return false when calling canSelectItemType with a DayCard type when selected items are ' +
        'of Task type', () => {
        calendarSelectionItemsSubject.next(calendarSelectionItemsTasksMock);

        expect(calendarSelectionHelperMock.canSelectItemType(ObjectTypeEnum.DayCard)).toBeFalsy();
    });

    it('should observe can select item type when selected items change', () => {
        const results = [];

        calendarSelectionHelperMock.observeCanSelectItemType(ObjectTypeEnum.Task)
            .subscribe(canSelectItemType => results.push(canSelectItemType));

        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);
        calendarSelectionItemsSubject.next(calendarSelectionItemsTasksMock);

        expect(results.length).toBe(3);
        expect(results[0]).toBe(true);
        expect(results[1]).toBe(false);
        expect(results[2]).toBe(true);
    });

    it('should observe selection items type when selected items change', () => {
        const results = [];

        calendarSelectionHelperMock.observeSelectionItemsType()
            .subscribe(selectionItemType => results.push(selectionItemType));

        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);
        calendarSelectionItemsSubject.next(calendarSelectionItemsTasksMock);

        expect(results.length).toBe(3);
        expect(results[0]).toBeNull();
        expect(results[1]).toBe(ObjectTypeEnum.DayCard);
        expect(results[2]).toBe(ObjectTypeEnum.Task);
    });

    it('should dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a Task when' +
        ' selected items are of Task type', () => {
        const objectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, objectIdentifierPairId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(objectIdentifierPair);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.Task);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a Task when' +
        ' selected items array is empty', () => {
        const objectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, objectIdentifierPairId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(objectIdentifierPair);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionItemsSubject.next(calendarSelectionItemsEmpty);
        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.Task);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a DayCard' +
        ' when selected items are of DayCard type', () => {
        const objectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, objectIdentifierPairId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(objectIdentifierPair);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);
        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.DayCard);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a DayCard' +
        ' when selected items array is empty', () => {
        const objectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.DayCard, objectIdentifierPairId);
        const action = new CalendarSelectionActions.Toggle.SelectionItem(objectIdentifierPair);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionItemsSubject.next(calendarSelectionItemsEmpty);
        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.DayCard);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should not dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a ' +
        'Task when selected items are of DayCard type', () => {
        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionItemsSubject.next(calendarSelectionItemsDaycardsMock);
        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.Task);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch CalendarSelectionActions.Toggle.SelectionItem when calling toggleSelectionItem with a' +
        ' DayCard when selected items are of Task type', () => {
        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionItemsSubject.next(calendarSelectionItemsTasksMock);
        calendarSelectionHelperMock.toggleSelectionItem(objectIdentifierPairId, ObjectTypeEnum.DayCard);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch CalendarSelectionActions.Set.Selection action when calendar selection context is not null' +
        ' and shortcut pressed state for cherry pick is true', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            context: CalendarSelectionContextEnum.TasksOfMilestones,
            isMultiSelecting: true,
        };

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        keyboardHelperSubject.next(true);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should trigger CalendarSelectionActions.Set.Selection action with isMultiSelecting as true when calendar selection context' +
        ' is null and the shortcut pressed state for cherry pick is true', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
        };
        const expectedAction = new CalendarSelectionActions.Set.Selection(true, null);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        keyboardHelperSubject.next(true);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should trigger CalendarSelectionActions.Set.Selection action with isMultiSelecting as false when calendar selection context' +
        ' is null and the shortcut pressed state for cherry pick is false', () => {
        const calendarSelectionSliceNextState: CalendarSelectionSlice = defaultCalendarSelectionSlice;
        const expectedAction = new CalendarSelectionActions.Set.Selection(false, null);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSelectionSliceSubject.next(calendarSelectionSliceNextState);
        keyboardHelperSubject.next(false);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
