/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Observable,
    of
} from 'rxjs';

export class BlobServiceMock {

    /**
     *  @description mock to provide an empty blob
     */
    public getBlob(url: string): Observable<Blob> {
        const blob: Blob = new Blob();
        return of(blob);
    }

    /**
     *  @description mock to provide an empty blob url
     */
    public getBlobURL(url: string): Observable<string> {
        const blobUrl = '';
        return of(blobUrl);
    }
}
