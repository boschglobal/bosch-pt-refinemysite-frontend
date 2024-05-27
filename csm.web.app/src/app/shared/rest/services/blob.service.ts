/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {unionBy} from 'lodash';
import {
    Observable,
    of,
    Subject,
    throwError
} from 'rxjs';
import {
    catchError,
    filter,
    map,
    mergeMap,
    retryWhen,
    take
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';
import {
    API_VERSION_REGEX,
    UUID_REGEX
} from '../../misc/constants/regular-expression.constant';
import {ObjectTypeEnum} from '../../misc/enums/object-type.enum';
import {RealtimeService} from '../../realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../realtime/enums/event-type.enum';

const OBJECT_TYPE_MATCHERS: { pattern: string, objectType: ObjectTypeEnum }[] = [
    {
        pattern: `/${API_VERSION_REGEX}/projects/tasks/attachments/(${UUID_REGEX})/`,
        objectType: ObjectTypeEnum.TaskAttachment,
    },
    {
        pattern: `/${API_VERSION_REGEX}/projects/tasks/topics/attachments/(${UUID_REGEX})/`,
        objectType: ObjectTypeEnum.TopicAttachment,
    },
    {
        pattern: `/${API_VERSION_REGEX}/projects/tasks/topics/messages/attachments/(${UUID_REGEX})/`,
        objectType: ObjectTypeEnum.MessageAttachment,
    },
    {
        pattern: `/${API_VERSION_REGEX}/projects/${UUID_REGEX}/picture/(${UUID_REGEX})/`,
        objectType: ObjectTypeEnum.ProjectPicture,
    },
    {
        pattern: `/${API_VERSION_REGEX}/users/${UUID_REGEX}/picture/(${UUID_REGEX})/`,
        objectType: ObjectTypeEnum.UserPicture,
    },
];

@Injectable({
    providedIn: 'root',
})
export class BlobService {

    private _cachedBlobs: CachedBlob[] = [];

    constructor(private _httpClient: HttpClient,
                private _realtimeService: RealtimeService) {
    }

    /**
     * @description Deletes url from blob cache
     * @param {string} url
     */
    public deleteCachedBlob(url: string): void {
        this._cachedBlobs = this._cachedBlobs
            .filter((cachedBlob: CachedBlob) => cachedBlob.url !== url);
    }

    /**
     * @description Retrieves Observable of blob
     * @param {string} url
     * @returns {Observable<any>}
     */
    public getBlob(url: string): Observable<any> {
        const requestOptions: Object = BlobService._getRequestOptions();

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
        const requestOptions = BlobService._getRequestOptions();
        let cachedBlob: CachedBlob;

        cachedBlob = this._getCachedBlob(url);

        if (!cachedBlob) {
            cachedBlob = this._storeCachedBlob(url);
            this._httpClient
                .get(url, requestOptions)
                .pipe(
                    retryWhen(errors => this._getBlobUpdateEvent(url, errors)),
                    map((response) => this._handleSuccess(response, url)),
                    catchError(() => this._handleError(url)),
                )
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
            blobSubject: of(blobUrl),
        };

        this._storeCachedBlob(url, cachedBlob);

        return blobUrl;
    }

    private _handleError(url?: string): Observable<any> {
        this.deleteCachedBlob(url);
        return of(null);
    }

    private _getBlobUpdateEvent(url: string, errors: Observable<Error>): Observable<RealtimeEventUpdateDataResource> {
        const objectIdentifierPair = this._getObjectIdentifierPairByUrl(url);

        return errors.pipe(
            mergeMap((error, index) => {
                if (index < 2) {
                    return this._realtimeService.getUpdateEvents()
                        .pipe(
                            filter(data =>
                                data.event === EventTypeEnum.Updated
                                && objectIdentifierPair.isSame(data.object)
                            ),
                            take(1),
                        );
                } else {
                    return throwError(`Max retries reached: ${error}`);
                }
            })
        );
    }

    private _getObjectIdentifierPairByUrl(url: string): ObjectIdentifierPair {
        const match = OBJECT_TYPE_MATCHERS.find(({pattern}) => !!url.match(pattern));

        return new ObjectIdentifierPair(
            match?.objectType,
            url.match(match.pattern)[1],
        );
    }

    private _getCachedBlob(url: string): CachedBlob {
        return this._cachedBlobs
            .find((cachedBlob: CachedBlob) => cachedBlob.url === url);
    }

    private _storeCachedBlob(url: string, cachedBlob?: CachedBlob): CachedBlob {
        const cachedBlobToStore: CachedBlob = cachedBlob || BlobService._generateCachedBlob(url);
        this._cachedBlobs = unionBy([cachedBlobToStore], this._cachedBlobs, 'url');

        return cachedBlobToStore;
    }

    private static _generateCachedBlob(url: string): CachedBlob {
        const blobSubject: Subject<string> = new Subject();

        return {
            url,
            blobSubject,
        };
    }

    private static _getRequestOptions(): Object {
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
