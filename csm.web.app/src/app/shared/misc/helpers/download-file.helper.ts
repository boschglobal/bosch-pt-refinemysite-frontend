/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Injectable,
    SecurityContext,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {SystemHelper} from './system.helper';

@Injectable({
    providedIn: 'root',
})
export class DownloadFileHelper {

    constructor(private _domSanitizer: DomSanitizer,
                private _systemHelper: SystemHelper) {
    }

    public downloadBlob(name: string, blob: Blob): void {
        const processedBlob = this._processBlob(blob);
        const url = this._domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(processedBlob));
        const sanitizedUrl = this._domSanitizer.sanitize(SecurityContext.URL, url);
        const anchor = document.createElement('a');

        anchor.href = sanitizedUrl;
        anchor.download = name;
        anchor.click();
    }

    private _processBlob(blob: Blob): Blob {
        return this._systemHelper.isRecentFirefox()
            ? blob.slice(0, blob.size, 'application/octet-stream')
            : blob;
    }
}
