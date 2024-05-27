/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {AttachmentService} from '../attachments/attachment.service';
import {AttachmentResource} from '../attachments/resources/attachment.resource';

@Injectable({
    providedIn: 'root',
})
export class TopicAttachmentService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _attachmentService: AttachmentService) {
    }

    /**
     * Upload a file for the task
     * @param {string} topicId
     * @param {File} file
     * @returns {Observable<AttachmentResource>}
     */
    public upload(topicId: string, file: File): Observable<AttachmentResource> {
        const url = this._apiUrlHelper
            .withPath(`projects/tasks/topics/${topicId}/attachments`)
            .build();

        return this._attachmentService.upload(url, file);
    }
}
