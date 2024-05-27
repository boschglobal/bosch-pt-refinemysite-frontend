/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
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
    selector: 'ss-project-crafts-edit',
    templateUrl: './project-crafts-edit.component.html',
})
export class ProjectCraftsEditComponent implements OnInit, OnDestroy {

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('projectCraftsCapture', {static: true})
    public projectCraftsCapture: ProjectCraftsCaptureComponent;

    public isSubmitting = false;

    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    public defaultValues: ProjectCraftsCapture;

    public crafts: string[] = [];

    @Input()
    public set craft(craft: ProjectCraftResource) {
        const {id, color, name, version, position} = craft;

        this._craftId = id;
        this._craftVersion = version;
        this.defaultValues = {
            name,
            color,
            position,
        };
    }

    private _craftId: string;

    private _craftVersion: number;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _craftSliceService: CraftSliceService,
                private _projectCraftQueries: ProjectCraftQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._requestCrafts();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(value: any): void {
        this._store.dispatch(new ProjectCraftActions.Update.One({
            saveProjectCraft: value,
            projectCraftId: this._craftId,
            craftVersion: this._craftVersion,
        }));
    }

    public handleCancel(): void {
        this.onCancel.emit(null);
        this._resetForm();
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
            this.handleCancel();
        }
    }

    private _setCrafts(crafts: CraftResource[]): void {
        this.crafts = crafts.map(craft => craft.name);
    }

    private _resetForm(): void {
        this.projectCraftsCapture.resetForm();
        this._store.dispatch(new ProjectCraftActions.Update.OneReset());
    }
}
