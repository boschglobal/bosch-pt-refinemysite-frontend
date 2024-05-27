/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {LegalDocumentsActions} from '../../../user/store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../user/store/legal-documents/legal-documents.queries';
import {CountryEnum} from '../../../user/user-common/enums/country.enum';
import {LanguageEnum} from '../../translation/helper/language.enum';
import {TranslateHelper} from '../../translation/helper/translate.helper';
import {RequestStatusEnum} from '../enums/request-status.enum';
import {
    appInitializer,
    AppInitializerHelper,
} from './app-initializer.helper';

describe('App Initializer Helper', () => {
    let appInitializerHelper: AppInitializerHelper;
    let translateHelper: jasmine.SpyObj<TranslateHelper>;
    let store: jasmine.SpyObj<Store>;

    const currentLanguage = 'en-US';
    const legalDocumentsRequestStatusSubject = new Subject<RequestStatusEnum>();

    const translateServiceMock: TranslateService = mock(TranslateService);
    const legalDocumentsQueriesMock: LegalDocumentsQueries = mock(LegalDocumentsQueries);

    const moduleDef: TestModuleMetadata = {
        providers: [
            AppInitializerHelper,
            {
                provide: LegalDocumentsQueries,
                useValue: instance(legalDocumentsQueriesMock),
            },
            {
                provide: TranslateService,
                useValue: instance(translateServiceMock),
            },
            {
                provide: TranslateHelper,
                useValue: jasmine.createSpyObj('TranslateHelper', ['configLanguage']),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        appInitializerHelper = TestBed.inject(AppInitializerHelper);
        translateHelper = TestBed.inject(TranslateHelper) as jasmine.SpyObj<TranslateHelper>;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(translateServiceMock.currentLang).thenReturn(currentLanguage);
        when(legalDocumentsQueriesMock.observeLegalDocumentsRequestStatus()).thenReturn(legalDocumentsRequestStatusSubject);

    });

    it('should configure browser language on app initialization', () => {
        const expectedDefaultLanguage = 'en';
        const expectedCultureLanguage = 'en-US';

        when(translateServiceMock.getBrowserLang()).thenReturn(expectedDefaultLanguage);
        when(translateServiceMock.getBrowserCultureLang()).thenReturn(expectedCultureLanguage);

        appInitializerHelper.init();

        expect(translateHelper.configLanguage).toHaveBeenCalledWith(expectedDefaultLanguage, expectedCultureLanguage);
    });

    it('should request the legal documents on app initialization', () => {
        const cultureLanguage = 'pt-PT';
        const country = CountryEnum.PT;
        const language = LanguageEnum.PT;
        const expectedAction = new LegalDocumentsActions.Request.UnregisteredAll(country, language);

        when(translateServiceMock.currentLang).thenReturn(cultureLanguage);

        appInitializerHelper.init();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should complete the initialization when the legal documents request succeeds', () => {
        let result = false;

        appInitializerHelper.init().subscribe(() => result = true);

        legalDocumentsRequestStatusSubject.next(RequestStatusEnum.success);

        expect(result).toBeTruthy();
    });

    it('should complete the initialization when the legal documents request fails', () => {
        let result = false;

        appInitializerHelper.init().subscribe(() => result = true);

        legalDocumentsRequestStatusSubject.next(RequestStatusEnum.error);

        expect(result).toBeTruthy();
    });

    it('should not complete the initialization before the legal documents request succeeds or fails', () => {
        let result = false;

        appInitializerHelper.init().subscribe(() => result = true);

        legalDocumentsRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(result).toBeFalsy();
    });

    it('should call AppInitializerHelper.init when appInitializer function is called', () => {
        spyOn(appInitializerHelper, 'init');

        appInitializer(appInitializerHelper)();

        expect(appInitializerHelper.init).toHaveBeenCalled();
    });
});
