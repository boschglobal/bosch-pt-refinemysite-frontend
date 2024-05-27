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
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {PATResource} from '../../../../../project/project-common/api/pats/resources/pat.resource';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {PATActions} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {PatContentModel} from '../pat-content-model/pat-content.model';

@Component({
    selector: 'ss-pat-content',
    templateUrl: './pat-content.component.html',
    styleUrls: ['./pat-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatContentComponent implements OnInit, OnDestroy {

    public isLoading = false;

    public modalCreatePAT = ModalIdEnum.CreatePAT;

    public modalUpdatePAT = ModalIdEnum.UpdatePAT;

    public patResource: PATResource;

    public patList: PatContentModel[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _patResourceList: PATResource[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _patQueries: PATQueries,
                private _store: Store) {
    }

    ngOnInit(): void {
        this._requestPATs();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public closeCreateModal(): void {
        this._store.dispatch(new PATActions.Initialize.Current());
    }

    public closeModal(): void {
        this._modalService.close();
    }

    public handleDeletePAT(patId: string): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'PAT_Delete_Title',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new PATActions.Delete.One(patId)),
                requestStatusObservable: this._patQueries.observeCurrentPATRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    public openCreatePAT(): void {
        this.patResource = null;

        this._modalService.open({
            id: this.modalCreatePAT,
            data: null,
        });
    }

    public openUpdatePAT(patId: string): void {
        this.patResource = this._patResourceList.find(p => p.id === patId);

        this._modalService.open({
            id: this.modalUpdatePAT,
            data: null,
        });
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;

        this._changeDetectorRef.detectChanges();
    }

    private _setPATList(pats: PATResource[]): void {
        this._patResourceList = pats;
        this.patList = this._patResourceList.map(pat => PatContentModel.fromPATResource(pat));

        this._changeDetectorRef.detectChanges();
    }

    private _requestPATs(): void {
        this._store.dispatch(new PATActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._patQueries
                .observePATsRequestStatus()
                .subscribe(status => this._handleRequestStatus(status)));

        this._disposableSubscriptions.add(
            this._patQueries
                .observePATs()
                .subscribe(pats => this._setPATList(pats)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
