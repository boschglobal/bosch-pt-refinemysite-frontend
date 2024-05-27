/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {PATResource} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {SavePATResource} from '../../../../../project/project-common/api/pats/resources/save-pat.resource';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {
    PATActions,
    UpdatePATPayload
} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {
    PATExpirationEnum,
    patExpirationEnumHelper
} from '../../../../user-common/enums/patExpiration.enum';
import {PATFormData} from '../../presentationals/pat-capture/pat-capture.component';

@Component({
    selector: 'ss-pat-edit',
    templateUrl: './pat-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatEditComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue(value: PATResource) {
        this._patResource = value;
        this._setPATFormData();
    }

    @Output()
    public closed: EventEmitter<null> = new EventEmitter();

    public isLoading = false;

    public modalType = CaptureModeEnum.update;

    public patFormData: PATFormData;

    private _disposableSubscriptions = new Subscription();

    private _isSubmitting = false;

    private _patResource: PATResource;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _patQueries: PATQueries,
                private _store: Store) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleClose(): void {
        this.closed.emit();
    }

    public handleSubmit({description, scope, expiresAt}: PATFormData): void {
        const savePATResource: SavePATResource = {
            description,
            scopes: scope,
            validForMinutes: Number(expiresAt),
        };
        const updatePATPayload: UpdatePATPayload = {
            patId: this._patResource.id,
            version: this._patResource.version,
            savePATResource,
        };

        this._isSubmitting = true;

        this._store.dispatch(new PATActions.Update.One(updatePATPayload));
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = requestStatus === RequestStatusEnum.progress;

            if (requestStatus === RequestStatusEnum.success) {
                this.handleClose();
            }
        }

        this._changeDetectorRef.detectChanges();
    }

    public _setPATFormData(): void {
        const expirationKey = patExpirationEnumHelper.getKeyByValue(
            Math.round(moment.duration(moment(this._patResource.expiresAt).diff(this._patResource.createdDate)).asMinutes()).toString());

        this.patFormData = {
            description: this._patResource.description,
            scope: this._patResource.scopes,
            expiresAt: PATExpirationEnum[expirationKey],
        };
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._patQueries
                .observeCurrentPATRequestStatus()
                .subscribe(status => this._handleCaptureState(status)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
