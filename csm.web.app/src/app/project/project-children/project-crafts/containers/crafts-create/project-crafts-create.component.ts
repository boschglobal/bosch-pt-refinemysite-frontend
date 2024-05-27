/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {CraftResource} from '../../../../../craft/api/resources/craft.resource';
import {CraftActions} from '../../../../../shared/master-data/store/crafts/craft.actions';
import {CraftSliceService} from '../../../../../shared/master-data/store/crafts/craft-slice.service';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {ProjectCraftResource} from '../../../../project-common/api/crafts/resources/project-craft.resource';
import {ProjectCraftActions} from '../../../../project-common/store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {
    ProjectCraftsCapture,
    ProjectCraftsCaptureComponent
} from '../../presentationals/crafts-capture/project-crafts-capture.component';

@Component({
    selector: 'ss-project-crafts-create',
    templateUrl: './project-crafts-create.component.html',
    styleUrls: ['./project-crafts-create.component.scss'],
})
export class ProjectCraftsCreateComponent implements OnInit, OnDestroy {
    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('projectCraftsCapture', {static: true})
    public projectCraftsCapture: ProjectCraftsCaptureComponent;

    public captureMode: CaptureModeEnum = CaptureModeEnum.create;

    public crafts: string[] = [];

    public defaultValues: ProjectCraftsCapture;

    public isSubmitting = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _craftSliceService: CraftSliceService,
                private _projectCraftQueries: ProjectCraftQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._requestCrafts();
        this._setSubscriptions();
        this._setFocus();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(value: ProjectCraftsCapture): void {
        this._store.dispatch(new ProjectCraftActions.Create.One(value));
    }

    public handleCancel(): void {
        this.onCancel.emit(null);
        this._resetForm();
    }

    private _setFocus(): void {
        this.projectCraftsCapture.setFocus();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectCraftQueries
                .observeCurrentCraftRequestStatus()
                .subscribe(status => this._handleRequestStatus(status))
        );

        this._disposableSubscriptions.add(
            this._craftSliceService
                .observeCraftList()
                .subscribe(crafts => this._setCrafts(crafts))
        );

        this._disposableSubscriptions.add(
            this._projectCraftQueries
                .observeCrafts()
                .subscribe(crafts => this._setDefaultValues(crafts))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _requestCrafts(): void {
        this._store.dispatch(new CraftActions.Request.Crafts());
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.success) {
            this._resetForm();
        }
    }

    private _setCrafts(crafts: CraftResource[]): void {
        this.crafts = crafts.map(craft => craft.name);
    }

    private _setDefaultValues(crafts: ProjectCraftResource[]): void {
        this.defaultValues = {
            name: '',
            color: '',
            position: crafts.length + 1,
        };
    }

    private _resetForm(): void {
        this.projectCraftsCapture.resetForm();
        this._store.dispatch(new ProjectCraftActions.Update.OneReset());
    }
}
