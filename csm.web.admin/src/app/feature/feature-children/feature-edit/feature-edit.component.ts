/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Inject,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {FeatureAction} from '../../feature-common/store/feature.actions';
import {FeatureFormResource} from '../../feature-common/api/resources/feature-form.resource';
import {FeatureQueries} from '../../feature-common/store/feature.queries';
import {FeatureStateEnum} from '../../feature-common/api/resources/feature.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-feature-edit',
    templateUrl: './feature-edit.component.html',
    styleUrls: ['./feature-edit.component.scss']
})
export class FeatureEditComponent implements OnInit, OnDestroy {

    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Update;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(@Inject(MAT_DIALOG_DATA) public dataConfig: FeatureFormResource,
                private _featureQueries: FeatureQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleUpdate(feature: FeatureFormResource): void {
        this._isSubmitting = true;
        switch (FeatureStateEnum[feature.status]) {
            case FeatureStateEnum.DISABLED:
                this._store.dispatch(new FeatureAction.Set.FeatureDisable(feature.name));
                break;
            case FeatureStateEnum.ENABLED:
                this._store.dispatch(new FeatureAction.Set.FeatureEnable(feature.name));
                break;
            case FeatureStateEnum.WHITELISTACTIVATED:
                this._store.dispatch(new FeatureAction.Set.FeatureWhitelistActive(feature.name));
                break;
            default:
                break;
        }
    }

    public handleCancel(): void {
        this._isSubmitting = false;
        this.cancel.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._featureQueries.observeCurrentFeatureRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus === RequestStatusEnum.Success) {
                this._store.dispatch(new FeatureAction.Set.FeatureReset());
                this.cancel.emit();
            }

            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
