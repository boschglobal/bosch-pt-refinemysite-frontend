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
import * as moment from 'moment/moment';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ProjectDateLocaleHelper} from './project-date-locale.helper.service';
import {ProjectDateParserStrategy} from './project-date-parser.strategy';

describe('Project Date Parser Strategy', () => {
    let projectDateParserStrategy: ProjectDateParserStrategy;

    const currentDate = moment();
    const momentDefaultLocale = moment.locale();
    const projectDateLocaleHelperMock: ProjectDateLocaleHelper = mock(ProjectDateLocaleHelper);

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectDateParserStrategy,
            {
                provide: ProjectDateLocaleHelper,
                useValue: instance(projectDateLocaleHelperMock),
            },
        ],
    };

    when(projectDateLocaleHelperMock.getProjectLocale()).thenReturn(momentDefaultLocale);
    when(projectDateLocaleHelperMock.getCurrentLang()).thenReturn(momentDefaultLocale);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => projectDateParserStrategy = TestBed.inject(ProjectDateParserStrategy));

    it('should return start for a given date', () => {
        const unit = 'w';
        const expectedResult = currentDate.clone().startOf(unit);

        expect(projectDateParserStrategy.startOf(currentDate, unit).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return start date when a reference date is not provided', () => {
        const unit = 'w';
        const expectedResult = currentDate.clone().startOf(unit);

        expect(projectDateParserStrategy.startOf(undefined, unit).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return start of week for a given date', () => {
        const expectedResult = currentDate.clone().startOf('w');

        expect(projectDateParserStrategy.startOfWeek(currentDate).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return start of week date when a reference date is not provided', () => {
        const expectedResult = currentDate.clone().startOf('w');

        expect(projectDateParserStrategy.startOfWeek().isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return end for a given date', () => {
        const unit = 'w';
        const expectedResult = currentDate.clone().endOf(unit);

        expect(projectDateParserStrategy.endOf(currentDate, unit).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return end date when reference date is not provided', () => {
        const unit = 'w';
        const expectedResult = currentDate.clone().endOf(unit);

        expect(projectDateParserStrategy.endOf(undefined, unit).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return end of week for a given date', () => {
        const expectedResult = currentDate.clone().endOf('w');

        expect(projectDateParserStrategy.endOfWeek(currentDate).isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return end of week date when reference date is not provided', () => {
        const expectedResult = currentDate.clone().endOf('w');

        expect(projectDateParserStrategy.endOfWeek().isSame(expectedResult, 'd')).toBeTruthy();
    });

    it('should return true when date is same', () => {
        const date = currentDate.clone().add(1, 'm');

        expect(projectDateParserStrategy.isSame(currentDate, date, 'd')).toBeTruthy();
    });

    it('should return false when date is not the same', () => {
        const date = currentDate.clone().add(1, 'd');

        expect(projectDateParserStrategy.isSame(currentDate, date, 'd')).toBeFalsy();
    });

    it('should return true when date is same or before', () => {
        const sameDate = currentDate.clone();
        const afterDate = currentDate.clone().add(1, 'd');

        expect(projectDateParserStrategy.isSameOrBefore(currentDate, sameDate, 'd')).toBeTruthy();
        expect(projectDateParserStrategy.isSameOrBefore(currentDate, afterDate, 'd')).toBeTruthy();
    });

    it('should return false when date is not same or before', () => {
        const beforeDate = currentDate.clone().subtract(1, 'd');

        expect(projectDateParserStrategy.isSameOrBefore(currentDate, beforeDate, 'd')).toBeFalsy();
    });

    it('should return true when date is same or after', () => {
        const sameDate = currentDate.clone();
        const beforeDate = currentDate.clone().subtract(1, 'h');

        expect(projectDateParserStrategy.isSameOrAfter(currentDate, sameDate, 'd')).toBeTruthy();
        expect(projectDateParserStrategy.isSameOrAfter(currentDate, beforeDate, 'd')).toBeTruthy();
    });

    it('should return false when date is not same or after', () => {
        const afterDate = currentDate.clone().add(1, 'd');

        expect(projectDateParserStrategy.isSameOrAfter(currentDate, afterDate, 'd')).toBeFalsy();
    });

    it('should return true when date is in between dates', () => {
        const fromDate = currentDate.clone().subtract(1, 'd');
        const toDate = currentDate.clone().add(1, 'd');

        expect(projectDateParserStrategy.isBetween(currentDate, fromDate, toDate, 'd', '[]')).toBeTruthy();
    });

    it('should return false when date is not in between dates', () => {
        const fromDate = currentDate.clone().add(1, 'd');
        const toDate = currentDate.clone().add(2, 'd');

        expect(projectDateParserStrategy.isBetween(currentDate, fromDate, toDate, 'd', '[]')).toBeFalsy();
    });

    it('should return week number', () => {
        const expectedResult = currentDate.week();

        expect(projectDateParserStrategy.week(currentDate)).toEqual(expectedResult);
    });

    it('should return weekday', () => {
        const expectedResult = currentDate.weekday();

        expect(projectDateParserStrategy.weekday(currentDate)).toEqual(expectedResult);
    });
});
