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
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {PATResource} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {SavePATResource} from '../../../../../project/project-common/api/pats/resources/save-pat.resource';
import {AlertMessageResource} from '../../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../../shared/alert/store/alert.actions';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {PATActions} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {PATFormData} from '../../presentationals/pat-capture/pat-capture.component';

@Component({
    selector: 'ss-pat-create',
    templateUrl: './pat-create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatCreateComponent implements OnInit, OnDestroy {

    @Output()
    public closed: EventEmitter<null> = new EventEmitter();

    public isLoading = false;

    public modalType = CaptureModeEnum.create;

    public token: string;

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _patQueries: PATQueries,
                private _store: Store) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleClose(): void {
        this.closed.emit();
    }

    public handleCopyToken(): void {
        this._store.dispatch(new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('PAT_Token_CopyMessage'),
        }));
    }

    public handleSubmit({description, scope, expiresAt}: PATFormData): void {
        const savePATResource: SavePATResource = {
            description,
            scopes: scope,
            validForMinutes: Number(expiresAt),
        };

        this._store.dispatch(new PATActions.Create.One(savePATResource));
    }

    private _displayToken(newPAT: PATResource): void {
        this.token = newPAT?.token;

        this._changeDetectorRef.detectChanges();
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._patQueries
                .observeCurrentPATRequestStatus()
                .subscribe(status => this._handleCaptureState(status)));

        this._disposableSubscriptions.add(
            this._patQueries
                .observeCurrentItem()
                .subscribe(newPAT => this._displayToken(newPAT)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
