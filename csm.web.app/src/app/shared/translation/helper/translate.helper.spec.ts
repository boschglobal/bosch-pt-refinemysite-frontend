/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';

import {CultureLanguageEnum} from './culture-language.enum';
import {CultureLanguageFallbackEnum} from './culture-language-fallback.enum';
import {LanguageEnum} from './language.enum';
import {TranslateHelper} from './translate.helper';

describe('Translate Helper', () => {
    let translateHelper: TranslateHelper;
    let translateService: TranslateService;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: TranslateService,
                useValue: jasmine.createSpyObj('TranslateService', ['setDefaultLang', 'use']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
        translateService = TestBed.inject(TranslateService);
        translateHelper = TestBed.inject(TranslateHelper);
    }));

    it('should configure the app language based on the provided language and culture language', () => {
        const expectedLanguage = LanguageEnum.ES;
        const expectedCultureLanguage = 'es-US';

        translateHelper.configLanguage(expectedLanguage, expectedCultureLanguage);

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(expectedLanguage);
        expect(translateService.use).toHaveBeenCalledWith(expectedCultureLanguage);
    });

    it('should default to English when the language is not supported', () => {
        const expectedValue = LanguageEnum.EN;
        const unsupportedLanguage = 'af';

        translateHelper.configLanguage(unsupportedLanguage, '');

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(expectedValue);
    });

    it('should default to fallback culture language based on the country when culture language is not supported', () => {
        const language = LanguageEnum.PT;
        const fakeCultureLanguage = 'pt-CA';
        const expectedCultureLanguage = CultureLanguageEnum.enCA;

        translateHelper.configLanguage(language, fakeCultureLanguage);

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(language);
        expect(translateService.use).toHaveBeenCalledWith(expectedCultureLanguage);
    });

    it('should default to fallback culture language when culture language based on the country is not supported', () => {
        const language = LanguageEnum.EN;
        const fakeCultureLanguage = 'en-PT';
        const expectedCultureLanguage = CultureLanguageFallbackEnum[language];

        translateHelper.configLanguage(language, fakeCultureLanguage);

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(language);
        expect(translateService.use).toHaveBeenCalledWith(expectedCultureLanguage);
    });

    it('should normalize culture language when _ is used instead of -', () => {
        const language = 'en';
        const cultureLanguage = 'en_US';
        const expectedCultureLanguage = 'en-US';

        translateHelper.configLanguage(language, cultureLanguage);

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(language);
        expect(translateService.use).toHaveBeenCalledWith(expectedCultureLanguage);
    });

    it('should normalize culture language when country suffix is in lower-case', () => {
        const language = 'en';
        const cultureLanguage = 'en-us';
        const expectedCultureLanguage = 'en-US';

        translateHelper.configLanguage(language, cultureLanguage);

        expect(translateService.setDefaultLang).toHaveBeenCalledWith(language);
        expect(translateService.use).toHaveBeenCalledWith(expectedCultureLanguage);
    });
});
