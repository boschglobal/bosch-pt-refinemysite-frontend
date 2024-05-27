/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectParticipantResource} from '../../../project-common/api/participants/resources/project-participant.resource';
import {SaveProjectResource} from '../../../project-common/api/projects/resources/save-project.resource';
import {ProjectCaptureComponent} from '../../../project-common/presentationals/project-capture/project-capture.component';
import {ProjectCaptureModel} from '../../../project-common/presentationals/project-capture/project-capture.model';
import {ProjectActions} from '../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {PROJECT_ROUTE_PATHS} from '../../../project-routing/project-route.paths';

@Component({
    templateUrl: './project-create.component.html',
    styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit, OnDestroy {

    /**
     * @description Property with project capture component
     */
    @ViewChild('projectCapture', {static: true})
    public projectCapture: ProjectCaptureComponent;

    /**
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isSubmitting = false;

    /**
     * @description Property with contact card information
     */
    public contacts: ProjectParticipantResource[] = [];

    /**
     * @description Property to define that the capture has the create mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.create;

    private _disposableSubscriptions = new Subscription();

    constructor(private _projectSliceService: ProjectSliceService,
                private _userQueries: UserQueries,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._store.dispatch(new ProjectActions.Initialize.ProjectCreate());
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Triggered when project capture is submitted
     * @param project
     */
    public onSubmitCreate(project: ProjectCaptureModel): void {
        const saveProjectResource = project as SaveProjectResource;
        this._store.dispatch(new ProjectActions.Create.Project(
            {project: saveProjectResource, picture: project.picture}
        ));
    }

    /**
     * @description Triggered when project capture is cancelled
     */
    public onCancelCreate(): void {
        this._router.navigate([PROJECT_ROUTE_PATHS.projects]);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe(user => this._setUserInfo(user))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setUserInfo(user: UserResource): void {
        const {firstName, lastName, phoneNumbers, id, _embedded, email} = user;

        const userAsParticipant = new ProjectParticipantResource();
        userAsParticipant.user = new ResourceReferenceWithPicture(id, `${firstName} ${lastName}`, _embedded.profilePicture._links.small.href);
        userAsParticipant.email = email;
        userAsParticipant.phoneNumbers = phoneNumbers;

        this.contacts = [userAsParticipant];
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (requestStatus !== RequestStatusEnum.success) {
            this.isSubmitting = requestStatus === RequestStatusEnum.progress;
        } else {
            this.projectCapture.resetForm();
            this._disposableSubscriptions.unsubscribe();
            this._router
                .navigate([ProjectUrlRetriever.getProjectDashboardUrl(this._projectSliceService.getCurrentProject().id)])
                .then(() => this.isSubmitting = false);
        }
    }
}
