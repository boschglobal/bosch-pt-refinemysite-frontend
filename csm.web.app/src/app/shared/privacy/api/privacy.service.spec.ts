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
import {CookieService} from 'ngx-cookie-service';

import {PrivacyService} from './privacy.service';
import {UserPrivacySettings} from './resources/user-privacy-settings.resource';

describe('Privacy Service', () => {
    let privacyService: PrivacyService;
    let cookieService: jasmine.SpyObj<CookieService>;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: CookieService,
                useValue: jasmine.createSpyObj('CookieService', ['get', 'set']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        privacyService = TestBed.inject(PrivacyService);
        cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    });

    it('should save UserPrivacySettings on cookies', () => {
        const privacySettings: UserPrivacySettings = {...new UserPrivacySettings(), performance: true};
        const privacySettingsString = JSON.stringify(privacySettings);
        const parserPrivacySettingsString = JSON.parse(privacySettingsString);

        cookieService.get.and.returnValue(btoa(privacySettingsString));

        privacyService.updatePrivacySettings(privacySettings)
            .subscribe((savedSettings) => {
            expect(savedSettings).toEqual(parserPrivacySettingsString);
        });
    });

    it('should fetch UserPrivacySettings from cookies', () => {
        const privacySettings: UserPrivacySettings = {...new UserPrivacySettings(), performance: true};
        const privacySettingsString = JSON.stringify(privacySettings);
        const parserPrivacySettingsString = JSON.parse(privacySettingsString);

        cookieService.get.and.returnValue(btoa(privacySettingsString));

        privacyService.findPrivacySettings()
            .subscribe((savedSettings) => {
            expect(savedSettings).toEqual(parserPrivacySettingsString);
        });
    });

    it('should throw error when fetching UserPrivacySettings from a malformed cookie', () => {
        const privacySettingsString = '{"malformed: "cookie}';

        cookieService.get.and.returnValue(privacySettingsString);

        privacyService.findPrivacySettings()
            .subscribe(() => {}, error =>
                expect(error).toBeTruthy()
            );
    });
});
