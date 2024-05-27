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
import {ProjectCraftResource} from '../../../../project-common/api/crafts/resources/project-craft.resource';
import {SaveProjectCraftResource} from '../../../../project-common/api/crafts/resources/save-project-craft.resource';
import {
    ProjectCraftActions,
    UpdateProjectCraftPayload
} from '../../../../project-common/store/crafts/project-craft.actions';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {ProjectCraftModel} from '../models/project-craft.model';

export const UPDATE_CRAFT_ITEM_ID = 'update-craft';
export const DELETE_CRAFT_ITEM_ID = 'delete-craft';

@Component({
    selector: 'ss-project-crafts-list',
    templateUrl: './project-crafts-list.component.html',
    styleUrls: ['./project-crafts-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCraftsListComponent implements OnInit, OnDestroy {

    public crafts: ProjectCraftModel[];

    public editedIndex: number;

    public editingCraftId: string;

    public isLoading: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
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

    public get hasNoCrafts(): boolean {
        return !this.isLoading && this.crafts && this.crafts.length === 0;
    }

    public disableEdit(): void {
        this.editedIndex = null;
        this.editingCraftId = null;
        this._changeDetectorRef.detectChanges();
    }

    public handleSort(event: SortableListSort): void {
        const {currentIndex, item: {id, name, version, color}} = event;
        const saveProjectCraft: SaveProjectCraftResource = {
            name,
            version,
            color,
            position: currentIndex + 1,
        };
        const payload: UpdateProjectCraftPayload = {
            saveProjectCraft,
            projectCraftId: id,
            craftVersion: version,
        };

        this._store.dispatch(new ProjectCraftActions.Update.List(payload));
    }

    public handleDropdownItemClicked({id, value}: MenuItem<ProjectCraftModel>): void {
        switch (id) {
            case UPDATE_CRAFT_ITEM_ID:
                this._enableEdit(value);
                break;
            case DELETE_CRAFT_ITEM_ID:
                this._handleDelete(value);
                break;
        }
        this._changeDetectorRef.detectChanges();
    }

    private _canEdit(craft: ProjectCraftResource): boolean {
        return craft._links.hasOwnProperty('update');
    }

    private _canDelete(craft: ProjectCraftResource): boolean {
        return craft._links.hasOwnProperty('delete');
    }

    private _enableEdit(craft: ProjectCraftModel): void {
        this.editedIndex = craft.position - 1;
        this.editingCraftId = craft.id;
    }

    private _getDropdownItems(craft: ProjectCraftResource): MenuItemsList[] {
        const items: MenuItem<ProjectCraftResource>[] = [];

        if (this._canEdit(craft)) {
            items.push({
                id: UPDATE_CRAFT_ITEM_ID,
                type: 'button',
                label: 'Generic_EditDetails',
                value: craft,
            });
        }

        if (this._canDelete(craft)) {
            items.push({
                id: DELETE_CRAFT_ITEM_ID,
                type: 'button',
                label: 'Craft_Delete_Label',
                value: craft,
            });
        }

        return items.length ? [{items}] : [];
    }

    private _handleDelete(craft: ProjectCraftModel): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Craft_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new ProjectCraftActions.Delete.One(craft.id)),
                cancelCallback: () => this._store.dispatch(new ProjectCraftActions.Delete.OneReset()),
                requestStatusObservable: this._projectCraftQueries.observeCraftsRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectCraftQueries
                .observeCrafts()
                .subscribe(crafts => this._setCrafts(crafts))
        );

        this._disposableSubscriptions.add(
            this._projectCraftQueries
                .observeCraftsRequestStatus()
                .subscribe(status => this._setLoading(status))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setCrafts(crafts: ProjectCraftResource[]): void {
        this.crafts = crafts.map((craft: ProjectCraftResource) => {
            const {position, version, name, id, color} = craft;

            return {
                position,
                version,
                name,
                id,
                drag: !!craft._links.update,
                color,
                dropdownItems: this._getDropdownItems(craft),
            };
        });

        this._changeDetectorRef.detectChanges();
    }

    private _setLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._changeDetectorRef.detectChanges();
    }
}
