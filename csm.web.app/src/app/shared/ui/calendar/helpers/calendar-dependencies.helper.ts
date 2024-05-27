/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {uniqBy} from 'lodash';

import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {Point} from '../../../misc/generic-types/point.type';
import {
    CalendarDependency,
    CalendarDependencyAnchorPointByObjectType,
    CalendarDependencyAnchorPointYBaseByStrategyAndObjectType,
    CalendarDependencyLine,
    CalendarDependencyOutOfScopeIndicator,
    CalendarDependencyOutOfScopeIndicatorCircle,
    CalendarDependencyOutOfScopeIndicatorLine,
    CalendarDependencyOutOfScopeIndicatorText,
    DependencyLine,
} from '../calendar/calendar.component';
import {CalendarDependenciesSorterHelper} from './calendar-dependencies.sorter.helper';
import {
    CalendarDependencyGridLineStrategy,
    CalendarDependencyLineContext,
    CalendarDependencyStraightLineStrategy
} from './calendar-dependency-line.strategy';

export const CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX = 'calendar-dependency-out-of-scope-indicator-';
export const CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_RADIUS = 8;

export class CalendarDependenciesHelper {

    private _itemAnchorPointByDependencyType: CalendarDependencyAnchorPointByDependencyType = {
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors]: this._targetAnchorPointByObjectType,
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors]: this._sourceAnchorPointByObjectType,
    };

    constructor(private _canvas: Element,
                private _sourceAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType,
                private _targetAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType,
                private _anchorPointYBaseByStrategyAndObjectType: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType) {
    }

    public getDependencyLines(dependencies: CalendarDependency[], focusedId?: string): CalendarDependencyLine[] {
        return dependencies
            .map(dependency => ({
                id: dependency.id,
                critical: !!dependency.critical,
                line: this._getLine(dependency),
                dimmedOut:
                    !!focusedId && !this._getDependencyIsDirectConnection(dependency, focusedId),
            }))
            .filter(dependency => !!dependency.line)
            .sort(CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical);
    }

    public getDependencyOutOfScopeIndicators(dependencies: CalendarDependency[], focusedElementId?: string):
        CalendarDependencyOutOfScopeIndicator[] {
        const dependencyItems = this._getDependencyItems(dependencies);
        const outOfScopeDependencyItemsIds = this._getDependencyOutOfScopeItemsIds(dependencyItems);

        return dependencyItems
            .filter(item => !outOfScopeDependencyItemsIds.includes(item.id))
            .reduce((acc, item) => {
                const outOfScopeDependenciesByType =
                    this._getOutOfScopeDependenciesNumberByIndicatorType(item.id, dependencies, outOfScopeDependencyItemsIds);
                const criticalDependenciesOutOfScopeByType =
                    this._getHasCriticalDependenciesOutOfScopeByIndicatorType(item.id, dependencies, outOfScopeDependencyItemsIds);
                const predecessorsEnum = CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors;
                const successorsEnum = CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors;
                const outOfScopePredecessors = outOfScopeDependenciesByType[predecessorsEnum];
                const outOfScopeSuccessors = outOfScopeDependenciesByType[successorsEnum];
                const hasCriticalPredecessors = criticalDependenciesOutOfScopeByType[predecessorsEnum];
                const hasCriticalSuccessors = criticalDependenciesOutOfScopeByType[successorsEnum];
                const predecessors: CalendarDependencyOutOfScopeDependenciesByType =
                    {
                        item,
                        type: predecessorsEnum,
                        outOfScopeDependencies: outOfScopePredecessors,
                        critical: hasCriticalPredecessors,
                    };
                const successors: CalendarDependencyOutOfScopeDependenciesByType =
                    {
                        item,
                        type: successorsEnum,
                        outOfScopeDependencies: outOfScopeSuccessors,
                        critical: hasCriticalSuccessors,
                    };

                return [
                    ...acc,
                    predecessors,
                    successors,
                ];
            }, [] as CalendarDependencyOutOfScopeDependenciesByType[])
            .filter((item: CalendarDependencyOutOfScopeDependenciesByType) => !!item.outOfScopeDependencies)
            .map((item: CalendarDependencyOutOfScopeDependenciesByType) => this._getOutOfScopeIndicator(item, focusedElementId))
            .sort(CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical);
    }

    private _getLine(dependency: CalendarDependency): DependencyLine | null {
        const {source, target} = dependency;
        const sourcePoint = this._sourceAnchorPointByObjectType[source.type](source.id);
        const targetPoint = this._targetAnchorPointByObjectType[target.type](target.id);

        if (!sourcePoint || !targetPoint) {
            return null;
        }

        const lineStrategy = new CalendarDependencyLineContext();
        const normalizedSourcePoint = this._getNormalizedPoint(sourcePoint, this._canvas.getBoundingClientRect());
        const normalizedTargetPoint = this._getNormalizedPoint(targetPoint, this._canvas.getBoundingClientRect());
        const canApplyGridLineStrategy = CalendarDependencyGridLineStrategy.canApplyStrategy(normalizedSourcePoint, normalizedTargetPoint);

        if (canApplyGridLineStrategy) {
            const pointYBase = this._anchorPointYBaseByStrategyAndObjectType;

            lineStrategy.setStrategy(
                new CalendarDependencyGridLineStrategy(normalizedSourcePoint, normalizedTargetPoint, dependency, pointYBase));
        } else {
            lineStrategy.setStrategy(new CalendarDependencyStraightLineStrategy(normalizedSourcePoint, normalizedTargetPoint));
        }

        return lineStrategy.getDependencyLine();
    }

    private _getDependencyItems(dependencies: CalendarDependency[]): ObjectIdentifierPair[] {
        return uniqBy([
            ...dependencies.map(dependency => dependency.source),
            ...dependencies.map(dependency => dependency.target),
        ], (item => item.id));
    }

    private _getDependencyOutOfScopeItemsIds(items: ObjectIdentifierPair[]): string[] {
        return items
            .filter(item =>
                !this._sourceAnchorPointByObjectType[item.type](item.id) &&
                !this._targetAnchorPointByObjectType[item.type](item.id))
            .map(item => item.id);
    }

    private _getOutOfScopeIndicator(outOfScopeDependenciesByType: CalendarDependencyOutOfScopeDependenciesByType,
                                    focusedElementId?: string): CalendarDependencyOutOfScopeIndicator {
        const {item, type: dependencyType, outOfScopeDependencies: count, critical} = outOfScopeDependenciesByType;
        const id = `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}${item.id}-${dependencyType}`;
        const canvasRect = this._canvas.getBoundingClientRect();
        const anchorCoordinates =
            this._getNormalizedPoint(this._itemAnchorPointByDependencyType[dependencyType][item.type](item.id), canvasRect);
        const indicatorOffset = CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_OFFSET_FROM_ANCHOR_BY_TYPE[dependencyType];
        const indicatorCoordinates =
            this._getCalendarDependencyOutOfScopeIndicatorCoordinates(anchorCoordinates, indicatorOffset);
        const circle = this._getCalendarDependencyOutOfScopeIndicatorCircle(indicatorCoordinates);
        const line = this._getCalendarDependencyOutOfScopeIndicatorLine(anchorCoordinates, circle);
        const text = this._getCalendarDependencyOutOfScopeIndicatorText(indicatorCoordinates);
        const dimmedOut = Boolean(focusedElementId) && focusedElementId !== item.id;
        return {
            id,
            count,
            critical,
            circle,
            text,
            line,
            dimmedOut,
        };
    }

    private _getCalendarDependencyOutOfScopeIndicatorCoordinates(anchor: Point,
                                                                 offset: Point): Point {
        const {x: anchorX, y: anchorY} = anchor;
        const {x: xOffset, y: yOffset} = offset;
        const x = anchorX + xOffset;
        const y = anchorY + yOffset;

        return {
            x,
            y,
        };
    }

    private _getCalendarDependencyOutOfScopeIndicatorLine(anchor: Point,
                                                          circle: CalendarDependencyOutOfScopeIndicatorCircle):
        CalendarDependencyOutOfScopeIndicatorLine {
        const {x: anchorX, y: anchorY} = anchor;
        const {cx: indicatorX, cy: indicatorY} = circle;

        const startPointX = anchorX;
        const startPointY = anchorY;

        const d = `M ${startPointX} ${startPointY} L ${indicatorX} ${indicatorY}`;

        return {
            d,
        };
    }

    private _getCalendarDependencyOutOfScopeIndicatorCircle(indicatorCoordinates: Point):
        CalendarDependencyOutOfScopeIndicatorCircle {
        const {x: cx, y: cy} = indicatorCoordinates;
        const r = CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_RADIUS;

        return {
            cx,
            cy,
            r,
        };
    }

    private _getCalendarDependencyOutOfScopeIndicatorText(indicatorCoordinates: Point):
        CalendarDependencyOutOfScopeIndicatorText {
        const fontAdjustment = 1;
        const {x, y} = indicatorCoordinates;

        return {
            x,
            y: y + fontAdjustment,
        };
    }

    private _getOutOfScopeDependenciesNumberByIndicatorType(itemId: string,
                                                            dependencies: CalendarDependency[],
                                                            outOfScopeItemsIds: string[]):
        { [key in CalendarDependencyOutOfScopeIndicatorTypeEnum]: number } {
        return {
            [CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors]: dependencies.filter(({target, source}) =>
                target.id === itemId && outOfScopeItemsIds.includes(source.id)).length,
            [CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors]: dependencies.filter(({target, source}) =>
                source.id === itemId && outOfScopeItemsIds.includes(target.id)).length,
        };
    }

    private _getHasCriticalDependenciesOutOfScopeByIndicatorType(itemId: string,
                                                                 dependencies: CalendarDependency[],
                                                                 outOfScopeItemsIds: string[]):
        { [key in CalendarDependencyOutOfScopeIndicatorTypeEnum]: boolean } {
        return {
            [CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors]: !!dependencies.filter(({target, source, critical}) =>
                !!critical && target.id === itemId && outOfScopeItemsIds.includes(source.id)).length,
            [CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors]: !!dependencies.filter(({target, source, critical}) =>
                !!critical && source.id === itemId && outOfScopeItemsIds.includes(target.id)).length,
        };
    }

    private _getNormalizedPoint(point: Point, canvas: DOMRect): Point {
        const {x, y} = point;
        const {left: canvasX, top: canvasY} = canvas;

        return {
            x: x - canvasX,
            y: y - canvasY,
        };
    }

    private _getDependencyIsDirectConnection( dependency: CalendarDependency, focusedElementId: string): boolean {
        return (dependency.source.id === focusedElementId || dependency.target.id === focusedElementId);
    }
}

type CalendarDependencyAnchorPointByDependencyType = {
    [key in CalendarDependencyOutOfScopeIndicatorTypeEnum]: CalendarDependencyAnchorPointByObjectType
};

interface CalendarDependencyOutOfScopeDependenciesByType {
    item: ObjectIdentifierPair;
    type: CalendarDependencyOutOfScopeIndicatorTypeEnum;
    outOfScopeDependencies: number;
    critical: boolean;
}

export enum CalendarDependencyOutOfScopeIndicatorTypeEnum {
    Predecessors = 'predecessors',
    Successors = 'successors',
}

export const CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_OFFSET_FROM_ANCHOR_BY_TYPE:
    { [key in CalendarDependencyOutOfScopeIndicatorTypeEnum]: Point } = {
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors]: {
            x: 0,
            y: 18,
        },
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors]: {
            x: 0,
            y: -18,
        },
    };
