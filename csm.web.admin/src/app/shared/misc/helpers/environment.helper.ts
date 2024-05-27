/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

export const PROD_SIGNATURE_REGEX = /app-admin.bosch-refinemysite.com/;

@Injectable({
    providedIn: 'root'
})
export class EnvironmentHelper {
    public isProduction(): boolean {
        return PROD_SIGNATURE_REGEX.test(location.host);
    }
}
