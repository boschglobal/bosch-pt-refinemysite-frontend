/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../shared/ui/modal/containers/modal-component/modal.component';
import {Task} from '../../models/tasks/task';
import {ProjectTaskActions} from '../../store/tasks/task.actions';

@Component({
    selector: 'ss-task-constraints-label',
    templateUrl: './task-constraints-label.component.html',
    styleUrls: ['./task-constraints-label.component.scss'],
})
export class TaskConstraintsLabelComponent implements OnInit, OnDestroy {

    public canCreateOrUpdate: boolean;

    public commaSeparatedConstraintsNames: string;

    public constraintsModal: ModalInterface = {
        id: ModalIdEnum.UpdateConstraints,
        data: {},
    };

    public hasConstraints: boolean;

    private _disposableSubscriptions = new Subscription();

    private _task: Task;

    constructor(private _modalService: ModalService,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    @Input()
    public set task(task: Task) {
        this._task = task;

        this._setPermissions(task);
        this._setHasConstraints(task);
        this._setCommaSeparatedConstraintsNames(task);
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public openModal(): void {
        this.constraintsModal.data = Object.assign({}, {
            task: this._task,
        });
        this._modalService.open(this.constraintsModal);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._store.dispatch(new ProjectTaskActions.Request.One(this._task.id))));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setPermissions(task: Task): void {
        this.canCreateOrUpdate = task.permissions.canUpdateConstraints;
    }

    private _setHasConstraints(task: Task): void {
        this.hasConstraints = !!task.constraints.items.length;
    }

    private _setCommaSeparatedConstraintsNames(task: Task): void {
        this.commaSeparatedConstraintsNames = task.constraints.items.map(constraint => constraint.name).join(', ');
    }
}
