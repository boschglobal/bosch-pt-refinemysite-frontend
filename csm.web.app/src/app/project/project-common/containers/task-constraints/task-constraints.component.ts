/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';

import {State} from '../../../../app.reducers';
import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ConstraintKey} from '../../api/constraints/resources/constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {Task} from '../../models/tasks/task';
import {ConstraintActions} from '../../store/constraints/constraint.actions';
import {ConstraintQueries} from '../../store/constraints/constraint.queries';
import {TaskConstraintsActions} from '../../store/task-constraints/task-constraints.actions';
import {TaskConstraintsQueries} from '../../store/task-constraints/task-constraints.queries';

@Component({
    selector: 'ss-task-constraints',
    templateUrl: './task-constraints.component.html',
})
export class TaskConstraintsComponent implements OnInit, OnDestroy {

    @Output()
    public closeEvent: EventEmitter<null> = new EventEmitter<null>();

    public isLoading = false;

    public mismatchedConstraints: string;

    public projectActiveConstraints: ConstraintEntity[] = [];

    public taskConstraints: NamedEnumReference<ConstraintKey>[];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _isTriggered = false;

    private _task: Task;

    constructor(private _constraintQueries: ConstraintQueries,
                private _modalService: ModalService,
                private _store: Store<State>,
                private _taskConstraintsQueries: TaskConstraintsQueries) {
    }

    ngOnInit() {
        this._setModalOptions();
        this._requestConstraints();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(constraints: ConstraintKey[]): void {
        this._isTriggered = true;

        this._store.dispatch(new TaskConstraintsActions.Update.One(this._task.id, {constraints}));
    }

    public handleCancel(): void {
        this._isTriggered = false;

        this.closeEvent.emit();
        this._store.dispatch(new TaskConstraintsActions.Update.OneReset(this._task.id));
    }

    private _requestConstraints() {
        this._store.dispatch(new ConstraintActions.Request.All());
        this._store.dispatch(new TaskConstraintsActions.Request.One(this._task.id));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._constraintQueries.observeActiveConstraintList(),
                this._taskConstraintsQueries.observeTaskConstraintsByTaskId(this._task.id),
            ]).subscribe(([projectActiveConstraints, taskConstraints]) => {
                this.projectActiveConstraints = projectActiveConstraints;
                this.taskConstraints = taskConstraints;
                this._setMismatchedConstraints(projectActiveConstraints, taskConstraints);
            })
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._constraintQueries.observeConstraintListRequestStatus(),
                this._taskConstraintsQueries.observeTaskConstraintsRequestStatusByTaskId(this._task.id),
            ]).subscribe(([projectRequestStatus, taskRequestStatus]) =>
                this._handleRequestStatus(projectRequestStatus, taskRequestStatus)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setModalOptions(): void {
        const {task} = this._modalService.currentModalData;
        this._task = task;
    }

    private _handleRequestStatus(projectRequestStatus: RequestStatusEnum, taskRequestStatus: RequestStatusEnum): void {
        this.isLoading = projectRequestStatus === RequestStatusEnum.progress || taskRequestStatus === RequestStatusEnum.progress;

        if (taskRequestStatus === RequestStatusEnum.success && this._isTriggered) {
            this.handleCancel();
        }
    }

    private _setMismatchedConstraints(projectActiveConstraints: ConstraintEntity[],
                                      taskConstraints: NamedEnumReference<ConstraintKey>[]): void {
        this.mismatchedConstraints = taskConstraints
            .filter(constraint => !!projectActiveConstraints.length &&
                !projectActiveConstraints.some(activeConstraint => constraint.key === activeConstraint.key))
            .map(constraint => constraint.name)
            .join(', ');
    }
}
