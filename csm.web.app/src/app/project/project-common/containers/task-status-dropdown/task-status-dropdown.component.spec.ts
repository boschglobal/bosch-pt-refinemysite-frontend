/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_TASK_2} from '../../../../../test/mocks/tasks';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper,
} from '../../enums/task-status.enum';
import {
    Task,
    TaskPermissions,
} from '../../models/tasks/task';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {
    ACCEPT_TASK_ITEM_ID,
    CLOSE_TASK_ITEM_ID,
    OPEN_TASK_ITEM_ID,
    RESET_TASK_ITEM_ID,
    START_TASK_ITEM_ID,
    TaskStatusDropdownComponent,
    TaskStatusItemId,
    TaskStatusMenuItem,
} from './task-status-dropdown.component';
import {TaskStatusDropdownTestComponent} from './task-status-dropdown.test.component';
import SpyObj = jasmine.SpyObj;

describe('Task Status Dropdown Component', () => {
    let comp: TaskStatusDropdownComponent;
    let testHostComp: TaskStatusDropdownTestComponent;
    let fixture: ComponentFixture<TaskStatusDropdownTestComponent>;
    let de: DebugElement;
    let store: SpyObj<Store<State>>;

    const projectTaskQueries: ProjectTaskQueries = mock(ProjectTaskQueries);
    const observeCurrentTaskRequestStatusSubject = new Subject<RequestStatusEnum>();
    const disabledCssClass = 'ss-task-status-dropdown--disabled';
    const dropdownWrapperSelector = '[data-automation="ss-task-status-dropdown"]';
    const dropdownSelector = '[data-automation="ss-task-status-dropdown-dropdown"]';
    const labelSelector = '[data-automation="ss-task-status-dropdown-label"]';
    const taskStatusDropdownComponentSelector = 'ss-task-status-dropdown';
    const task = MOCK_TASK_2;

    const getDropdownItem = (itemId: TaskStatusItemId): TaskStatusMenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;

    const getTaskWithPermissions = (permissions: Partial<TaskPermissions>): Task => {
        const defaultPermissions: TaskPermissions = Object.keys(task.permissions)
            .reduce((obj, permission) => ({...obj, [permission]: false}), {} as TaskPermissions);

        return {
            ...task,
            permissions: {
                ...defaultPermissions,
                ...permissions,
            },
        };
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [
            TaskStatusDropdownComponent,
            TaskStatusDropdownTestComponent,
        ],
        providers: [
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueries),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskStatusDropdownTestComponent);
        testHostComp = fixture.componentInstance;
        testHostComp.task = getTaskWithPermissions({canSend: true, canStart: true, canClose: true, canReset: true, canAccept: true});

        de = fixture.debugElement.query(By.css(taskStatusDropdownComponentSelector));
        comp = de.componentInstance;

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        when(projectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(observeCurrentTaskRequestStatusSubject);

        fixture.detectChanges();
    });

    it('should set the label with the current task status when a task is received', () => {
        testHostComp.task = task;
        fixture.detectChanges();

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(task.status));
    });

    it('should set the "Open" dropdown option when the task only has permission to be sent', () => {
        testHostComp.task = getTaskWithPermissions({canSend: true});
        fixture.detectChanges();

        expect(getDropdownItem(OPEN_TASK_ITEM_ID)).toBeTruthy();
        expect(getDropdownItem(START_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(CLOSE_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(ACCEPT_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(RESET_TASK_ITEM_ID)).toBeFalsy();
    });

    it('should set the "In Progress" dropdown option when the task only has permission to be started', () => {
        testHostComp.task = getTaskWithPermissions({canStart: true});
        fixture.detectChanges();

        expect(getDropdownItem(OPEN_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(START_TASK_ITEM_ID)).toBeTruthy();
        expect(getDropdownItem(CLOSE_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(ACCEPT_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(RESET_TASK_ITEM_ID)).toBeFalsy();
    });

    it('should set the "Done" dropdown option when the task has only permission to be closed', () => {
        testHostComp.task = getTaskWithPermissions({canClose: true});
        fixture.detectChanges();

        expect(getDropdownItem(OPEN_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(START_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(CLOSE_TASK_ITEM_ID)).toBeTruthy();
        expect(getDropdownItem(RESET_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(ACCEPT_TASK_ITEM_ID)).toBeFalsy();
    });

    it('should set the "Reset" dropdown option when the task has only permission to be reset', () => {
        testHostComp.task = getTaskWithPermissions({canReset: true});
        fixture.detectChanges();

        expect(getDropdownItem(OPEN_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(START_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(CLOSE_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(ACCEPT_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(RESET_TASK_ITEM_ID)).toBeTruthy();
    });

    it('should set the "Accept" dropdown option when the task has only permission to be accepted', () => {
        testHostComp.task = getTaskWithPermissions({canAccept: true});
        fixture.detectChanges();

        expect(getDropdownItem(OPEN_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(START_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(CLOSE_TASK_ITEM_ID)).toBeFalsy();
        expect(getDropdownItem(ACCEPT_TASK_ITEM_ID)).toBeTruthy();
        expect(getDropdownItem(RESET_TASK_ITEM_ID)).toBeFalsy();
    });

    it('should render the dropdown when there are options to show', () => {
        testHostComp.task = getTaskWithPermissions({canReset: true});
        fixture.detectChanges();

        expect(getElement(dropdownSelector)).toBeTruthy();
        expect(getElement(labelSelector)).toBeFalsy();
    });

    it('should render the label with the status of the task when there are no options to show', () => {
        testHostComp.task = getTaskWithPermissions({});
        fixture.detectChanges();

        expect(getElement(labelSelector)).toBeTruthy();
        expect(getElement(dropdownSelector)).toBeFalsy();
    });

    it('should change the label to "Open" and dispatch SendOne action when "Open" option is clicked', () => {
        const expectedAction = new ProjectTaskActions.Send.One(task.id);

        comp.handleDropdownItemClicked(getDropdownItem(OPEN_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN));
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should change the label to "In Progress" and dispatch StartOne action when "In Progress" option is clicked', () => {
        const expectedAction = new ProjectTaskActions.Start.One(task.id);

        comp.handleDropdownItemClicked(getDropdownItem(START_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED));
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should change the label to "Done" and dispatch CloseOne action when "Done" option is clicked', () => {
        const expectedAction = new ProjectTaskActions.Close.One(task.id);

        comp.handleDropdownItemClicked(getDropdownItem(CLOSE_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.CLOSED));
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should change the label to "Accepted" and dispatch AcceptOne action when "Accept" option is clicked', () => {
        const expectedAction = new ProjectTaskActions.Accept.One(task.id);

        comp.handleDropdownItemClicked(getDropdownItem(ACCEPT_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.ACCEPTED));
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should change the label to "Open" and dispatch ResetOne action when "Reset" option is clicked', () => {
        const expectedAction = new ProjectTaskActions.Reset.One(task.id);

        comp.handleDropdownItemClicked(getDropdownItem(RESET_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN));
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should change the label to the current task status when the request to change the status fails', () => {
        comp.handleDropdownItemClicked(getDropdownItem(START_TASK_ITEM_ID));

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED));

        observeCurrentTaskRequestStatusSubject.next(RequestStatusEnum.error);

        expect(comp.label).toBe(TaskStatusEnumHelper.getLabelByValue(task.status));
    });

    it('should add disabled css class while the request to change the status is in progress', () => {
        comp.handleDropdownItemClicked(getDropdownItem(START_TASK_ITEM_ID));

        observeCurrentTaskRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getElement(dropdownWrapperSelector).classList.contains(disabledCssClass)).toBeTruthy();
    });

    it('should not add disabled css class when a request related with the current task is in progress' +
        'but was not triggered by this component', () => {
        observeCurrentTaskRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getElement(dropdownWrapperSelector).classList.contains(disabledCssClass)).toBeFalsy();
    });

    it('should remove the disabled css class after a request to change the status succeed', () => {
        comp.handleDropdownItemClicked(getDropdownItem(START_TASK_ITEM_ID));

        observeCurrentTaskRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getElement(dropdownWrapperSelector).classList.contains(disabledCssClass)).toBeTruthy();

        observeCurrentTaskRequestStatusSubject.next(RequestStatusEnum.success);

        expect(getElement(dropdownWrapperSelector).classList.contains(disabledCssClass)).toBeFalsy();
    });

    it('should rotate the arrow icon up when the dropdown flyout opens', () => {
        comp.handleFlyoutStateChange(true);

        expect(comp.iconRotation).toBe(90);
    });

    it('should rotate the arrow icon down when the dropdown flyout closes', () => {
        comp.handleFlyoutStateChange(false);

        expect(comp.iconRotation).toBe(-90);
    });
});
