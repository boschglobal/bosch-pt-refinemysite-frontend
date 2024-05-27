/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {AttachmentService} from '../attachments/attachment.service';
import {AttachmentResource} from '../attachments/resources/attachment.resource';
import {AttachmentListResource} from '../attachments/resources/attachment-list.resource';

@Injectable({
    providedIn: 'root',
})
export class TaskAttachmentService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _attachmentService: AttachmentService,
                private _httpClient: HttpClient) {
    }

    /**
     * @description Deletes an attachment from a Task
     * @param {string} attachmentId
     * @returns {Observable<{}>}
     */
    public delete(attachmentId: string): Observable<{}> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/attachments/${attachmentId}`)
            .build();

        return this._httpClient.delete(url);
    }

    /**
     * @description Retrieves all the attachments from a topic
     * @param {string} taskId
     * @param {boolean} includeChildren
     * @returns {Observable<AttachmentListResource>}
     */
    public getAll(taskId: string, includeChildren = true): Observable<AttachmentListResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/attachments`)
            .withQueryParam('includeChildren', includeChildren)
            .build();

        return this._httpClient.get<AttachmentListResource>(url);
    }

    /**
     * Upload a file for the task
     * @param {string} taskId
     * @param {File} file
     * @returns {Observable<AttachmentResource>}
     */
    public upload(taskId: string, file: File): Observable<AttachmentResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/${taskId}/attachments`)
            .build();

        return this._attachmentService.upload(url, file);
    }

}
