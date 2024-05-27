import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {
    State,
    Store
} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {
    ConfirmationDialogComponent,
    ConfirmationDialogDataConfig
} from '../../../../shared/dialog/components/confirmation-dialog/confirmation-dialog.component';
import {PROJECT_DELETE_CONFIRM_DIALOG_CONFIG} from '../../../constants/project-confirm-delete-dialog-config';
import {ProjectActions} from '../../../project-common/store/project.actions';
import {ProjectQueries} from '../../../project-common/store/project.queries';
import {ProjectResource} from '../../../project-common/api/resources/project.resource';

@Component({
    selector: 'ss-project-detail-general',
    templateUrl: './project-detail-general.component.html',
    styleUrls: ['./project-detail-general.component.scss']
})
export class ProjectDetailGeneralComponent implements OnInit, OnDestroy {

    public project: ProjectResource;

    private _disposableSubscription: Subscription = new Subscription();

    constructor(private _dialog: MatDialog,
                private _projectQueries: ProjectQueries,
                private _router: Router,
                private _store: Store<State<any>>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    public handleDelete({id, title}: ProjectResource): void {
        const data: ConfirmationDialogDataConfig = {
            ...PROJECT_DELETE_CONFIRM_DIALOG_CONFIG,
            closeObservable: this._projectQueries.observeCurrentProjectRequestStatus(),
            confirmationInputText: title,
        };
        const dialog = this._dialog.open(ConfirmationDialogComponent, {data});
        dialog.componentInstance.cancel.subscribe(() => {
            this._store.dispatch(new ProjectActions.Delete.OneReset());
            dialog.close();
        });
        dialog.componentInstance.confirm.subscribe((confirmText: string) =>
            this._store.dispatch(new ProjectActions.Delete.One(id, {title: confirmText})));
        dialog.componentInstance.dialogSuccess.subscribe(() => this._router.navigate(['/management/projects']));
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectQueries.observeCurrentProject()
                .subscribe(project => this._setProject(project))
        );
    }

    private _setProject(project: ProjectResource) {
        this.project = project;
    }

    private _unsetSubscription(): void {
        this._disposableSubscription.unsubscribe();
    }
}
