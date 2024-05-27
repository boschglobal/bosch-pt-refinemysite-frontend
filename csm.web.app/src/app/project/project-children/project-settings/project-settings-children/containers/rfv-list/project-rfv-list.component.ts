/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Subject,
    Subscription
} from 'rxjs';
import {
    filter,
    map
} from 'rxjs/operators';

import {State} from '../../../../../../app.reducers';
import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {SaveRfvResource} from '../../../../../project-common/api/rfvs/resources/save-rfv.resource';
import {RfvEntity} from '../../../../../project-common/entities/rfvs/rfv';
import {ProjectSliceService} from '../../../../../project-common/store/projects/project-slice.service';
import {RfvActions} from '../../../../../project-common/store/rfvs/rfv.actions';
import {RfvQueries} from '../../../../../project-common/store/rfvs/rfv.queries';
import {ProjectRfvCaptureComponent} from '../../presentationals/rfv-capture/project-rfv-capture.component';

export const CSS_CLASS_RFV_ITEM_INACTIVE = 'ss-project-rfv-list__item--inactive';
export const CSS_CLASS_RFV_ITEM_IN_EDITION = 'ss-project-rfv-list__item--in-edition';

@Component({
    selector: 'ss-project-rfv-list',
    templateUrl: './project-rfv-list.component.html',
    styleUrls: ['./project-rfv-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRfvListComponent implements OnInit, OnDestroy {

    @ViewChildren(ProjectRfvCaptureComponent)
    public projectRfvCaptures = new QueryList<ProjectRfvCaptureComponent>();

    public activeRfvListTotalItems: number;

    public isLoading = false;

    public rfvList: RfvEntity[] = [];

    public rfvListTotalItems: number;

    public updateCaptureMode: CaptureModeEnum = CaptureModeEnum.update;

    private _currentProjectId: string;

    private _currentEditingItemRequestStatus: Subject<RequestStatusEnum> = new Subject();

    private _disposableSubscriptions: Subscription = new Subscription();

    private _editingRfvId: string;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _projectSliceService: ProjectSliceService,
                private _rfvQueries: RfvQueries,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._requestRfvList();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public activateRfv(item: RfvEntity): void {
        const {key, name} = item;
        this._store.dispatch(new RfvActions.Activate.One(this._currentProjectId, {key, name, active: true}));
    }

    public deactiveRfv(item: RfvEntity): void {
        const {key, name} = item;
        this._store.dispatch(new RfvActions.Deactivate.One(this._currentProjectId, {key, name, active: false}));
    }

    public updateRfv(index: number, rfv: RfvEntity): void {
        this._editingRfvId = rfv.id;
        this.projectRfvCaptures.get(index).setFocus();
    }

    public updateRfvName(name: string, rfv: RfvEntity): void {
        const {key, active} = rfv;
        const payload: SaveRfvResource = {key, name, active};

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Rfv_Update_ConfirmationDialogTitle',
                description: 'Rfv_Update_ConfirmationDialogDescription',
                confirmCallback: () => this._store.dispatch(new RfvActions.Update.One(this._currentProjectId, payload)),
                requestStatusObservable: this._currentEditingItemRequestStatus,
                completeCallback: () => this.cancelRfvEdit(),
            },
        });
    }

    public isRfvLoading(item: RfvEntity): boolean {
        return item.requestStatus === RequestStatusEnum.progress;
    }

    public isEditingRfv(item: RfvEntity): boolean {
        return this._editingRfvId === item.id;
    }

    public cancelRfvEdit(): void {
        this._editingRfvId = null;
    }

    public getRfvItemStyles(item: RfvEntity): { [key: string]: boolean } {
        return {
            [CSS_CLASS_RFV_ITEM_INACTIVE]: !item.active,
            [CSS_CLASS_RFV_ITEM_IN_EDITION]: this.isEditingRfv(item),
        };
    }

    public trackByFn(item: RfvEntity): string {
        return item.id;
    }

    private _requestRfvList(): void {
        this._store.dispatch(new RfvActions.Request.All());
    }

    private _setRfvList(rfvs: RfvEntity[]): void {
        this.rfvList = rfvs;
        this.rfvListTotalItems = rfvs.length;
        this._changeDetectorRef.detectChanges();
    }

    private _setActiveRfvList(rfvs: RfvEntity[]): void {
        this.activeRfvListTotalItems = rfvs.length;
        this._changeDetectorRef.detectChanges();
    }

    private _setListLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._rfvQueries
                .observeRfvList()
                .subscribe(rfvs => this._setRfvList(rfvs)));

        this._disposableSubscriptions.add(
            this._rfvQueries
                .observeRfvList()
                .pipe(
                    filter(() => !!this._editingRfvId),
                    map((items: RfvEntity[]) => items.find(item => item.id === this._editingRfvId)),
                )
                .subscribe(item => this._currentEditingItemRequestStatus.next(item.requestStatus)));

        this._disposableSubscriptions.add(
            this._rfvQueries
                .observeActiveRfvList()
                .subscribe(rfvs => this._setActiveRfvList(rfvs)));

        this._disposableSubscriptions.add(
            this._rfvQueries
                .observeRfvListRequestStatus()
                .subscribe(status => this._setListLoading(status)));

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(id => this._currentProjectId = id));

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._requestRfvList()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
