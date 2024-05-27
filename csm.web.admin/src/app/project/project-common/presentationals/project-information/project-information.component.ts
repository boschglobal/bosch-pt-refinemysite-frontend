/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import {ButtonLink} from '../../../../shared/ui/links/button-link/button-link-component/button-link.component';
import {ProjectResource} from '../../api/resources/project.resource';

@Component({
    selector: 'ss-project-information',
    templateUrl: './project-information.component.html',
    styleUrls: ['./project-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInformationComponent {

    @Input()
    public set project(project: ProjectResource) {
        this._project = project;

        this._setCompanyLink();
    }

    public get project(): ProjectResource {
        return this._project;
    }

    @Output()
    public delete = new EventEmitter<ProjectResource>();

    public companyLink: ButtonLink;

    private _project: ProjectResource;

    public get canDelete(): boolean {
        return this._project._links.hasOwnProperty('delete');
    }

    public handleDelete(): void {
        if (this.canDelete) {
            this.delete.emit(this._project);
        }
    }

    private _setCompanyLink(): void {
        const {id, displayName} = this._project.company;

        this.companyLink = {
            routerLink: `/management/companies/${id}`,
            label: displayName,
        };
    }
}
