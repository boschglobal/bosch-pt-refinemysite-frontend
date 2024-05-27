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
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {CaptureModeEnum} from '../../../shared/misc/enums/capture-mode.enum';
import {FeatureAction} from '../../feature-common/store/feature.actions';
import {FeatureQueries} from '../../feature-common/store/feature.queries';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {State} from '../../../app.reducers';

@Component({
    selector: 'ss-feature-create',
    templateUrl: './feature-create.component.html',
    styleUrls: ['./feature-create.component.scss']
})
export class FeatureCreateComponent implements OnInit, OnDestroy {

    @Output()
    public cancel = new EventEmitter<null>();

    public isLoading = false;

    public mode = CaptureModeEnum.Create;

    private _isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(private _featureQueries: FeatureQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCreate(feature: string): void {
        this._isSubmitting = true;
        this._store.dispatch(new FeatureAction.Create.Feature(feature));
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
                this._store.dispatch(new FeatureAction.Create.FeatureReset());
                this.cancel.emit();
            }

            this.isLoading = requestStatus === RequestStatusEnum.Progress;
        }
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
