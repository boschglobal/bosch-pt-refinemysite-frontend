/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Base64Helper {
    /**
     * @description Encodes the value string as Base64URL
     *              This will replace the "+", "/" and "=" padding, making it URL safe
     * @param value
     */
    public encodeBase64Url(value: string): string {
        return btoa(value)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}
