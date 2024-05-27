/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {flatten} from 'lodash';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_DAY_CARD_A,
    MOCK_DAY_CARD_B,
} from '../../../../../../test/mocks/day-cards';
import {
    MOCK_TASK_1,
    MOCK_TASK_2
} from '../../../../../../test/mocks/tasks';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {CalendarSelectionActionEnum} from '../../../../project-common/enums/calendar-selection-action.enum';
import {CalendarSelectionHelper} from '../../../../project-common/helpers/calendar-selection.helper';
import {
    DayCard,
    DayCardPermissions,
} from '../../../../project-common/models/day-cards/day-card';
import {
    Task,
    TaskPermissions
} from '../../../../project-common/models/tasks/task';
import {CalendarScopeQueries} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {DayCardActions} from '../../../../project-common/store/day-cards/day-card.actions';
import {DayCardQueries} from '../../../../project-common/store/day-cards/day-card.queries';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {
    MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID,
    MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID,
    MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID,
    MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID,
    MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID,
    MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID,
    MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID,
    MultiSelectCommandBarComponent,
} from './multi-select-command-bar.component';

describe('Multi Select Command Bar Component', () => {
    let comp: MultiSelectCommandBarComponent;
    let fixture: ComponentFixture<MultiSelectCommandBarComponent>;
    let de: DebugElement;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: jasmine.SpyObj<Store>;

    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const calendarSelectionHelperMock: CalendarSelectionHelper = mock(CalendarSelectionHelper);
    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const dayCardQueriesMock: DayCardQueries = mock(DayCardQueries);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);

    const dayCardObjectIdentifierPairs: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '1')];
    const dayCardsObjectIdentifierPairs: ObjectIdentifierPair[] = [
        new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '1'),
        new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '2'),
    ];
    const taskObjectIdentifierPairs: ObjectIdentifierPair[] = [new ObjectIdentifierPair(ObjectTypeEnum.Task, '1')];
    const tasksObjectIdentifierPairs: ObjectIdentifierPair[] = [
        new ObjectIdentifierPair(ObjectTypeEnum.Task, '1'),
        new ObjectIdentifierPair(ObjectTypeEnum.Task, '2'),
    ];

    const observeExpandedWeeksSubject = new BehaviorSubject<moment.Moment[]>(null);
    const calendarSelectionItemsSubject = new BehaviorSubject<ObjectIdentifierPair[]>([]);
    const calendarSelectionActionSubject = new BehaviorSubject<CalendarSelectionActionEnum>(null);
    const dayCardSelectionItemsSubject = new BehaviorSubject<DayCard[]>([]);
    const taskCalendarSelectionItemsSubject = new BehaviorSubject<Task[]>([]);
    const selectionItemsTypeSubject = new BehaviorSubject<ObjectTypeEnum>(null);
    const currentDayCardRequestStatusSubject = new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);

    const clickEvent: Event = new Event('click');
    const keyUpEvent: any = new Event('keyup');

    const dataAutomationCloseIconSelector = '[data-automation="ss-multi-select-command-bar-close"]';
    const labelSelector = '[data-automation="ss-multi-select-command-bar-label"]';
    const actionsSeparatorSelector = '[data-automation="ss-multi-select-command-bar-actions-separator"]';
    const dropdownSeparatorSelector = '[data-automation="ss-multi-select-command-bar-dropdown-separator"]';
    const dayCardCompleteAction = '[data-automation="ss-multi-select-command-bar-complete-action"]';
    const dayCardApproveAction = '[data-automation="ss-multi-select-command-bar-approve-action"]';
    const dayCardNotDoneAction = '[data-automation="ss-multi-select-command-bar-notdone-action"]';
    const tasksCopyAction = '[data-automation="ss-multi-select-command-bar-copy-tasks-action"]';
    const tasksMoveAction = '[data-automation="ss-multi-select-command-bar-move-tasks-action"]';

    const getDayCardWithPermissions = (dayCard: DayCard, permissions: Partial<DayCardPermissions>): DayCard =>
        Object.assign<DayCard, DayCard, Partial<DayCard>>(new DayCard(), dayCard, {
            permissions: {
                canUpdate: false,
                canDelete: false,
                canCancel: false,
                canComplete: false,
                canApprove: false,
                canReset: false,
                ...permissions,
            },
        });

    const getTaskWithPermissions = (task: Task, permissions: Partial<TaskPermissions>): Task =>
        Object.assign<Task, Task, Partial<Task>>(new Task(), task, {
            permissions: {
                canUpdate: false,
                canAssign: false,
                canUnassign: false,
                canSend: false,
                canDelete: false,
                canReset: false,
                canStart: false,
                canClose: false,
                canAccept: false,
                canUpdateConstraints: false,
                ...permissions,
            },
        });

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const getElement = <T extends HTMLElement>(selector: string): T => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [MultiSelectCommandBarComponent],
        providers: [
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: CalendarSelectionHelper,
                useValue: instance(calendarSelectionHelperMock),
            },
            {
                provide: CalendarSelectionQueries,
                useValue: instance(calendarSelectionQueriesMock),
            },
            {
                provide: DayCardQueries,
                useValue: instance(dayCardQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    when(calendarScopeQueriesMock.observeExpandedWeeks()).thenReturn(observeExpandedWeeksSubject);
    when(calendarSelectionQueriesMock.observeCalendarSelectionAction()).thenReturn(calendarSelectionActionSubject);
    when(calendarSelectionQueriesMock.observeCalendarSelectionItems()).thenReturn(calendarSelectionItemsSubject);
    when(calendarSelectionQueriesMock.observeDayCardSelectionItems()).thenReturn(dayCardSelectionItemsSubject);
    when(calendarSelectionQueriesMock.observeTaskCalendarSelectionItems()).thenReturn(taskCalendarSelectionItemsSubject);
    when(calendarSelectionHelperMock.observeSelectionItemsType()).thenReturn(selectionItemsTypeSubject);
    when(dayCardQueriesMock.observeCurrentDayCardRequestStatus()).thenReturn(currentDayCardRequestStatusSubject);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiSelectCommandBarComponent);
        comp = fixture.componentInstance;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        de = fixture.debugElement;

        observeExpandedWeeksSubject.next([]);
        calendarSelectionItemsSubject.next([]);
        calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
        dayCardSelectionItemsSubject.next([]);
        taskCalendarSelectionItemsSubject.next([]);
        selectionItemsTypeSubject.next(null);
        currentDayCardRequestStatusSubject.next(RequestStatusEnum.empty);

        store.dispatch.calls.reset();
        modalService.open.calls.reset();

        fixture.detectChanges();
    });

    it('should emit closeToolbar event when close button is clicked', () => {
        spyOn(comp.closeToolbar, 'emit');

        getElement(dataAutomationCloseIconSelector).dispatchEvent(clickEvent);

        expect(comp.closeToolbar.emit).toHaveBeenCalled();
    });

    it('should emit closeToolbar event when Escape key is pressed', () => {
        spyOn(comp.closeToolbar, 'emit');

        keyUpEvent.key = KeyEnum.Escape;
        window.dispatchEvent(keyUpEvent);

        expect(comp.closeToolbar.emit).toHaveBeenCalled();
    });

    it('should set selectionItemsType when observeSelectionItemsType emits', () => {
        const results: ObjectTypeEnum[] = [];
        const expectedResults: ObjectTypeEnum[] = [
            ObjectTypeEnum.DayCard,
            ObjectTypeEnum.Task,
            null,
        ];

        selectionItemsTypeSubject.next(ObjectTypeEnum.DayCard);
        results.push(comp.selectionItemsType);

        selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
        results.push(comp.selectionItemsType);

        selectionItemsTypeSubject.next(null);
        results.push(comp.selectionItemsType);

        expect(results).toEqual(expectedResults);
    });

    it('should show Generic_StartSelecting as label when selectionItemsType is not defined', () => {
        const expectedResult = 'Generic_StartSelecting';

        expect(getElement(labelSelector).textContent.trim()).toBe(expectedResult);
    });

    it('should show "1 task" as label when selectionItemsType is Task and there are only one task selected', () => {
        const expectedResult = '1 MultiSelectCommandBar_Task_Label';

        selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
        calendarSelectionItemsSubject.next(taskObjectIdentifierPairs);

        expect(getElement(labelSelector).textContent.trim()).toBe(expectedResult);
    });

    it(`should show "${tasksObjectIdentifierPairs.length} tasks" as label when selectionItemsType` +
        ` is Task and there are ${tasksObjectIdentifierPairs.length} tasks selected`, () => {
        const expectedResult = '2 MultiSelectCommandBar_Tasks_Label';

        selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
        calendarSelectionItemsSubject.next(tasksObjectIdentifierPairs);

        expect(getElement(labelSelector).textContent.trim()).toBe(expectedResult);
    });

    it('should show "1 day card" as label when selectionItemsType is Daycard and there are only one daycard selected', () => {
        const expectedResult = '1 MultiSelectCommandBar_DayCard_Label';

        selectionItemsTypeSubject.next(ObjectTypeEnum.DayCard);
        calendarSelectionItemsSubject.next(dayCardObjectIdentifierPairs);

        expect(getElement(labelSelector).textContent.trim()).toBe(expectedResult);
    });

    it(`should show "${dayCardsObjectIdentifierPairs.length} day cards" as label when selectionItemsType` +
        ` is Daycard and there are ${dayCardsObjectIdentifierPairs.length} daycards selected`, () => {
        const expectedResult = '2 MultiSelectCommandBar_DayCards_Label';

        selectionItemsTypeSubject.next(ObjectTypeEnum.DayCard);
        calendarSelectionItemsSubject.next(dayCardsObjectIdentifierPairs);

        expect(getElement(labelSelector).textContent.trim()).toBe(expectedResult);
    });

    it('should show the separator between the label and the actions when there are actions to show', () => {
        const dayCardsWithApprovePermissions = [
            getDayCardWithPermissions(MOCK_DAY_CARD_A, {canApprove: true}),
        ];

        dayCardSelectionItemsSubject.next(dayCardsWithApprovePermissions);

        expect(getElement(actionsSeparatorSelector)).toBeTruthy();
    });

    it('should not show the separator between the label and the actions when there no are actions to show', () => {
        dayCardSelectionItemsSubject.next([]);

        expect(getElement(actionsSeparatorSelector)).toBeFalsy();
    });

    it('should show the separator between the actions and the dropdown when there are dropdown items to show', () => {
        const dayCardsWithApprovePermissions = [
            getDayCardWithPermissions(MOCK_DAY_CARD_A, {canDelete: true}),
        ];

        dayCardSelectionItemsSubject.next(dayCardsWithApprovePermissions);

        expect(getElement(dropdownSeparatorSelector)).toBeTruthy();
    });

    it('should not show the separator between the actions and the dropdown when there no are dropdown items to show', () => {
        dayCardSelectionItemsSubject.next([]);

        expect(getElement(dropdownSeparatorSelector)).toBeFalsy();
    });

    describe('Multi Select Command Bar Component - Daycard selection', () => {

        it('should not show any daycard action when there are not daycard selected', () => {
            dayCardSelectionItemsSubject.next([]);

            expect(getElement(dayCardCompleteAction)).toBeFalsy();
            expect(getElement(dayCardApproveAction)).toBeFalsy();
            expect(getElement(dayCardNotDoneAction)).toBeFalsy();
        });

        it('should show daycard approve action and hide complete action when all daycards can be approved', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canApprove: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canApprove: true}),
            ]);

            expect(getElement(dayCardApproveAction)).toBeTruthy();
            expect(getElement(dayCardCompleteAction)).toBeFalsy();
        });

        it('should show daycard approve action and hide complete daycard when at least one daycard can be approved, ' +
            'and all daycards can be completed', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canComplete: true, canApprove: true}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardApproveAction)).toBeTruthy();
            expect(getElement(dayCardCompleteAction)).toBeFalsy();
        });

        it('should show daycard approve action and hide complete action when at least one daycard cannot be approved and completed', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canApprove: true}),
            ]);

            expect(getElement(dayCardApproveAction)).toBeTruthy();
            expect(getElement(dayCardCompleteAction)).toBeFalsy();
        });

        it('should not disable daycard approve action when all daycards can be approved', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canApprove: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canApprove: true}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardApproveAction).disabled).toBeFalsy();
        });

        it('should disable daycard approve action when at least one daycard cannot be approved and completed', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canApprove: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canApprove: false}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardApproveAction).disabled).toBeTruthy();
        });

        it('should disable daycard approve action when at least one daycard can be approved,' +
            ' and all daycards can only be completed', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true, canApprove: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canComplete: true}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardApproveAction).disabled).toBeTruthy();
        });

        it('should not disable daycard not done action when all daycards can be cancel', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canCancel: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canCancel: true}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardNotDoneAction).disabled).toBeFalsy();
        });

        it('should disable daycard not done action when at least one daycard cannot be canceled', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canCancel: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canCancel: false}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardNotDoneAction).disabled).toBeTruthy();
        });

        it('should not disable daycard delete dropdown item when all daycards can be deleted', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canDelete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canDelete: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID).disabled).toBeFalsy();
        });

        it('should disable daycard delete dropdown item when at least one daycard cannot be deleted', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canDelete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canDelete: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID).disabled).toBeTruthy();
        });

        it('should disable daycard approve action when at least one daycard can be approved, ' +
            'and all daycards can be completed', () => {
            dayCardSelectionItemsSubject.next([
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canComplete: true, canApprove: true}),
            ]);

            expect(getElement<HTMLButtonElement>(dayCardApproveAction).disabled).toBeTruthy();
        });

        it('should dispatch DayCardActions.Approve.All action when daycard approve action is clicked', () => {
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canApprove: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canApprove: true}),
            ];
            const dayCardIds = dayCards.map(({id}) => id);
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));
            const expectedAction = new DayCardActions.Approve.All(dayCardIds);

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            getElement(dayCardApproveAction).dispatchEvent(clickEvent);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should open the confirmation modal when daycard complete action is clicked', () => {
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canComplete: true}),
            ];
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            getElement(dayCardCompleteAction).dispatchEvent(clickEvent);

            expect(modalService.open).toHaveBeenCalled();
        });

        it('should dispatch DayCardActions.Complete.All action when daycard complete action is confirmed', () => {
            let modalParams: ModalInterface;
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canComplete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canComplete: true}),
            ];
            const dayCardIds = dayCards.map(({id}) => id);
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));
            const expectedAction = new DayCardActions.Complete.All(dayCardIds);

            modalService.open.and.callFake(params => modalParams = params);

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            getElement(dayCardCompleteAction).dispatchEvent(clickEvent);
            modalParams.data.confirmCallback();

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should open the reasons modal when daycard not done action is clicked', () => {
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canCancel: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canCancel: true}),
            ];
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            getElement(dayCardNotDoneAction).dispatchEvent(clickEvent);

            expect(modalService.open).toHaveBeenCalled();
        });

        it('should open the confirmation modal when daycard delete action is clicked', () => {
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canDelete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canDelete: true}),
            ];
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID));

            expect(modalService.open).toHaveBeenCalled();
        });

        it('should dispatch DayCardActions.Delete.All action when daycard delete action is confirmed', () => {
            let modalParams: ModalInterface;
            const dayCards: DayCard[] = [
                getDayCardWithPermissions(MOCK_DAY_CARD_A, {canDelete: true}),
                getDayCardWithPermissions(MOCK_DAY_CARD_B, {canDelete: true}),
            ];
            const dayCardIds = dayCards.map(({id}) => id);
            const dayCardSelectionItems = dayCards.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id));
            const expectedAction = new DayCardActions.Delete.All({dayCardIds});

            modalService.open.and.callFake(params => modalParams = params);

            calendarSelectionItemsSubject.next(dayCardSelectionItems);
            dayCardSelectionItemsSubject.next(dayCards);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID));
            modalParams.data.confirmCallback();

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    });

    describe('Multi Select Command Bar Component - Task selection', () => {

        it('should not disable task delete dropdown item when all tasks can be deleted', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canDelete: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canDelete: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID).disabled).toBeFalsy();
        });

        it('should disable task delete dropdown item when at least one task cannot be deleted', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canDelete: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canDelete: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID).disabled).toBeTruthy();
        });

        it('should open the confirmation modal when task delete action is clicked', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canDelete: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canDelete: true}),
            ];
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID));

            expect(modalService.open).toHaveBeenCalled();
        });

        it('should dispatch ProjectTaskActions.Delete.All action when task delete action is confirmed', () => {
            let modalParams: ModalInterface;
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canDelete: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canDelete: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Delete.All(taskIds);

            modalService.open.and.callFake(params => modalParams = params);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID));
            modalParams.data.confirmCallback();

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should display option open task status dropdown item when all tasks can be sent', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canSend: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canSend: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID)).toBeDefined();
        });

        it('should not display option open task status dropdown item when one of the tasks can not be sent', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canSend: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canSend: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID)).not.toBeDefined();
        });

        it('should display option start task status dropdown item when all tasks can be started', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canStart: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canStart: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID)).toBeDefined();
        });

        it('should not display option start task status dropdown item when one of the tasks can not be started', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canStart: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canStart: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID)).not.toBeDefined();
        });

        it('should display option close task status dropdown item when all tasks can be closed', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canClose: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canClose: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID)).toBeDefined();
        });

        it('should not display option close task status dropdown item when one of the tasks can not be closed', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canClose: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canClose: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID)).not.toBeDefined();
        });

        it('should display option reset task status dropdown item when all tasks can be reset', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canReset: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canReset: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID)).toBeDefined();
        });

        it('should not display option reset task status dropdown item when one of the tasks can not be reset', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canReset: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canReset: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID)).not.toBeDefined();
        });

        it('should display option accept task status dropdown item when all tasks can be accepted', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canAccept: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canAccept: true}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID)).toBeDefined();
        });

        it('should not display option accept task status dropdown item when one of the tasks can not be accepted', () => {
            taskCalendarSelectionItemsSubject.next([
                getTaskWithPermissions(MOCK_TASK_1, {canAccept: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canAccept: false}),
            ]);

            expect(getDropdownItem(MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID)).not.toBeDefined();
        });

        it('should dispatch ProjectTaskActions.Send.All action when send all tasks action is confirmed', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canSend: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canSend: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Send.All(taskIds);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID));

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch ProjectTaskActions.Start.All action when start all tasks action is confirmed', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canStart: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canStart: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Start.All(taskIds);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID));

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch ProjectTaskActions.Close.All action when close all tasks action is confirmed', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canClose: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canClose: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Close.All(taskIds);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID));

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch ProjectTaskActions.Accept.All action when accept all tasks action is confirmed', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canAccept: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canAccept: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Accept.All(taskIds);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID));

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch ProjectTaskActions.Reset.All action when reset all tasks action is confirmed', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canReset: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canReset: true}),
            ];
            const taskIds = tasks.map(({id}) => id);
            const taskSelectionItems = tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
            const expectedAction = new ProjectTaskActions.Reset.All(taskIds);

            calendarSelectionItemsSubject.next(taskSelectionItems);
            taskCalendarSelectionItemsSubject.next(tasks);

            comp.handleDropdownItemClicked(getDropdownItem(MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID));

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch CalendarSelectionActions.Set.SelectionAction store action with Move selectionAction when move' +
            ' button is clicked', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];
            const expectedAction = new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Move);

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(null);
            observeExpandedWeeksSubject.next([]);

            getElement(tasksMoveAction).dispatchEvent(clickEvent);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch CalendarSelectionActions.Set.SelectionAction store action with Copy selectionAction when copy' +
            ' button is clicked', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];
            const expectedAction = new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Copy);

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(null);
            observeExpandedWeeksSubject.next([]);

            getElement(tasksCopyAction).dispatchEvent(clickEvent);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch CalendarSelectionActions.Set.SelectionAction store action with null selectionAction when move' +
            ' button is clicked and it was previously active', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];
            const expectedAction = new CalendarSelectionActions.Set.SelectionAction(null);

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([]);

            getElement(tasksMoveAction).dispatchEvent(clickEvent);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should dispatch CalendarSelectionActions.Set.SelectionAction store action with null selectionAction when copy' +
            ' button is clicked and it was previously active', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];
            const expectedAction = new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Copy);

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(null);
            observeExpandedWeeksSubject.next([]);

            getElement(tasksCopyAction).dispatchEvent(clickEvent);

            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });

        it('should set move button as active when observed calendar selectionAction is Move and the user can move ' +
            'tasks', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[0].active).toBeTruthy();
        });

        it('should set copy button as active when observed calendar selectionAction is Move and the user can copy ' +
            'tasks', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Copy);
            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[1].active).toBeTruthy();

        });

        it('should set move button as disabled when calendar has expanded weeks', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([moment()]);

            expect(comp.actions[0].disabled).toBeTruthy();
        });

        it('should set move button as disabled when task has not canUpdate permissions', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: false}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: false}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[0].disabled).toBeTruthy();
        });

        it('should set move button as disabled when canDragTask is set to false', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            comp.canDragTask = () => false;
            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([]);

            fixture.detectChanges();

            expect(comp.actions[0].disabled).toBeTruthy();
        });

        it('should set copy button as disabled when calendar has expanded weeks', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Copy);
            observeExpandedWeeksSubject.next([moment()]);

            expect(comp.actions[1].disabled).toBeTruthy();
        });

        it('should set copy button as disabled when canDragTask is set to false', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            comp.canDragTask = () => false;
            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Copy);
            observeExpandedWeeksSubject.next([]);

            fixture.detectChanges();

            expect(comp.actions[0].disabled).toBeTruthy();
        });

        it('should set move button as active when collapsing expanded weeks and it was previously active before ' +
            'expanding them', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Move);
            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[0].active).toBeTruthy();

            observeExpandedWeeksSubject.next([moment()]);

            expect(comp.actions[0].active).toBeFalsy();

            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[0].active).toBeTruthy();
        });

        it('should set copy button as active when collapsing expanded weeks and it was previously active before ' +
            'expanding them', () => {
            const tasks: Task[] = [
                getTaskWithPermissions(MOCK_TASK_1, {canUpdate: true}),
                getTaskWithPermissions(MOCK_TASK_2, {canUpdate: true}),
            ];

            selectionItemsTypeSubject.next(ObjectTypeEnum.Task);
            taskCalendarSelectionItemsSubject.next(tasks);
            calendarSelectionActionSubject.next(CalendarSelectionActionEnum.Copy);
            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[1].active).toBeTruthy();

            observeExpandedWeeksSubject.next([moment()]);

            expect(comp.actions[1].active).toBeFalsy();

            observeExpandedWeeksSubject.next([]);

            expect(comp.actions[1].active).toBeTruthy();
        });
    });
});
