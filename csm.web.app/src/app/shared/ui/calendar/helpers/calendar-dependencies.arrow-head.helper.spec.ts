/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {CalendarDependencyArrowHeadHelper} from './calendar-dependencies.arrow-head.helper';
import {CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE} from './calendar-dependency-line.strategy';

describe('Calendar Dependency ArrowHeadHelper', () => {

    describe('formatNumber', () => {
        const {formatNumber} = CalendarDependencyArrowHeadHelper;

        it('should round the last digit', () => {
            expect(formatNumber(3.14159, 4)).toEqual('3.1416');
        });

        it('should trim unnecessary trailing zeros', () => {
            expect(formatNumber(3.0001)).toEqual('3');
        });

        it('should trim unnecessary minus signs', () => {
            const verySmallNegativeNumber = -1e-14;

            expect(formatNumber(verySmallNegativeNumber)).toEqual('0');
        });
    });

    describe('generatePath', () => {
        const {formatNumber, generatePath} = CalendarDependencyArrowHeadHelper;

        it('should generate an SVG path for a triangle with specified angle 0', () => {
            const diagonalComponent = formatNumber(-CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE / Math.SQRT2);
            const hypotenuse = formatNumber(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE * Math.SQRT2);
            const expectedPath = `l${diagonalComponent},${diagonalComponent} 0,${hypotenuse}z`;
            const actualResult = generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, 0);

            expect(actualResult).toEqual(expectedPath);
        });

        it('should generate an SVG path for a triangle with specified angle 180', () => {
            const diagonalComponent = formatNumber(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE / Math.sqrt(2));
            const hypotenuse = formatNumber(-CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE * Math.sqrt(2));
            const expectedPath = `l${diagonalComponent},${diagonalComponent} 0,${hypotenuse}z`;
            const actualResult = generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, 180);

            expect(actualResult).toEqual(expectedPath);
        });
    });

});
