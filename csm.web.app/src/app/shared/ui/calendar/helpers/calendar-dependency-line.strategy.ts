/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RelationResourceDirection} from '../../../../project/project-common/store/relations/relation.queries';
import {Point} from '../../../misc/generic-types/point.type';
import {
    CalendarDependency,
    CalendarDependencyAnchorPointYBaseByStrategyAndObjectType,
    DependencyLine
} from '../calendar/calendar.component';
import {CalendarDependencyArrowHeadHelper} from './calendar-dependencies.arrow-head.helper';

export const CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE = 6;

export const CALENDAR_DEPENDENCY_GRID_LINE_CONTROL_POINT_OFFSET = 4;
export const CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS = 4;
export const CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS = 4;
export const CALENDAR_DEPENDENCY_GRID_LINE_ARROW_WIDTH = Math.round(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE * Math.SQRT2 / 2);
export const CALENDAR_DEPENDENCY_GRID_LINE_MIN_CONNECTOR_WIDTH = 2 + CALENDAR_DEPENDENCY_GRID_LINE_CONTROL_POINT_OFFSET * 2;
export class CalendarDependencyLineContext {

    private _strategy: CalendarDependencyLineStrategy;

    constructor() {
    }

    public setStrategy(strategy: CalendarDependencyLineStrategy): void {
        this._strategy = strategy;
    }

    public getDependencyLine(): DependencyLine {
        return this._strategy.getLine();
    }
}

interface CalendarDependencyLineStrategy {
    getLine(): DependencyLine;
}

export class CalendarDependencyStraightLineStrategy implements CalendarDependencyLineStrategy {
    constructor(private _sourcePoint: Point,
                private _targetPoint: Point) {
    }

    public getLine(): DependencyLine {
        const {x: sx, y: sy} = this._sourcePoint;
        const {x: tx, y: ty} = this._targetPoint;
        const RAD_TO_DEG = 180 / Math.PI;
        const dx = tx - sx;
        const dy = ty - sy;
        const angle = Math.atan2(dy, dx) * RAD_TO_DEG;
        return {
            linePath: `M${sx},${sy} L${tx},${ty}`,
            arrowHeadPath: `M${tx},${ty}${CalendarDependencyArrowHeadHelper.generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, angle)}`,
        };
    }
}

export class CalendarDependencyGridLineStrategy implements CalendarDependencyLineStrategy {

    public static readonly requiredMinWidthForStrategy =
        CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS +
        CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS +
        CALENDAR_DEPENDENCY_GRID_LINE_MIN_CONNECTOR_WIDTH;

    private readonly _controlPointOffset = CALENDAR_DEPENDENCY_GRID_LINE_CONTROL_POINT_OFFSET;

    private readonly _sourceCornerRadius = CALENDAR_DEPENDENCY_GRID_LINE_SOURCE_CORNER_RADIUS;

    private readonly _targetCornerRadius = CALENDAR_DEPENDENCY_GRID_LINE_TARGET_CORNER_RADIUS;

    private readonly _arrowWidth = CALENDAR_DEPENDENCY_GRID_LINE_ARROW_WIDTH;

    private _getAnchorLineByType = ({x, y}: Point, yBase: number): { [key in RelationResourceDirection]: string } => ({
        source: [
            `M${x},${y}`,
            `q${this._sourceCornerRadius},0 ${this._sourceCornerRadius},${this._sourceCornerRadius}`,
            `v${Math.max(2, yBase - y - this._sourceCornerRadius)}`,
        ].join(''),
        target: [
            `V${y + this._targetCornerRadius}`,
            `q0,${-this._targetCornerRadius} ${this._targetCornerRadius},${-this._targetCornerRadius}`,
            `h${this._arrowWidth - 2}`,
        ].join(''),
    });

    constructor(private _sourcePoint: Point,
                private _targetPoint: Point,
                private _dependency: CalendarDependency,
                private _anchorPointYBaseByStrategyAndObjectType: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType) {
    }

    public static canApplyStrategy({x: sourceX}: Point, {x: targetX}: Point): boolean {
        return Math.abs(targetX - sourceX) >= CalendarDependencyGridLineStrategy.requiredMinWidthForStrategy;
    }

    public getLine(): DependencyLine {
        const {source: {type: sourceType}, target: {type: targetType}} = this._dependency;
        const sourcePointYBase = this._sourcePoint.y + this._anchorPointYBaseByStrategyAndObjectType['grid'][sourceType];
        const targetPointYBase = this._targetPoint.y + this._anchorPointYBaseByStrategyAndObjectType['grid'][targetType];
        const yBase = Math.max(sourcePointYBase, targetPointYBase);
        const sourceAnchorLine = this._getAnchorLineByType(this._sourcePoint, yBase)['source'];
        const targetAnchorLine = this._getAnchorLineByType(this._targetPoint, yBase)['target'];
        const connectorLine = this._getConnectorLine(this._sourcePoint, this._targetPoint);

        const linePath = [
            sourceAnchorLine,
            connectorLine,
            targetAnchorLine,
        ].join('');

        const arrowHeadPath = [
            `M${this._targetPoint.x},${this._targetPoint.y}`,
            `${CalendarDependencyArrowHeadHelper.generatePath(CALENDAR_DEPENDENCY_ARROW_HEAD_SIZE, 0)}`,
        ].join('');

        return {
            linePath,
            arrowHeadPath,
        };
    }

    private _getConnectorLine({x: sx}: Point, {x: tx}: Point) {
        const sourceX = sx + this._sourceCornerRadius;
        const targetX = tx - this._targetCornerRadius - this._arrowWidth;
        const direction = Math.sign(targetX - sourceX);
        const anchorPointsOffSetFromBaseLine = this._controlPointOffset * 2;

        const curveDown = `q0,${this._controlPointOffset} ${direction * this._controlPointOffset},${this._controlPointOffset}`;
        const curveUp = `q${direction * this._controlPointOffset},0 ${direction * this._controlPointOffset},${-this._controlPointOffset}`;
        const horizontalLine = `h${targetX - sourceX - direction * anchorPointsOffSetFromBaseLine}`;

        return [curveDown, horizontalLine, curveUp].join('');
    }
}
