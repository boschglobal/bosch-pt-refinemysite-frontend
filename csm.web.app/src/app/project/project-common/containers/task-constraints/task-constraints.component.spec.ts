/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../test/mocks/constraints';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_TASK_CONSTRAINTS_RESOURCE} from '../../../../../test/mocks/task-constraints';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {State} from '../../../../app.reducers';
import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ConstraintKey} from '../../api/constraints/resources/constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintActions} from '../../store/constraints/constraint.actions';
import {ConstraintQueries} from '../../store/constraints/constraint.queries';
import {TaskConstraintsActions} from '../../store/task-constraints/task-constraints.actions';
import {TaskConstraintsQueries} from '../../store/task-constraints/task-constraints.queries';
import {TaskConstraintsComponent} from './task-constraints.component';

describe('Task Constraints Component', () => {
    let comp: TaskConstraintsComponent;
    let fixture: ComponentFixture<TaskConstraintsComponent>;
    let modalService: ModalService;
    let store: Store<State>;

    const mockConstraintQueries = mock(ConstraintQueries);
    const mockTaskConstraintQueries = mock(TaskConstraintsQueries);

    const taskId: string = MOCK_TASK.id;
    const constraints: ConstraintKey[] = [
        'EQUIPMENT',
        'INFORMATION',
        'RESOURCES',
    ];
    const constraintList: ConstraintEntity[] = [
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    ];

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslateModule.forRoot(),
            ReactiveFormsModule,
            FormsModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            TaskConstraintsComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: ConstraintQueries,
                useValue: instance(mockConstraintQueries),
            },
            {
                provide: TaskConstraintsQueries,
                useValue: instance(mockTaskConstraintQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskConstraintsComponent);
        comp = fixture.componentInstance;
        store = TestBed.inject(Store);
        modalService = TestBed.inject(ModalService);

        when(mockConstraintQueries.observeActiveConstraintList()).thenReturn(of(constraintList));
        when(mockTaskConstraintQueries.observeTaskConstraintsByTaskId(taskId)).thenReturn(of(MOCK_TASK_CONSTRAINTS_RESOURCE.items));
        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.empty));
        when(mockConstraintQueries.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.empty));

        spyOnProperty(modalService, 'currentModalData').and.returnValue({task: MOCK_TASK});

        fixture.detectChanges();
        comp.ngOnInit();
    });

    afterEach(() => {
        comp.ngOnDestroy();
    });

    it('should dispatch ConstraintActions.Request.All and TaskConstraintsActions.Request.One on ngOnInit', () => {
        spyOn(store, 'dispatch').and.callThrough();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledTimes(2);
        expect(store.dispatch).toHaveBeenCalledWith(new ConstraintActions.Request.All());
        expect(store.dispatch).toHaveBeenCalledWith(new TaskConstraintsActions.Request.One(taskId));
    });

    it('should set isLoading to false if all requests have success', () => {
        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.success));
        when(mockConstraintQueries.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to true when request is in progress', () => {
        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.progress));
        when(mockConstraintQueries.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        comp.ngOnInit();
        expect(comp.isLoading).toBeTruthy();

        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.success));
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when request is in error', () => {
        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.error));
        when(mockConstraintQueries.observeConstraintListRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        comp.ngOnInit();

        expect(comp.isLoading).toBeFalsy();
    });

    it('should dispatch TaskConstraintsActions.Update.One on handleSubmit call', () => {
        const expectedAction = new TaskConstraintsActions.Update.One(taskId, {constraints});

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleSubmit(constraints);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch TaskConstraintsActions.Update.OneReset and emit closeEvent on handleCancel call', () => {
        const expectedAction = new TaskConstraintsActions.Update.OneReset(taskId);

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(comp.closeEvent, 'emit').and.callThrough();

        comp.handleCancel();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        expect(comp.closeEvent.emit).toHaveBeenCalled();
    });

    it('should call handle cancel after a successful constraint update', () => {
        spyOn(comp, 'handleCancel').and.callThrough();
        when(mockTaskConstraintQueries.observeTaskConstraintsRequestStatusByTaskId(taskId)).thenReturn(of(RequestStatusEnum.success));

        comp.handleSubmit(constraints);

        comp.ngOnInit();

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should set mismatchedConstraints variable with the mismatched constraints names when there are mismatched constraints', () => {
        const taskConstraints: NamedEnumReference<ConstraintKey>[] = [
            {key: 'CUSTOM1', name: 'CUSTOM1'},
            {key: 'CUSTOM2', name: 'CUSTOM2'},
        ];
        const expectedResult = taskConstraints.map(item => item.name).join(', ');

        when(mockTaskConstraintQueries.observeTaskConstraintsByTaskId(taskId)).thenReturn(of(taskConstraints));

        comp.ngOnInit();

        expect(comp.mismatchedConstraints).toEqual(expectedResult);
    });

    it('should set mismatchedConstraints variable with empty string when there are no mismatched constraints', () => {
        const projectConstraints: ConstraintEntity = MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY;
        const taskConstraints: NamedEnumReference<ConstraintKey>[] = [{key: projectConstraints.key, name: projectConstraints.name}];

        when(mockConstraintQueries.observeActiveConstraintList()).thenReturn(of([projectConstraints]));
        when(mockTaskConstraintQueries.observeTaskConstraintsByTaskId(taskId)).thenReturn(of(taskConstraints));

        expect(comp.mismatchedConstraints).toEqual('');
    });
});
