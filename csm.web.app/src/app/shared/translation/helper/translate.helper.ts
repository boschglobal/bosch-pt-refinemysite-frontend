/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {CultureLanguageEnumHelper} from './culture-language.enum';
import {CultureLanguageFallbackEnum} from './culture-language-fallback.enum';
import {
    LanguageEnum,
    LanguageEnumHelper,
} from './language.enum';

@Injectable({
    providedIn: 'root',
})
export class TranslateHelper {

    constructor(private _translateService: TranslateService) {
    }

    public configLanguage(language: LanguageEnum | string, cultureLanguage: string): void {
        const parsedLanguage = this._parseLanguage(language);
        const parsedCultureLanguage = this._parseCultureLanguage(cultureLanguage, parsedLanguage);

        this._translateService.setDefaultLang(parsedLanguage);
        this._translateService.use(parsedCultureLanguage);
    }

    private _normalizeCultureLanguage(cultureLanguage: string): string {
        const cultureLanguageParts = cultureLanguage
            .replace('_', '-')
            .split('-');
        const hasCountrySuffix = cultureLanguageParts.length === 2;

        return hasCountrySuffix ? [cultureLanguageParts[0], cultureLanguageParts[1].toUpperCase()].join('-') : cultureLanguage;
    }

    private _parseCultureLanguage(cultureLanguage: string, parsedLanguage: string): string {
        const normalizedCultureLanguage = this._normalizeCultureLanguage(cultureLanguage);
        const fallbackCultureLanguage = CultureLanguageEnumHelper.getValues()
            .find(value => this._getCultureLanguageCountry(value) === this._getCultureLanguageCountry(normalizedCultureLanguage))
            || CultureLanguageFallbackEnum[parsedLanguage];
        const isCultureLanguageSupported = CultureLanguageEnumHelper.getValues().includes(normalizedCultureLanguage);

        return isCultureLanguageSupported ? normalizedCultureLanguage : fallbackCultureLanguage;
    }

    private _parseLanguage(language: string): string {
        return LanguageEnumHelper.getValues().includes(language) ? language : LanguageEnum.EN;
    }

    private _getCultureLanguageCountry(cultureLanguage: string): string {
        return cultureLanguage.split('-')[1];
    }
}
