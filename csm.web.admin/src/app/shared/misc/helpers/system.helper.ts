/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {UAParser} from 'ua-parser-js';

@Injectable({
    providedIn: 'root',
})
export class SystemHelper {

    private _parser = new UAParser();

    public isMacOS(): boolean {
        return this._parser.getOS().name === 'Mac OS';
    }

    public isDeprecatedBrowser(): boolean {
        const browser = this._parser.getBrowser();
        const version = Number.parseInt(browser.version, 10);

        return browser.name === 'IE' || (browser.name === 'Edge' && version < 79);
    }
}

