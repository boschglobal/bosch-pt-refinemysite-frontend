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

import {AttachmentResource} from './resources/attachment.resource';

@Injectable({
    providedIn: 'root',
})
export class AttachmentService {

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Upload single file to given URL
     * @param {string} url
     * @param {File} file
     * @returns {Observable<AttachmentResource>}
     */
    public upload(url: string, file: File): Observable<AttachmentResource> {
        const zoneOffset = (new Date().getTimezoneOffset() / 60);
        const zoneOffsetString = zoneOffset >= 0 ? `+${zoneOffset}` : zoneOffset.toString();
        const data = new FormData();
        data.append('file', file);
        data.append('zoneOffset', zoneOffsetString);

        return this._httpClient.post<AttachmentResource>(url, data);
    }
}
