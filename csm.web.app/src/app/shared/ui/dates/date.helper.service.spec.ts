/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Moment} from 'moment';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {WeekDaysEnum} from '../../misc/enums/weekDays.enum';
import {LanguageEnum} from '../../translation/helper/language.enum';
import {
    DateFormatEnum,
    DateHelper,
    DateTimeUnitPair,
    DateUnitsEnum,
} from './date.helper.service';

describe('Date Helper Service', () => {
    let dateHelperService: DateHelper;
    let translateService: TranslateService;
    let referenceDate: Moment;

    const defaultTimeAmount = 1;
    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            DateHelper,
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        translateService = TestBed.inject(TranslateService);
        dateHelperService = new DateHelper(translateService);
        referenceDate = moment();
    });

    it('should be created', () => {
        expect(dateHelperService).toBeTruthy();
    });

    it('should return observable with an output of a formatted relative date in XS', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Second).toISOString();
        const format = DateFormatEnum.Xs;
        const expectedResult = 'Generic_DateRelativeXs';

        dateHelperService.observeDate(date, format)
            .subscribe(formattedDate => {
                expect(formattedDate).toEqual(expectedResult);
            }).unsubscribe();
    });

    it('should call getFormattedDate when language changes', () => {
        let times = 0;
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Second).toISOString();
        const format = DateFormatEnum.Xs;

        dateHelperService.observeDate(date, format)
            .subscribe(() => times++);

        translateService.setDefaultLang(LanguageEnum.DE);

        expect(times).toBe(2);
    });

    it('should format relative date in XS format', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Minute).toISOString();
        const format = DateFormatEnum.Xs;
        const expectedResult = `Generic_DateRelativeXs`;

        expect(dateHelperService.getFormattedDate(date, format)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 second ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Second).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Minute};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 minute ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Minute).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Minute};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 hour ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Hour).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Hour};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 day ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Day).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Day};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 week ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Week).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Week};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should retrieve time and unit pair from relative date 1 year ago', () => {
        const date = referenceDate.clone().subtract(defaultTimeAmount, DateUnitsEnum.Year).toISOString();
        const expectedResult: DateTimeUnitPair = {time: defaultTimeAmount, unit: DateUnitsEnum.Year};

        expect(dateHelperService.getRelativeDateByTimeUnitPairFromPast(date)).toEqual(expectedResult);
    });

    it('should return false when isSameDay is called with null and a date', () => {
        const a = null;
        const b = moment();

        expect(DateHelper.isSameDay(a, b)).toBeFalsy();
    });

    it('should return false when isSameDay is called with two dates in different days', () => {
        const a = moment();
        const b = moment().add(1, 'd');

        expect(DateHelper.isSameDay(a, b)).toBeFalsy();
    });

    it('should return true when isSameDay is called with the two dates as null', () => {
        const a = null;
        const b = null;

        expect(DateHelper.isSameDay(a, b)).toBeTruthy();
    });

    it('should return true when isSameDay is called with two dates in the same day', () => {
        const a = moment().add(1, 'w');
        const b = moment().add(1, 'w');

        expect(DateHelper.isSameDay(a, b)).toBeTruthy();
    });

    it('should return correct moment week number for every week day', () => {
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.SUNDAY)).toBe(0);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.MONDAY)).toBe(1);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.TUESDAY)).toBe(2);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.WEDNESDAY)).toBe(3);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.THURSDAY)).toBe(4);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.FRIDAY)).toBe(5);
        expect(DateHelper.getWeekDayMomentNumber(WeekDaysEnum.SATURDAY)).toBe(6);
    });
});
