/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    isEqual,
    omit
} from 'lodash';
import * as moment from 'moment';
import {
    of,
    Subscription,
    zip,
} from 'rxjs';
import {
    filter,
    switchMap,
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectResource} from '../../../../project-common/api/projects/resources/project.resource';
import {SaveProjectPictureResource} from '../../../../project-common/api/projects/resources/save-project-picture.resource';
import {EmployeeRoleEnum} from '../../../../project-common/enums/employee-role.enum';
import {ProjectCaptureComponent} from '../../../../project-common/presentationals/project-capture/project-capture.component';
import {ProjectCaptureModel} from '../../../../project-common/presentationals/project-capture/project-capture.model';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {
    ProjectActions,
    ProjectPictureActions
} from '../../../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';

@Component({
    templateUrl: './project-edit.component.html',
    styleUrls: ['./project-edit.component.scss'],
})
export class ProjectEditComponent implements OnInit, OnDestroy {

    /**
     * @description Property with project capture component
     */
    @ViewChild('projectCapture', {static: true})
    public projectCapture: ProjectCaptureComponent;

    /**
     * @description Property with contact information
     */
    public contacts: ProjectParticipantResource[] = [];

    /**
     * Property with default capture values
     */
    public defaultCaptureValues: any = {
        picture: null,
        title: '',
        description: '',
        number: '',
        start: null,
        end: null,
        client: '',
        category: null,
        address: {
            street: '',
            houseNumber: '',
            zipCode: '',
            city: '',
        },
    };

    /**
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isRequesting = false;

    /**
     * @description Property to define that the capture has the update mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    /**
     * @description Property injected to present loader view
     * @type {boolean}
     */
    public isLoading = true;

    private _isProjectSet: boolean;

    private _areContactsSet: boolean;

    private _disposableSubscriptions = new Subscription();

    private _currentProjectId: string;

    constructor(private _blobService: BlobService,
                private _projectSliceService: ProjectSliceService,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _store: Store<State>,
                private _router: Router) {
    }

    ngOnInit() {
        this._isProjectSet = false;
        this._areContactsSet = false;
        this._requestParticipants();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Triggered when project capture is submitted
     * @param {ProjectCaptureModel} project
     */
    public onSubmitEdit(project: ProjectCaptureModel): void {
        const projectData: Object = omit(project, 'picture');
        const defaultCaptureValuesData: Object = omit(this.defaultCaptureValues, 'picture');
        let isProjectEdited = false;

        if (!isEqual(projectData, defaultCaptureValuesData)) {
            isProjectEdited = true;
            this._store.dispatch(new ProjectActions.Update.Project(project));
        }

        if (!isEqual(project.picture, this.defaultCaptureValues.picture)) {
            if (project.picture === null) {
                this._store.dispatch(new ProjectPictureActions.Delete.ProjectPicture(isProjectEdited));
            } else {
                const saveResource = new SaveProjectPictureResource(this._currentProjectId, project.picture);
                this._store.dispatch(new ProjectPictureActions.CreateOrUpdate.Project(saveResource, isProjectEdited));
            }
        }

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectRequestStatus()
                .pipe(
                    filter(requestStatus => requestStatus !== RequestStatusEnum.progress))
                .subscribe(() => this._handleSaveClickNavigation()));
    }

    /**
     * @description Triggered when project capture is cancelled
     */
    public onCancelEdit(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectInformationUrl(this._currentProjectId));
    }

    private _requestParticipants(): void {
        this._store.dispatch(new ProjectParticipantActions.Request.ActiveByRole([EmployeeRoleEnum.CSM]));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeActiveParticipantsByRole(EmployeeRoleEnum.CSM)
                .subscribe(this._setContacts.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProject()
                .pipe(
                    filter(project => !!project),
                    switchMap((project) => {
                        const getProjectPictureUrl = this._getProjectPictureUrl(project);

                        return zip(...[
                            of(project),
                            getProjectPictureUrl ? this._blobService.getBlob(getProjectPictureUrl) : of(null),
                        ]);
                    }))
                .subscribe(([project, projectPicture]) => {
                    this._setDefaultCaptureValues(project, projectPicture);
                })
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(id => this._currentProjectId = id)
        );

        this._disposableSubscriptions.add(
            this._projectSliceService.observeCurrentProjectRequestStatus()
                .subscribe(this._handleCaptureState.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.isRequesting = requestStatus === RequestStatusEnum.progress;
    }

    private _handleSaveClickNavigation(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectInformationUrl(this._currentProjectId));
    }

    private _setContacts(contacts: ProjectParticipantResource[]): void {
        this.contacts = contacts;
        this._areContactsSet = true;
        this._setIsLoading();
    }

    private _setIsLoading(): void {
        this.isLoading = !(this._isProjectSet && this._areContactsSet);
    }

    private _getProjectPictureUrl(currentProject: ProjectResource): string | null {
        const currentProjectPicture = currentProject._embedded.projectPicture;
        return currentProjectPicture && currentProjectPicture._links.hasOwnProperty('delete')
            ? currentProjectPicture._links.small.href : null;
    }

    private _setDefaultCaptureValues(project: ProjectResource, picture: any = null): void {
        const {title, start, end, address, client, description, projectNumber, category} = project;

        this.defaultCaptureValues = {
            picture: picture ? new Blob([picture], {type: picture.type}) : null,
            title,
            description: description ? description : null,
            projectNumber,
            start: moment(start),
            end: moment(end),
            client: client ? client : null,
            category: category ? category : null,
            address: {
                street: address.street,
                houseNumber: address.houseNumber,
                zipCode: address.zipCode,
                city: address.city,
            },
        };

        this._isProjectSet = true;
        this._setIsLoading();
    }
}
