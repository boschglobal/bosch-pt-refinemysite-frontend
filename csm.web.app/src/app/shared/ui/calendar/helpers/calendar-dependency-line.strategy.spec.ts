/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {MOCK_RELATION_RESOURCE_1} from '../../../../../test/mocks/relations';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {Point} from '../../../misc/generic-types/point.type';
import {
    CalendarDependency,
    CalendarDependencyAnchorPointYBaseByStrategyAndObjectType,
    DependencyLine
} from '../calendar/calendar.component';
import {CalendarDependencyArrowHeadHelper} from './calendar-dependencies.arrow-head.helper';
import {
    CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE,
    CALENDAR_DEPENDENCY_GRID_LINE_ARROW_WIDTH,
    CALENDAR_DEPENDENCY_GRID_LINE_CONTROL_POINT_OFFSET,
    CALENDAR_DEPENDENCY_GRID_LINE_MIN_CONNECTOR_WIDTH,
    CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS,
    CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS,
    CalendarDependencyGridLineStrategy,
    CalendarDependencyLineContext,
    CalendarDependencyStraightLineStrategy
} from './calendar-dependency-line.strategy';

describe('Calendar Dependency Line Strategy', () => {
    const sourcePoint: Point = {x: 10, y: 10};
    const targetPoint: Point = {x: 100, y: 10};
    const {x: sx, y: sy} = sourcePoint;
    const {x: tx, y: ty} = targetPoint;
    const controlPointOffset = CALENDAR_DEPENDENCY_GRID_LINE_CONTROL_POINT_OFFSET;

    const sourceCornerRadius = CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS;
    const targetCornerRadius = CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS;
    const arrowWidth = CALENDAR_DEPENDENCY_GRID_LINE_ARROW_WIDTH;

    const mockedObjectTypeEnum = 'mocked-object-type' as ObjectTypeEnum;
    const dependency: CalendarDependency = {
        ...MOCK_RELATION_RESOURCE_1,
        source: new ObjectIdentifierPair(mockedObjectTypeEnum, 'foo'),
        target: new ObjectIdentifierPair(mockedObjectTypeEnum, 'bar'),
    };
    const requiredMinWidthForGridLineStrategy = CalendarDependencyGridLineStrategy.requiredMinWidthForStrategy;

    it('should return a straight dependency line when calling getDependencyLine on a calendar dependency straight line strategy', () => {
        const context = new CalendarDependencyLineContext();
        const straightLineStrategy = new CalendarDependencyStraightLineStrategy(sourcePoint, targetPoint);
        const expectedResult: DependencyLine = {
            linePath: `M${sx},${sy} L${tx},${ty}`,
            arrowHeadPath: `M${tx},${ty}${
                CalendarDependencyArrowHeadHelper.generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, Math.atan2(ty - sy, sy - sx))}`,
        };
        context.setStrategy(straightLineStrategy);

        expect(context.getDependencyLine()).toEqual(expectedResult);
    });

    it('should return a grid dependency line when calling getDependencyLine on a calendar dependency grid line strategy', () => {
        const context = new CalendarDependencyLineContext();
        const yBase = Math.max(sy, ty);
        const anchorYBaseOffset = 0;
        const anchorYBase: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType = {
            ['grid']: {[mockedObjectTypeEnum]: anchorYBaseOffset},
        };
        const gridLineStrategy = new CalendarDependencyGridLineStrategy(sourcePoint, targetPoint, dependency, anchorYBase);
        const sourceAnchorLine = [
            `M${sx},${sy}`,
            `q${sourceCornerRadius},0 ${sourceCornerRadius},${sourceCornerRadius}`,
            `v${Math.max(2, yBase - sy - sourceCornerRadius)}`,
        ].join('');
        const targetAnchorLine = [
            `V${ty + targetCornerRadius}`,
            `q0,${-targetCornerRadius} ${targetCornerRadius},${-targetCornerRadius}`,
            `h${arrowWidth - 2}`,
        ].join('');
        const lineEndX = (tx - targetCornerRadius - arrowWidth) - (sx + sourceCornerRadius) - controlPointOffset * 2;
        const curveDown = `q0,${controlPointOffset} ${controlPointOffset},${controlPointOffset}`;
        const horizontalLine = `h${lineEndX}`;
        const curveUp = `q${controlPointOffset},0 ${controlPointOffset},${-controlPointOffset}`;
        const connectorLine = [curveDown, horizontalLine, curveUp].join('');
        const expectedResult: DependencyLine = {
            linePath: [sourceAnchorLine, connectorLine, targetAnchorLine].join(''),
            arrowHeadPath: `M${tx},${ty}${CalendarDependencyArrowHeadHelper.generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, 0)}`,
        };

        context.setStrategy(gridLineStrategy);

        expect(context.getDependencyLine()).toEqual(expectedResult);
    });

    it('should set the correct value of requiredMinWidthForStrategy for grid line strategy', () => {
        const requiredMinWithForGridLineStrategy = CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS +
            CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS +
            CALENDAR_DEPENDENCY_GRID_LINE_MIN_CONNECTOR_WIDTH;

        expect(CalendarDependencyGridLineStrategy.requiredMinWidthForStrategy).toBe(requiredMinWithForGridLineStrategy);
    });

    it(`should return TRUE when calling canApplyStrategy if distance between source and target
    in X axis is equal to ${requiredMinWidthForGridLineStrategy}`, () => {
        const source: Point = {x: 10, y: 10};
        const target: Point = {x: source.x + requiredMinWidthForGridLineStrategy, y: 10};

        expect(CalendarDependencyGridLineStrategy.canApplyStrategy(source, target)).toBeTruthy();
    });

    it(`should return TRUE when calling canApplyStrategy if distance between source and target
    in X axis is higher then ${requiredMinWidthForGridLineStrategy}`, () => {
        const source: Point = {x: 10, y: 10};
        const target: Point = {x: source.x + requiredMinWidthForGridLineStrategy + 1, y: 10};

        expect(CalendarDependencyGridLineStrategy.canApplyStrategy(source, target)).toBeTruthy();
    });

    it(`should return FALSE when calling canApplyStrategy if distance between source and target
    in X axis is less then ${requiredMinWidthForGridLineStrategy}`, () => {
        const source: Point = {x: 10, y: 10};
        const target: Point = {x: source.x + requiredMinWidthForGridLineStrategy - 1, y: 10};

        expect(CalendarDependencyGridLineStrategy.canApplyStrategy(source, target)).toBeFalsy();
    });
});
