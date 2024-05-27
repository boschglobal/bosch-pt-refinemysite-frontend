/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    map,
    catchError
} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {unionBy} from 'lodash';
import {
    Observable,
    of,
    Subject
} from 'rxjs';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class BlobService {

    private _cachedBlobs: CachedBlob[] = [];

    constructor(private _httpClient: HttpClient) {
    }

    /**
     * @description Retrieves Observable of blob
     * @param {string} url
     * @returns {Observable<any>}
     */
    public getBlob(url: string): Observable<any> {
        const requestOptions: Object = this._getRequestOptions();

        return this._httpClient
            .get(url, requestOptions)
            .pipe(
                catchError(() => this._handleError()));
    }

    /**
     * @description Retrieves Observable of blob url
     * @param {string} url
     * @returns {Observable<string>}
     */
    public getBlobURL(url: string): Observable<string> {
        const requestOptions = this._getRequestOptions();
        let cachedBlob: CachedBlob;

        cachedBlob = this._getCachedBlob(url);

        if (!cachedBlob) {
            cachedBlob = this._storeCachedBlob(url);
            this._httpClient
                .get(url, requestOptions)
                .pipe(
                    map((response) => this._handleSuccess(response, url)),
                    catchError(() => this._handleError(url)))
                .subscribe((blobUrl: string) => {
                    const blobSubject = cachedBlob.blobSubject as Subject<string>;
                    blobSubject.next(blobUrl);
                });
        }

        return cachedBlob.blobSubject;
    }

    private _handleSuccess(response: any, url: string): string {
        const blobUrl: string = URL.createObjectURL(response);
        const cachedBlob: CachedBlob = {
            url,
            blobSubject: of(blobUrl)
        };

        this._storeCachedBlob(url, cachedBlob);

        return blobUrl;
    }

    private _handleError(url?: string): Observable<any> {
        this._deleteCachedBlob(url);
        return of(null);
    }

    private _getCachedBlob(url: string): CachedBlob {
        return this._cachedBlobs
            .find((cachedBlob: CachedBlob) => cachedBlob.url === url);
    }

    private _storeCachedBlob(url: string, cachedBlob?: CachedBlob): CachedBlob {
        const cachedBlobToStore: CachedBlob = cachedBlob || this._generateCachedBlob(url);
        this._cachedBlobs = unionBy([cachedBlobToStore], this._cachedBlobs, 'url');

        return cachedBlobToStore;
    }

    private _deleteCachedBlob(url: string): void {
        this._cachedBlobs = this._cachedBlobs
            .filter((cachedBlob: CachedBlob) => cachedBlob.url === url);
    }

    private _generateCachedBlob(url: string): CachedBlob {
        const blobSubject: Subject<string> = new Subject();

        return {
            url,
            blobSubject,
        };
    }

    private _getRequestOptions(): Object {
        const responseType = 'blob';

        return {
            responseType,
        };
    }
}

interface CachedBlob {
    url: string;
    blobSubject: Subject<string> | Observable<string>;
}
