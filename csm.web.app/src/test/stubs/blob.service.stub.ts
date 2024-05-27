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

export class BlobServiceStub {
    public getBlobURL(): Observable<string> {
        return of('foo');
    }

    public getBlob(): Observable<Blob> {
        return of(new Blob());
    }
}
