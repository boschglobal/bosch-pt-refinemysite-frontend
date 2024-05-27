/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {languageEnumHelper} from './language.enum';

export class BrowserLanguage {

    private _shortBrowserLanguage: string;

    constructor() {
        this._getBrowserLanguage();
    }

    /**
     * Retrieve the first part from the browser language string
     *
     * @returns Short browser language string
     */
    public getShortBrowserLanguage() {
        return this._shortBrowserLanguage;
    }

    private _getBrowserLanguage() {
        const shortBrowserLanguage = navigator.language.split('-')[0];
        this._shortBrowserLanguage = languageEnumHelper.getValues().includes(shortBrowserLanguage) ? shortBrowserLanguage : 'en';
    }

}
