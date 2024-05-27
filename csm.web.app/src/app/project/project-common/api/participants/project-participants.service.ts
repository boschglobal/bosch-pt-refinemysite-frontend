/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClient,
    HttpHeaders
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {ProjectParticipantFiltersResource} from '../../store/participants/slice/project-participant-filters-resource';
import {ProjectParticipantResource} from './resources/project-participant.resource';
import {ProjectParticipantListResource} from './resources/project-participant-list.resource';
import {SaveProjectParticipantResource} from './resources/save-project-participant.resource';

const PARTICIPANTS_SORT_FIELDS: Object = {
    company: 'company.displayName,status,user.firstName,user.lastName',
    user: 'status,user.firstName,user.lastName,email',
    role: 'role,status,email',
    email: 'email',
};

@Injectable({
    providedIn: 'root',
})
export class ProjectParticipantsService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Deletes a participant from a project
     * @param {string} participantId
     * @returns {Observable<{}>}
     */
    public delete(participantId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/participants/${participantId}`)
            .build();

        return this._httpClient.delete(url);
    }

    /**
     * @description Updates a participant from a project
     * @param {string} participantId
     * @param {SaveProjectParticipantResource} payload
     * @param {number} version
     * @returns {Observable<ProjectParticipantResource>}
     */
    public update(participantId: string, payload: SaveProjectParticipantResource, version: number): Observable<ProjectParticipantResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/participants/${participantId}`)
            .build();
        const body: string = JSON.stringify(payload);
        const headers: HttpHeaders = new HttpHeaders()
            .append('If-Match', version.toString());

        return this._httpClient.put<ProjectParticipantResource>(url, body, {headers});
    }

    /**
     * @description Invite participant to a determined project
     * @param {string} email
     * @param {string} role
     * @param {string} projectId
     * @returns {Observable<ProjectParticipantResource>}
     */
    public invite(email: string, role: string, projectId: string): Observable<ProjectParticipantResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/participants`)
            .build();
        const body: string = JSON.stringify({email, role});

        return this._httpClient.post<ProjectParticipantResource>(url, body);
    }

    /**
     * @description Retrieve all the participants of a determined project
     * @param {string} projectId
     * @param {string} field
     * @param {string} direction
     * @param {number} pageNumber
     * @param {number} size
     * @param {ProjectParticipantFiltersResource} filters
     * @returns {Observable<ProjectParticipantListResource>}
     */
    public findAll(projectId: string, field: string, direction: string,
                   pageNumber = 0, size = 100, filters?: ProjectParticipantFiltersResource): Observable<ProjectParticipantListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/participants/search`)
            .withPagination(size, pageNumber)
            .withSort(PARTICIPANTS_SORT_FIELDS[field], direction)
            .build();

        const body = {projectId, ...filters};

        return this._httpClient.post<ProjectParticipantListResource>(url, body);
    }

    /**
     * @description Retrieve all the participants of a specific company and project
     * @param {string} projectId
     * @param {string} companyId
     * @param {string} field
     * @param {string} direction
     * @param {number} pageNumber
     * @param {number} size
     * @returns {Observable<ProjectParticipantListResource>}
     */
    public findAllByCompany(projectId: string, companyId: string, field: string,
                            direction: string, pageNumber = 0, size = 500): Observable<ProjectParticipantListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/participants/assignable`)
            .withQueryParam('company', companyId)
            .withPagination(size, pageNumber)
            .withSort(PARTICIPANTS_SORT_FIELDS[field], direction)
            .build();

        return this._httpClient.get<ProjectParticipantListResource>(url);
    }

    /**
     * @description Find a single participant
     * @param {string} participantId
     * @returns {Observable<ProjectParticipantResource>}
     */
    public findOne(participantId: string): Observable<ProjectParticipantResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/participants/${participantId}`)
            .build();

        return this._httpClient.get<ProjectParticipantResource>(url);
    }

    /**
     * @description Resend participant invitation
     * @param {string} participantId
     * @returns {Observable<{}>}
     */
    public resendInvitation(participantId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/participants/${participantId}/resend`)
            .build();

        return this._httpClient.post<{}>(url, null);
    }
}
