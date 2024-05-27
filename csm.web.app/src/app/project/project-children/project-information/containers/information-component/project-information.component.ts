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
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectResource} from '../../../../project-common/api/projects/resources/project.resource';
import {EmployeeRoleEnum} from '../../../../project-common/enums/employee-role.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';

@Component({
    templateUrl: './project-information.component.html',
})
export class ProjectInformationComponent implements OnInit, OnDestroy {

    /**
     * @description Property with project information
     */
    public project: ProjectResource;

    /**
     * @description Property with project contacts
     */
    public contacts: ProjectParticipantResource[] = [];

    /**
     * @description Flag indicating if user has permission to edit the current project
     */
    public hasEditPermission: boolean;

    public projectEditURI: string;

    public toolbarInlineButtonsColor = COLORS.black;

    private _disposableSubscription: Subscription = new Subscription();

    constructor(private _projectSliceService: ProjectSliceService,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._requestParticipants();
        this._setSubscriptions();
        this.projectEditURI = ProjectUrlRetriever.getProjectEditUrl(this.project.id);
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    private _requestParticipants(): void {
        this._store.dispatch(new ProjectParticipantActions.Request.ActiveByRole([EmployeeRoleEnum.CSM]));
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProject()
                .subscribe(this._setProject.bind(this))
        );

        this._disposableSubscription.add(
            this._projectSliceService.observeEditProjectPermission()
                .subscribe(this._setEditPermission.bind(this))
        );

        this._disposableSubscription.add(
            this._projectParticipantQueries.observeActiveParticipantsByRole(EmployeeRoleEnum.CSM)
                .subscribe(this._setContacts.bind(this))
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _setProject(currentProject: ProjectResource): void {
        this.project = currentProject;
    }

    private _setEditPermission(permission: boolean): void {
        this.hasEditPermission = permission;
    }

    private _setContacts(contacts: ProjectParticipantResource[]): void {
        this.contacts = contacts;
    }
}
