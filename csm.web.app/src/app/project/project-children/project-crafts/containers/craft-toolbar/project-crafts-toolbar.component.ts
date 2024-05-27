/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';

@Component({
    selector: 'ss-project-crafts-toolbar',
    templateUrl: './project-crafts-toolbar.component.html',
    styleUrls: ['./project-crafts-toolbar.component.scss'],
})
export class ProjectCraftsToolbarComponent implements OnInit, OnDestroy {

    public hasCreatePermission: boolean;

    public showCreateCraft = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _projectCraftQueries: ProjectCraftQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public toggleCreateCraft(): void {
        this.showCreateCraft = !this.showCreateCraft;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectCraftQueries.observeCreateProjectCraftPermission()
                .subscribe(this._setCreateProjectCraftPermission.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setCreateProjectCraftPermission(permission: boolean): void {
        this.hasCreatePermission = permission;
    }
}
