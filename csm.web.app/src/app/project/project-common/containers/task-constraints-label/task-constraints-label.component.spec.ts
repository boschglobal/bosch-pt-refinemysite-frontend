/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {
    instance,
    mock,
} from 'ts-mockito';

import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK_CONSTRAINTS_RESOURCE,
    MOCK_TASK_CONSTRAINTS_RESOURCE_NO_ITEMS,
    MOCK_TASK_CONSTRAINTS_RESOURCE_NO_UPDATE
} from '../../../../../test/mocks/task-constraints';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {Task} from '../../models/tasks/task';
import {ConstraintQueries} from '../../store/constraints/constraint.queries';
import {TaskConstraintsQueries} from '../../store/task-constraints/task-constraints.queries';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {TaskConstraintsLabelComponent} from './task-constraints-label.component';

describe('TaskConstraintsLabelComponent', () => {
    let comp: TaskConstraintsLabelComponent;
    let fixture: ComponentFixture<TaskConstraintsLabelComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<State>;
    let translateService: TranslateService;

    const taskConstraintsQueries: TaskConstraintsQueries = mock(TaskConstraintsQueries);
    const constraintsQueries: ConstraintQueries = mock(ConstraintQueries);

    const constraintsCreateOrUpdateButtonSelector = '[data-automation="task-constraints-label-create-or-update-button"]';
    const constraintsLabelSelector = '[data-automation="task-constraints-label"]';
    const hasConstraintsClass = 'ss-task-constraints-label--has-constraints';
    const addButtonMessage = 'Task_AddConstraint_Label';
    const updateButtonMessage = 'Generic_Update';

    const getElement = (selector: string) => el.querySelector((selector));
    const clickEvent: Event = new Event('click');

    const taskId: string = MOCK_TASK.id;

    const taskWithPermissionToUpdateConstraints =
        Object.assign(new Task(), MOCK_TASK,
            {constraints: Object.assign({}, MOCK_TASK.constraints, MOCK_TASK_CONSTRAINTS_RESOURCE)},
            {permissions: Object.assign({}, MOCK_TASK.permissions, {canUpdateConstraints: true})});
    const taskWithPermissionButNoConstraints =
        Object.assign(new Task(), MOCK_TASK,
            {constraints: Object.assign({}, MOCK_TASK_CONSTRAINTS_RESOURCE_NO_ITEMS)},
            {permissions: Object.assign({}, MOCK_TASK.permissions, {canUpdateConstraints: true})});
    const taskWithoutPermissionToCreateOrUpdateConstraints =
        Object.assign(new Task(), MOCK_TASK,
            {constraints: Object.assign({}, MOCK_TASK_CONSTRAINTS_RESOURCE_NO_UPDATE)},
            {permissions: Object.assign({}, MOCK_TASK.permissions, {canUpdateConstraints: false})});

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslateModule.forRoot()],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: ConstraintQueries,
                useFactory: () => instance(constraintsQueries),
            },
            {
                provide: TaskConstraintsQueries,
                useFactory: () => instance(taskConstraintsQueries),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            TaskConstraintsLabelComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskConstraintsLabelComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        store = TestBed.inject(Store);
        translateService = TestBed.inject(TranslateService);

        comp.task = taskWithoutPermissionToCreateOrUpdateConstraints;

        fixture.detectChanges();
    });

    it('should render add constraint button when no constraint exists and user has permission to create', () => {
        comp.task = taskWithPermissionButNoConstraints;
        fixture.detectChanges();

        expect(comp.canCreateOrUpdate).toBeTruthy();
        expect(comp.hasConstraints).toBeFalsy();
        expect(getElement(constraintsCreateOrUpdateButtonSelector)).not.toBeNull();
    });

    it('should render constraints label when task has constraints', () => {
        comp.task = taskWithPermissionToUpdateConstraints;
        fixture.detectChanges();

        expect(getElement(constraintsLabelSelector)).not.toBeNull();
    });

    it('should render constraints label when user has permission to create constraint', () => {
        comp.task = taskWithPermissionButNoConstraints;

        fixture.detectChanges();
        expect(getElement(constraintsLabelSelector)).not.toBeNull();
    });

    it('should render constraints label when user has permission to update constraint', () => {
        comp.task = taskWithPermissionToUpdateConstraints;

        fixture.detectChanges();
        expect(getElement(constraintsLabelSelector)).not.toBeNull();
    });

    it('should not render constraints label when user hasn\'t permission to create constraints and task has no constraints', () => {
        comp.task = taskWithoutPermissionToCreateOrUpdateConstraints;

        fixture.detectChanges();
        expect(getElement(constraintsLabelSelector)).toBeNull();
    });

    it('should trigger openModal on click update when constraints are visible', () => {
        spyOn(comp, 'openModal').and.callThrough();

        comp.task = taskWithPermissionToUpdateConstraints;

        fixture.detectChanges();
        de.query(By.css(constraintsCreateOrUpdateButtonSelector)).nativeElement.dispatchEvent(clickEvent);

        expect(comp.openModal).toHaveBeenCalled();
    });

    it('should render correct message for update button', () => {
        comp.task = taskWithPermissionToUpdateConstraints;

        fixture.detectChanges();

        expect(de.query(By.css(constraintsCreateOrUpdateButtonSelector)).nativeElement.textContent.trim()).toBe(updateButtonMessage);
    });

    it('should render correct message for create button', () => {
        comp.task = taskWithPermissionButNoConstraints;

        fixture.detectChanges();

        expect(de.query(By.css(constraintsCreateOrUpdateButtonSelector)).nativeElement.textContent.trim()).toBe(addButtonMessage);
    });

    it('should add CSS class when has constraints', () => {
        comp.task = taskWithPermissionToUpdateConstraints;

        fixture.detectChanges();

        expect(de.query(By.css(constraintsLabelSelector)).classes[hasConstraintsClass]).toBeTruthy();
    });

    it('should not add CSS class when there are no constraints', () => {
        comp.task = taskWithPermissionButNoConstraints;

        fixture.detectChanges();

        expect(de.query(By.css(constraintsLabelSelector)).classes[hasConstraintsClass]).toBeFalsy();
    });

    it('should dispatch ProjectTaskActions Request One after language changes', () => {
        spyOn(store, 'dispatch');
        translateService.onDefaultLangChange.next({
            lang: 'de',
            translations: '',
        });
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Request.One(taskId));
    });
});
