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
import {TranslateService} from '@ngx-translate/core';
import {DefaultLangChangeEvent} from '@ngx-translate/core/lib/translate.service';
import * as moment from 'moment';
import {LocaleSpecification} from 'moment';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {WeekDaysEnum} from '../../../shared/misc/enums/weekDays.enum';
import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {DateHelper} from '../../../shared/ui/dates/date.helper.service';
import {
    PROJECT_MOMENT_LOCALES,
    ProjectDateLocaleHelper
} from './project-date-locale.helper.service';

describe('Project Date Locale Helper', () => {
    let projectDateLocaleHelper: ProjectDateLocaleHelper;
    let translateService: TranslateService;

    let momentLocaleSpy: jasmine.Spy;
    let momentDefineLocaleSpy: jasmine.Spy;
    let momentUpdateLocaleSpy: jasmine.Spy;
    let getProjectLocaleSpy: jasmine.Spy;

    const initialMomentLocale = moment.locale();
    const referenceParentLocaleMock = LanguageEnum.PT;
    const projectMomentLocaleMock = PROJECT_MOMENT_LOCALES[referenceParentLocaleMock];

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectDateLocaleHelper,
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeAll(() => {
        moment.defineLocale(projectMomentLocaleMock, {parentLocale: referenceParentLocaleMock});

        momentLocaleSpy = spyOn(moment, 'locale').and.callFake(() => initialMomentLocale);
        momentUpdateLocaleSpy = spyOn(moment, 'updateLocale').and.callFake(() => null);
        momentDefineLocaleSpy = spyOn(moment, 'defineLocale').and.callFake(() => null);
    });

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        projectDateLocaleHelper = TestBed.inject(ProjectDateLocaleHelper);
        translateService = TestBed.inject(TranslateService);

        getProjectLocaleSpy = spyOn(projectDateLocaleHelper, 'getProjectLocale').and.returnValue(projectMomentLocaleMock);
    });

    afterEach(() => {
        momentLocaleSpy.calls.reset();
        momentUpdateLocaleSpy.calls.reset();
        momentDefineLocaleSpy.calls.reset();
    });

    afterAll(() => {
        momentLocaleSpy.and.callThrough();
        momentUpdateLocaleSpy.and.callThrough();
        momentDefineLocaleSpy.and.callThrough();

        moment.locale(projectMomentLocaleMock, null);
        moment.locale(initialMomentLocale);
    });

    it('should return moment in the current default moment locale lang', () => {
        expect(projectDateLocaleHelper.getMomentByLang().locale()).toBe(initialMomentLocale);
    });

    it('should return moment in the current lang when language changes', () => {
        const newLocale = LanguageEnum.ES;
        const langChangeEvent: DefaultLangChangeEvent = {lang: newLocale, translations: null};

        expect(projectDateLocaleHelper.getMomentByLang().locale()).toBe(initialMomentLocale);

        momentDefineLocaleSpy.and.callThrough();

        translateService.onDefaultLangChange.next(langChangeEvent);

        expect(projectDateLocaleHelper.getMomentByLang().locale()).toBe(newLocale);
    });

    it('should return project moment locale', () => {
        const projectLocale = projectDateLocaleHelper.getProjectLocale();

        expect(projectLocale).toBe(projectMomentLocaleMock);
    });

    it('should return current lang', () => {
        const currentLang = projectDateLocaleHelper.getCurrentLang();

        expect(currentLang).toBe(initialMomentLocale);
    });

    it('should set a new project moment locale when language changes and return moment in the current lang', () => {
        const newLocale = LanguageEnum.ES;
        const expectedLocale = PROJECT_MOMENT_LOCALES[newLocale];
        const langChangeEvent: DefaultLangChangeEvent = {lang: newLocale, translations: null};

        getProjectLocaleSpy.and.callThrough();

        expect(projectDateLocaleHelper.getProjectLocale()).toBe(PROJECT_MOMENT_LOCALES[initialMomentLocale]);

        translateService.onDefaultLangChange.next(langChangeEvent);

        expect(projectDateLocaleHelper.getProjectLocale()).toBe(expectedLocale);
    });

    it('should set moment project locale first day of week', () => {
        const firstDayOfWeek = WeekDaysEnum.FRIDAY;
        const weekDayNumber = DateHelper.getWeekDayMomentNumber(firstDayOfWeek);
        const expectedLocaleSpecification: LocaleSpecification = {
            week: {
                dow: weekDayNumber,
                doy: weekDayNumber,
            },
        };

        projectDateLocaleHelper.configProjectMomentLocaleFirstDayOfWeek(firstDayOfWeek);

        expect(moment.updateLocale).toHaveBeenCalledWith(projectMomentLocaleMock, expectedLocaleSpecification);
    });

    it('should reset moment to the initial locale after configuring a project moment locale when language changes', () => {
        const langChangeEvent: DefaultLangChangeEvent = {lang: LanguageEnum.PT, translations: null};

        translateService.onDefaultLangChange.next(langChangeEvent);

        expect(moment.locale).toHaveBeenCalledWith(initialMomentLocale);
    });

    it('should reset moment to the initial locale after configuring a project moment locale first day of week', () => {
        const firstDayOfWeek = WeekDaysEnum.FRIDAY;

        projectDateLocaleHelper.configProjectMomentLocaleFirstDayOfWeek(firstDayOfWeek);

        expect(moment.locale).toHaveBeenCalledWith(initialMomentLocale);
    });
});
