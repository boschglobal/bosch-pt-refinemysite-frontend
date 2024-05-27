/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {TEST_USER_RESOURCE_REGISTERED} from '../test/mocks/user';
import {AppComponent} from './app.component';
import {MonitoringHelper} from './shared/monitoring/helpers/monitoring.helper';
import {LanguageEnum} from './shared/translation/helper/language.enum';
import {TranslateHelper} from './shared/translation/helper/translate.helper';
import {UserResource} from './user/api/resources/user.resource';
import {UserQueries} from './user/store/user/user.queries';
import {CountryEnum} from './user/user-common/enums/country.enum';

describe('App Component', () => {
    let fixture: ComponentFixture<AppComponent>;
    let translateHelper: jasmine.SpyObj<TranslateHelper>;
    let monitoringHelper: MonitoringHelper;

    const observeCurrentUserSubject = new Subject<UserResource>();
    const userQueriesMock: UserQueries = mock(UserQueries);

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: UserQueries,
                useValue: instance(userQueriesMock),
            },
            {
                provide: MonitoringHelper,
                useValue: jasmine.createSpyObj('MonitoringHelper', ['configLogCollection', 'configRealUserMonitoring']),
            },
            {
                provide: TranslateHelper,
                useValue: jasmine.createSpyObj('TranslateHelper', ['configLanguage']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        monitoringHelper = TestBed.inject(MonitoringHelper);
        translateHelper = TestBed.inject(TranslateHelper) as jasmine.SpyObj<TranslateHelper>;

        when(userQueriesMock.observeCurrentUser()).thenReturn(observeCurrentUserSubject);

        translateHelper.configLanguage.calls.reset();

        fixture.detectChanges();
    });

    it('should configure user language on component bootstrap', () => {
        const defaultLanguage = LanguageEnum.PT;
        const defaultCountry = CountryEnum.PT;
        const mockUser: UserResource = {
            ...TEST_USER_RESOURCE_REGISTERED,
            locale: defaultLanguage,
            country: defaultCountry,
        };
        const expectedCultureLanguage = `${defaultLanguage}-${defaultCountry}`;

        observeCurrentUserSubject.next(mockUser);

        expect(translateHelper.configLanguage).toHaveBeenCalledWith(defaultLanguage, expectedCultureLanguage);
    });

    it('should configure Log collection on component bootstrap', () => {
        expect(monitoringHelper.configLogCollection).toHaveBeenCalled();
    });

    it('should configure Real User Monitoring collection on component bootstrap', () => {
        expect(monitoringHelper.configLogCollection).toHaveBeenCalled();
    });
});
