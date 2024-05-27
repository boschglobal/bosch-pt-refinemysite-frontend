/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {CalendarUserSettings} from '../../../project/project-common/api/calendar/resources/calendar-user-settings';
import {LocalStorageKeysEnum} from '../../misc/enums/local-storage-keys.enum';
import {LocalStorageService} from './local-storage.service';

describe('Local Storage Service', () => {
    let localStorageService: LocalStorageService;

    const lStorage = localStorage;

    const moduleDef: TestModuleMetadata = {};

    const articlesIds = ['1', '2'];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        localStorageService = TestBed.inject(LocalStorageService);
    });

    it('should save CalendarUserSettings to local storage', () => {
        const userSettings: CalendarUserSettings = new CalendarUserSettings();
        userSettings.showDayCardIndicators = true;

        const observableRes = localStorageService.updateCalendarUserSettings(userSettings);

        const res = JSON.parse(lStorage.getItem(LocalStorageKeysEnum.CalendarUserSettings));
        const settings = Object.assign(new CalendarUserSettings(), res);

        observableRes.subscribe((savedSettings) => {
            expect(savedSettings).toEqual(userSettings);
        });

        expect(settings).toEqual(userSettings);
    });

    it('should fetch CalendarUserSettings from local storage', () => {
        const userSettings: CalendarUserSettings = new CalendarUserSettings();
        userSettings.showDayCardIndicators = true;

        const res = localStorageService.findCalendarUserSettings();

        res.subscribe((savedSettings) => {
            expect(savedSettings).toEqual(userSettings);
        });
    });

    it('should save and fetch correct Whats New Articles ids Read from local storage', () => {
        localStorageService.updateWhatsNewReadArticles(articlesIds);

        expect(localStorageService.findWhatsNewReadArticles()).toEqual(articlesIds);
    });
});
