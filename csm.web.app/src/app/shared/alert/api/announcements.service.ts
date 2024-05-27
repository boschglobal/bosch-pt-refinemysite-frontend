/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as moment from 'moment/moment';
import {CookieService} from 'ngx-cookie-service';
import {CookieOptions} from 'ngx-cookie-service/lib/cookie.service';
import {
    Observable,
    of,
    throwError,
} from 'rxjs';
import {map} from 'rxjs/operators';

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {CookieNameEnum} from '../../cookie/enums/cookie-name.enum';
import {ApiUrlHelper} from '../../rest/helpers/api-url.helper';
import {AlertTypeEnum} from '../enums/alert-type.enum';
import {AnnouncementListResource} from './resources/announcement-list.resource';

@Injectable({
    providedIn: 'root',
})
export class AnnouncementsService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Announcement);

    constructor(private _cookiesService: CookieService,
                private _httpClient: HttpClient) {
    }

    public findAll(): Observable<AnnouncementListResource> {
        const url = this._apiUrlHelper
            .withPath('announcements')
            .build();

        return this._httpClient.get<AnnouncementListResource>(url)
            .pipe(
                map(announcementList => {
                    announcementList.items.forEach(announcement => announcement.type = announcement.type.toLowerCase() as AlertTypeEnum);
                    return announcementList;
                })
            );
    }

    public getReadAnnouncements(): Observable<string[]> {
        try {
            return of(JSON.parse(atob(this._cookiesService.get(CookieNameEnum.ReadAnnouncements))));
        } catch (error) {
            return throwError(error);
        }
    }

    public setAnnouncementsHasRead(ids: string[]): Observable<string[]> {
        const expireAnnouncement: CookieOptions = {
            expires: moment().startOf('day').add(1, 'month').toDate(),
            path: '/',
        };

        this._cookiesService.set(CookieNameEnum.ReadAnnouncements, btoa(JSON.stringify(ids)), expireAnnouncement);

        return this.getReadAnnouncements();
    }
}
