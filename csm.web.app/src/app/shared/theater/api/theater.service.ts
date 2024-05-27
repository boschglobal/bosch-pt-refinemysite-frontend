/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import {AttachmentResource} from '../../../project/project-common/api/attachments/resources/attachment.resource';

@Injectable({
    providedIn: 'root',
})
export class TheaterService {

    private _attachments: AttachmentResource[] = [];

    private _currentAttachmentId: string;

    /**
     * @description Retrieves list of attachments to be displayed
     * @returns {AttachmentResource[]}
     */
    public get attachments() { return this._attachments; }

    /**
     * @description Retrieves current attachment id
     * @returns {string}
     */
    public get currentAttachmentId() { return this._currentAttachmentId; }

    constructor(private _router: Router) {
    }

    /**
     * @description Sets the attachment list and current attachment and opens the theater
     * @param attachments
     * @param currentAttachmentId
     */
    public open(attachments: AttachmentResource[], currentAttachmentId: string): void {
        this._attachments = attachments;
        this._currentAttachmentId = currentAttachmentId;
        this._router.navigate([{outlets: {theater: 'theater'}}], {
            replaceUrl: true,
            queryParamsHandling: 'merge',
        });
    }

    /**
     * @description Clears the attachments and closes the theater
     */
    public close(): void {
        this._attachments = [];
        this._currentAttachmentId = null;
        this._router.navigate([{outlets: {theater: null}}], {
            replaceUrl: true,
            queryParamsHandling: 'merge',
        });
    }
}
