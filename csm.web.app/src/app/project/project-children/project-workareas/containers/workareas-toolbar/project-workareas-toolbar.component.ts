/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';

@Component({
    selector: 'ss-project-workareas-toolbar',
    templateUrl: './project-workareas-toolbar.component.html',
    styleUrls: ['./project-workareas-toolbar.component.scss'],
})
export class ProjectWorkareasToolbarComponent implements OnInit, OnDestroy {
    public hasCreatePermission: boolean;

    public showCreateWorkarea = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workareaQueries.observeCreateWorkareaPermission()
                .subscribe(this._setCreateProjectWorkareasPermission.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    public toggleCreateWorkarea(): void {
        this.showCreateWorkarea = !this.showCreateWorkarea;
    }

    private _setCreateProjectWorkareasPermission(permission: boolean): void {
        this.hasCreatePermission = permission;
    }
}
