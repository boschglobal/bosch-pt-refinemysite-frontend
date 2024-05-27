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
import {SaveConstraintResource} from '../../../../../project-common/api/constraints/resources/save-constraint.resource';
import {ConstraintEntity} from '../../../../../project-common/entities/constraints/constraint';
import {ConstraintActions} from '../../../../../project-common/store/constraints/constraint.actions';
import {ConstraintQueries} from '../../../../../project-common/store/constraints/constraint.queries';
import {ConstraintCaptureComponent} from '../../presentationals/constraint-capture/constraint-capture.component';

export const CSS_CLASS_CONSTRAINT_ITEM_INACTIVE = 'ss-constraint-list__item--inactive';
export const CSS_CLASS_CONSTRAINT_ITEM_IN_EDITION = 'ss-constraint-list__item--in-edition';

@Component({
    selector: 'ss-constraint-list',
    templateUrl: './constraint-list.component.html',
    styleUrls: ['./constraint-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstraintListComponent implements OnInit, OnDestroy {

    @ViewChildren(ConstraintCaptureComponent)
    public constraintCaptures = new QueryList<ConstraintCaptureComponent>();

    public activeConstraintListTotalItems: number;

    public constraintList: ConstraintEntity[] = [];

    public constraintListTotalItems: number;

    public isLoading = false;

    public updateCaptureMode: CaptureModeEnum = CaptureModeEnum.update;

    private _currentEditingItemRequestStatus: Subject<RequestStatusEnum> = new Subject();

    private _disposableSubscriptions: Subscription = new Subscription();

    private _editingConstraintId: string;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _constraintQueries: ConstraintQueries,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._requestConstraintList();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public activateConstraint(item: ConstraintEntity): void {
        const {key, name} = item;
        this._store.dispatch(new ConstraintActions.Activate.One({key, name, active: true}));
    }

    public deactivateConstraint(item: ConstraintEntity): void {
        const {key, name} = item;
        this._store.dispatch(new ConstraintActions.Deactivate.One({key, name, active: false}));
    }

    public updateConstraint(index: number, constraint: ConstraintEntity): void {
        this._editingConstraintId = constraint.id;
        this.constraintCaptures.get(index).setFocus();
    }

    public updateConstraintName(name: string, constraint: ConstraintEntity): void {
        const {key, active} = constraint;
        const payload: SaveConstraintResource = {key, name, active};

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Constraint_Update_ConfirmationDialogTitle',
                description: 'Constraint_Update_ConfirmationDialogDescription',
                confirmCallback: () => this._store.dispatch(new ConstraintActions.Update.One(payload)),
                requestStatusObservable: this._currentEditingItemRequestStatus,
                completeCallback: () => this.cancelConstraintEdit(),
            },
        });
    }

    public isConstraintLoading(item: ConstraintEntity): boolean {
        return item.requestStatus === RequestStatusEnum.progress;
    }

    public isEditingConstraint(item: ConstraintEntity): boolean {
        return this._editingConstraintId === item.id;
    }

    public cancelConstraintEdit(): void {
        this._editingConstraintId = null;
    }

    public getConstraintItemStyles(item: ConstraintEntity): { [key: string]: boolean } {
        return {
            [CSS_CLASS_CONSTRAINT_ITEM_INACTIVE]: !item.active,
            [CSS_CLASS_CONSTRAINT_ITEM_IN_EDITION]: this.isEditingConstraint(item),
        };
    }

    public trackByFn(item: ConstraintEntity): string {
        return item.id;
    }

    private _requestConstraintList(): void {
        this._store.dispatch(new ConstraintActions.Request.All());
    }

    private _setConstraintList(constraints: ConstraintEntity[]): void {
        this.constraintList = constraints;
        this.constraintListTotalItems = constraints.length;
        this._changeDetectorRef.detectChanges();
    }

    private _setActiveConstraintList(constraints: ConstraintEntity[]): void {
        this.activeConstraintListTotalItems = constraints.length;
        this._changeDetectorRef.detectChanges();
    }

    private _setListLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._constraintQueries
                .observeConstraintList()
                .subscribe(constraints => this._setConstraintList(constraints)));

        this._disposableSubscriptions.add(
            this._constraintQueries
                .observeConstraintList()
                .pipe(
                    filter(() => !!this._editingConstraintId),
                    map((items: ConstraintEntity[]) => items.find(item => item.id === this._editingConstraintId)),
                )
                .subscribe(item => this._currentEditingItemRequestStatus.next(item.requestStatus)));

        this._disposableSubscriptions.add(
            this._constraintQueries
                .observeActiveConstraintList()
                .subscribe(constraints => this._setActiveConstraintList(constraints)));

        this._disposableSubscriptions.add(
            this._constraintQueries
                .observeConstraintListRequestStatus()
                .subscribe(status => this._setListLoading(status)));

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._requestConstraintList()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
