/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {ProjectResource} from '../../project-common/api/resources/project.resource';
import {ProjectQueries} from '../../project-common/store/project.queries';

@Component({
    selector: 'ss-project-details',
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
    public project: ProjectResource;

    public routes = [
        {
            label: 'ProjectInformationComponent_Title',
            routerLink: ''
        },
        {
            label: 'Generic_Features',
            routerLink: ''
        }
    ];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _projectQueries: ProjectQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectQueries
                .observeCurrentProject()
                .subscribe(project => {
                    this._setProject(project);
                    this._setRoutes();
                })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setRoutes() {
        this.routes[0].routerLink = `/management/projects/${this.project.id}/detail`;
        this.routes[1].routerLink = `/management/projects/${this.project.id}/features`;
    }

    private _setProject(project: ProjectResource) {
        this.project = project;
    }
}
