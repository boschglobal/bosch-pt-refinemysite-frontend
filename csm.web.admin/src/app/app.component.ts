/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {BrowserLanguage} from './shared/translation/helper/browser-language-scanner.helper';

@Component({
    selector: 'ss-app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public currentUserLanguage = '';

    constructor(private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._configUserLanguage();
    }

    private _configUserLanguage(): void {
        const languageHelper = new BrowserLanguage();

        this.currentUserLanguage = languageHelper.getShortBrowserLanguage();
        this._setDefaultTranslation(this.currentUserLanguage);
    }

    private _setDefaultTranslation(language: string): void {
        this._translateService.setDefaultLang(language);
        this._translateService.use(language);
    }
}
