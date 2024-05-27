/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {CalendarDependencyLine} from '../calendar/calendar.component';
import {CalendarDependenciesSorterHelper} from './calendar-dependencies.sorter.helper';

describe('Sort Comparers helper', () => {
    describe('compareByDimmedOutAndCritical function', () => {
        const mockedDimmedOutDependencyLine: CalendarDependencyLine = {
            id: 'foo',
            dimmedOut: true,
            critical: false,
        };

        const mockedDimmedOutCriticalDependencyLine: CalendarDependencyLine = {
            id: 'bar',
            dimmedOut: true,
            critical: true,
        };

        const mockedCriticalDependencyLine: CalendarDependencyLine = {
            id: 'baz',
            dimmedOut: false,
            critical: true,
        };

        const mockedStandardDependencyLine: CalendarDependencyLine = {
            id: 'foobar',
            dimmedOut: false,
            critical: false,
        };

        it('should return a positive value when comparing a dimmed out critical dependency line with a standard dependency line', () => {
            const actualResult = CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical(
                mockedDimmedOutCriticalDependencyLine, mockedStandardDependencyLine);
            expect(actualResult).toBeGreaterThan(0);
        });

        it('should return a negative value when comparing a dimmed out dependency line with a standard dependency line', () => {
            const actualResult = CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical(
                mockedDimmedOutDependencyLine, mockedStandardDependencyLine);
            expect(actualResult).toBeLessThan(0);
        });

        it('should return a positive value when comparing a critical dependency line with a standard dependency line', () => {
            const actualResult = CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical(
                mockedCriticalDependencyLine, mockedStandardDependencyLine);
            expect(actualResult).toBeGreaterThan(0);
        });

        it('should return a negative value when comparing a dimmed out dependency line with a dimmed out critical dependency line', () => {
            const actualResult = CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical(
                mockedDimmedOutDependencyLine, mockedDimmedOutCriticalDependencyLine);
            expect(actualResult).toBeLessThan(0);
        });
    });
});
