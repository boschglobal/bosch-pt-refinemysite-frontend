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

import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SortableListSort} from '../../../../../shared/ui/sortable-list/sortable-list.component';
import {SaveWorkareaResource} from '../../../../project-common/api/workareas/resources/save-workarea.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {
    UpdateWorkareaPayload,
    WorkareaActions
} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectWorkareaModel} from '../../models/project-workarea.model';

export const UPDATE_WORKAREA_ITEM_ID = 'update-workarea';
export const DELETE_WORKAREA_ITEM_ID = 'delete-workarea';

@Component({
    selector: 'ss-project-workareas-list',
    templateUrl: './project-workareas-list.component.html',
    styleUrls: ['./project-workareas-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkareasListComponent implements OnInit, OnDestroy {

    public workareas: ProjectWorkareaModel[];

    public isLoading: boolean;

    public editedIndex: number;

    public editingWorkareaId: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _store: Store<State>,
                private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._requestWorkareas();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public get hasNoWorkareas(): boolean {
        return !this.isLoading && this.workareas.length === 0;
    }

    public handleDropdownItemClicked({id, value}: MenuItem<ProjectWorkareaModel>): void {
        switch (id) {
            case UPDATE_WORKAREA_ITEM_ID:
                this._enableEdit(value);
                break;
            case DELETE_WORKAREA_ITEM_ID:
                this._handleDelete(value);
                break;
        }
        this._changeDetectorRef.detectChanges();
    }

    public handleSort(event: SortableListSort): void {
        const {currentIndex, item: {id, name, version}} = event;
        const saveWorkarea: SaveWorkareaResource = {
            name,
            version,
            position: currentIndex + 1,
        };
        const payload: UpdateWorkareaPayload = {
            saveWorkarea,
            workareaId: id,
        };

        this._store.dispatch(new WorkareaActions.Update.List(payload));
    }

    public disableEdit(): void {
        this.editedIndex = null;
        this.editingWorkareaId = null;
        this._changeDetectorRef.detectChanges();
    }

    private _canEdit(workarea: WorkareaResource): boolean {
        return workarea._links.hasOwnProperty('update');
    }

    private _canDelete(workarea: WorkareaResource): boolean {
        return workarea._links.hasOwnProperty('delete');
    }

    private _enableEdit(workarea: ProjectWorkareaModel): void {
        this.editedIndex = workarea.position - 1;
        this.editingWorkareaId = workarea.id;
    }

    private _getDropdownItems(workarea: WorkareaResource): MenuItemsList[] {
        const items: MenuItem<WorkareaResource>[] = [];

        if (this._canEdit(workarea)) {
            items.push({
                id: UPDATE_WORKAREA_ITEM_ID,
                type: 'button',
                label: 'Generic_EditDetails',
                value: workarea,
            });
        }

        if (this._canDelete(workarea)) {
            items.push({
                id: DELETE_WORKAREA_ITEM_ID,
                type: 'button',
                label: 'Workarea_Delete_Label',
                value: workarea,
            });
        }

        return items.length ? [{items}] : [];
    }

    private _handleDelete(workarea: ProjectWorkareaModel): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Workarea_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new WorkareaActions.Delete.One(workarea.id)),
                cancelCallback: () => this._store.dispatch(new WorkareaActions.Delete.OneReset()),
                requestStatusObservable: this._workareaQueries.observeWorkareasRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _requestWorkareas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workareaQueries
                .observeWorkareas()
                .subscribe(workareas => this._setWorkareas(workareas))
        );

        this._disposableSubscriptions.add(
            this._workareaQueries
                .observeWorkareasRequestStatus()
                .subscribe(status => this._setLoading(status))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setWorkareas(workareas: WorkareaResource[]): void {
        this.workareas = workareas.map((workarea: WorkareaResource) => {
            const {position, version, name, id} = workarea;

            return {
                position,
                version,
                name,
                id,
                drag: !!workarea._links.update,
                dropdownItems: this._getDropdownItems(workarea),
            };
        });
        this._changeDetectorRef.detectChanges();
    }

    private _setLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._changeDetectorRef.detectChanges();
    }
}
