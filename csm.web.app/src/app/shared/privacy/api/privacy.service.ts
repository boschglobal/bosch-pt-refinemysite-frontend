/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {CookieService} from 'ngx-cookie-service';
import {CookieOptions} from 'ngx-cookie-service/lib/cookie.service';
import {
    Observable,
    of,
    throwError
} from 'rxjs';

import {CookieNameEnum} from '../../cookie/enums/cookie-name.enum';
import {UserPrivacySettings} from './resources/user-privacy-settings.resource';

@Injectable({
    providedIn: 'root',
})
export class PrivacyService {

    constructor(private _cookieService: CookieService) {
    }

    public findPrivacySettings(): Observable<UserPrivacySettings> {
        try {
            return of(JSON.parse(atob(this._cookieService.get(CookieNameEnum.UserPrivacySettings))));
        } catch (error) {
            return throwError(error);
        }
    }

    public updatePrivacySettings(value: UserPrivacySettings): Observable<UserPrivacySettings> {
        const options: CookieOptions = {
            expires: moment().add(1, 'y').toDate(),
            path: '/',
        };

        this._cookieService.set(CookieNameEnum.UserPrivacySettings, btoa(JSON.stringify(value)), options);

        return this.findPrivacySettings();
    }
}
