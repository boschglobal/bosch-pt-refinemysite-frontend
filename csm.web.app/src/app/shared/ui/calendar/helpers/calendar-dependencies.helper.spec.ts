/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {uniqBy} from 'lodash';

import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2,
    MOCK_RELATION_RESOURCE_3
} from '../../../../../test/mocks/relations';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {Point} from '../../../misc/generic-types/point.type';
import {
    CalendarDependency,
    CalendarDependencyAnchorPointByObjectType,
    CalendarDependencyLine,
    CalendarDependencyOutOfScopeIndicator,
    CalendarDependencyOutOfScopeIndicatorCircle,
    CalendarDependencyOutOfScopeIndicatorLine,
    CalendarDependencyOutOfScopeIndicatorText,
    DependencyLine,
} from '../calendar/calendar.component';
import {
    CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX,
    CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_OFFSET_FROM_ANCHOR_BY_TYPE,
    CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_RADIUS,
    CalendarDependenciesHelper,
    CalendarDependencyOutOfScopeIndicatorTypeEnum
} from './calendar-dependencies.helper';
import {CalendarDependenciesSorterHelper} from './calendar-dependencies.sorter.helper';
import {
    CalendarDependencyGridLineStrategy,
    CalendarDependencyStraightLineStrategy
} from './calendar-dependency-line.strategy';

describe('Calendar Dependencies Helper', () => {
    let calendarDependencyGridLineStrategyGetLineSpy: jasmine.Spy;
    let calendarDependencyStraightLineStrategyGetLineSpy: jasmine.Spy;
    let calendarDependencyGridLineStrategyCanApplyStrategy: jasmine.Spy;
    const canvas = document.createElement('div');
    const canvasMockedBoundingClientRect = {left: 0, top: 0, width: 500} as DOMRect;
    const mockedObjectTypeEnum = 'mocked-object-type' as ObjectTypeEnum;
    const mockedDependencyLine: DependencyLine = {linePath: 'foo'};

    const withinScopeItem1Id = 'foo';
    const withinScopeItem2Id = 'bar';
    const withinScopeItem3Id = 'baz';
    const withinScopeItem4Id = 'qux';
    const withinScopeItem5Id = 'corge';
    const withinScopeItem6Id = 'grault';
    const withinScopeItem7Id = 'garply';
    const withinScopeItem8Id = 'waldo';
    const outOfScopeItemSourceId = 'out-of-scope-item-source';
    const outOfScopeItemTargetId = 'out-of-scope-item-target';
    const outOfScopeItemIds = [outOfScopeItemSourceId, outOfScopeItemTargetId];
    const withinScopeSourceAnchor = {x: 100, y: 50};
    const withinScopeSourceAnchorNearEdge = {x: canvasMockedBoundingClientRect.width, y: 50};
    const withinScopeTargetAnchor = {x: 200, y: 50};
    const withinScopeTargetAnchorNearEdge = {x: 8, y: 50};
    const withinScopeTargetAnchorInDifferentYAxis = {x: 200, y: 200};
    const outOfScopeItemsAnchorsById = outOfScopeItemIds.reduce((acc, curr) => ({
        ...acc,
        [curr]: () => null,
    }), {});

    const itemAnchorByDependencyType = {
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors]: (id) => itemTargetAnchorsByItemId[id](),
        [CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors]: (id) => itemSourceAnchorsByItemId[id](),
    };

    const itemSourceAnchorsByItemId: { [id: string]: () => Point | null } = {
        ...outOfScopeItemsAnchorsById,
        [withinScopeItem1Id]: () => withinScopeSourceAnchor,
        [withinScopeItem2Id]: () => withinScopeSourceAnchor,
        [withinScopeItem3Id]: () => withinScopeSourceAnchor,
        [withinScopeItem4Id]: () => withinScopeSourceAnchorNearEdge,
        [withinScopeItem5Id]: () => withinScopeTargetAnchor,
        [withinScopeItem8Id]: () => withinScopeTargetAnchorInDifferentYAxis,
    };

    const itemTargetAnchorsByItemId: { [id: string]: () => Point | null } = {
        ...outOfScopeItemsAnchorsById,
        [withinScopeItem1Id]: () => withinScopeTargetAnchor,
        [withinScopeItem2Id]: () => withinScopeTargetAnchor,
        [withinScopeItem3Id]: () => withinScopeTargetAnchor,
        [withinScopeItem4Id]: () => withinScopeTargetAnchorNearEdge,
        [withinScopeItem6Id]: () => withinScopeSourceAnchor,
        [withinScopeItem7Id]: () => withinScopeTargetAnchorInDifferentYAxis,
    };

    const dependenciesWithinScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem2Id),
        },
    ];

    const dependenciesWithinScopeWithCriticalDependencies: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            critical: false,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem2Id),
        },
        {
            ...MOCK_RELATION_RESOURCE_2,
            critical: true,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem3Id),
        },
        {
            ...MOCK_RELATION_RESOURCE_3,
            critical: false,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem2Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem3Id),
        },
    ];

    const dependenciesOutOfScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemSourceId),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
    ];

    const sourceDependenciesOutOfScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemSourceId),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
        },
    ];

    const sourceDependenciesOutOfScopeNearEdge: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemSourceId),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem4Id),
        },
    ];

    const targetDependenciesOutOfScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
    ];

    const targetDependenciesOutOfScopeNearEdge: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem4Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
    ];

    const sourceAndTargetDependenciesOutOfScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemSourceId),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
    ];

    const criticalSourceAndTargetDependenciesOutOfScope: CalendarDependency[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            critical: true,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemSourceId),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
        },
        {
            ...MOCK_RELATION_RESOURCE_2,
            critical: true,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
        {
            ...MOCK_RELATION_RESOURCE_3,
            critical: false,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, withinScopeItem1Id),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, outOfScopeItemTargetId),
        },
    ];

    const sourceAnchorCoordinatesByObjectType: CalendarDependencyAnchorPointByObjectType = {
        [mockedObjectTypeEnum]: (id) => itemSourceAnchorsByItemId[id](),
    };

    const targetAnchorCoordinatesByObjectType: CalendarDependencyAnchorPointByObjectType = {
        [mockedObjectTypeEnum]: (id) => itemTargetAnchorsByItemId[id](),
    };

    const helper = new CalendarDependenciesHelper(canvas, sourceAnchorCoordinatesByObjectType, targetAnchorCoordinatesByObjectType, {});

    const getOutOfScopeIndicator = (itemId: string,
                                    count: number,
                                    critical: boolean,
                                    outOfScopeDependencyType: CalendarDependencyOutOfScopeIndicatorTypeEnum):
        CalendarDependencyOutOfScopeIndicator => {
        const itemAnchor = itemAnchorByDependencyType[outOfScopeDependencyType](itemId);
        const id = `${CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_ID_PREFIX}${itemId}-${outOfScopeDependencyType}`;
        const indicatorOffset = CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_OFFSET_FROM_ANCHOR_BY_TYPE[outOfScopeDependencyType];
        const indicatorCoordinates =
            getOutOfScopeIndicatorCoordinates(itemAnchor, indicatorOffset);
        const circle = getOutOfScopeIndicatorCircle(indicatorCoordinates);
        const line = getOutOfScopeIndicatorLine(itemAnchor, circle);
        const text = getOutOfScopeIndicatorText(indicatorCoordinates);
        const dimmedOut = false;
        return {id, count, critical, circle, text, line, dimmedOut};
    };

    const getOutOfScopeIndicatorCoordinates = (anchor: Point,
                                               offset: Point): Point => {
        const {x: anchorX, y: anchorY} = anchor;
        const {x: xOffset, y: yOffset} = offset;
        const x = anchorX + xOffset;
        const y = anchorY + yOffset;

        return {
            x,
            y,
        };
    };

    const getOutOfScopeIndicatorCircle = (indicatorCoordinates: Point): CalendarDependencyOutOfScopeIndicatorCircle => {
        const {x: cx, y: cy} = indicatorCoordinates;

        return {
            cx,
            cy,
            r: CALENDAR_DEPENDENCY_OUT_OF_SCOPE_INDICATOR_RADIUS,
        };
    };

    const getOutOfScopeIndicatorText = (indicatorCoordinates: Point): CalendarDependencyOutOfScopeIndicatorText => {
        const fontAdjustment = 1;
        const {x, y} = indicatorCoordinates;

        return {
            x,
            y: y + fontAdjustment,
        };
    };

    const getOutOfScopeIndicatorLine = (anchor: Point,
                                        circle: CalendarDependencyOutOfScopeIndicatorCircle):
        CalendarDependencyOutOfScopeIndicatorLine => {
        const {left: canvasX, top: canvasY} = canvasMockedBoundingClientRect;
        const {x: anchorX, y: anchorY} = anchor;
        const {cx: indicatorX, cy: indicatorY} = circle;
        const startPointX = anchorX - canvasX;
        const startPointY = anchorY - canvasY;
        const d = `M ${startPointX} ${startPointY} L ${indicatorX} ${indicatorY}`;

        return {
            d,
        };
    };

    const getWithinScopeTargetDependencies = (dependencies: CalendarDependency[]): ObjectIdentifierPair[] =>
        dependencies.map(dependency => dependency.target).filter(({id}) => !!itemTargetAnchorsByItemId[id]());

    const getWithinScopeSourceDependencies = (dependencies: CalendarDependency[]): ObjectIdentifierPair[] =>
        dependencies.map(dependency => dependency.source).filter(({id}) => !!itemSourceAnchorsByItemId[id]());

    beforeEach(() => {
        spyOn(canvas, 'getBoundingClientRect').and.returnValue(canvasMockedBoundingClientRect);
        calendarDependencyGridLineStrategyGetLineSpy =
            spyOn(CalendarDependencyGridLineStrategy.prototype, 'getLine').and.returnValue(mockedDependencyLine);
        calendarDependencyStraightLineStrategyGetLineSpy =
            spyOn(CalendarDependencyStraightLineStrategy.prototype, 'getLine').and.returnValue(mockedDependencyLine);
        calendarDependencyGridLineStrategyCanApplyStrategy =
            spyOn(CalendarDependencyGridLineStrategy, 'canApplyStrategy').and.returnValue(true);
    });

    afterEach(() => {
        calendarDependencyGridLineStrategyGetLineSpy.calls.reset();
        calendarDependencyStraightLineStrategyGetLineSpy.calls.reset();
    });

    it('should return empty DependencyLine array when calling getDependencyLines for calendar dependencies target item ' +
        'not present in document', () => {
        expect(helper.getDependencyLines(targetDependenciesOutOfScope, null)).toEqual([]);
    });

    it('should return empty DependencyLine array when calling getDependencyLines for calendar dependencies source item ' +
        'not present in document', () => {
        expect(helper.getDependencyLines(sourceDependenciesOutOfScope, null)).toEqual([]);
    });

    it('should return empty DependencyLine array when calling getDependencyLines for calendar dependency items ' +
        'that are not present in document', () => {
        expect(helper.getDependencyLines(dependenciesOutOfScope, null)).toEqual([]);
    });

    it('should return DependencyLine array list when calling getDependencyLines for calendar dependency items present in document', () => {
        const line = mockedDependencyLine;
        const expectedResult: CalendarDependencyLine[] = dependenciesWithinScope
            .map(({id, critical}) => ({id, critical, line, dimmedOut: false}));

        expect(helper.getDependencyLines(dependenciesWithinScope, null)).toEqual(expectedResult);
    });

    it('should have all dependency lines dimmed out except the ones adjacent to the focused one when a focused one exists', () => {
        const line = mockedDependencyLine;

        const elementIds = [
            withinScopeItem1Id,
            withinScopeItem2Id,
            withinScopeItem3Id,
            withinScopeItem4Id,
        ];
        const length = elementIds.length;
        const focusedElementId = elementIds[2];
        const dependencies: CalendarDependency[] = Array.from({length}, (_, idx) => ({
            ...MOCK_RELATION_RESOURCE_1,
            id: `relation-${idx + 1}`,
            source: new ObjectIdentifierPair(mockedObjectTypeEnum, elementIds[idx]),
            target: new ObjectIdentifierPair(mockedObjectTypeEnum, elementIds[(idx + 1) % length]),
        }));

        const expectedResult: CalendarDependencyLine[] = dependencies
            .map(({id, critical, source, target}) => ({
                id, critical, line,
                dimmedOut: source.id !== focusedElementId && target.id !== focusedElementId,
            }))
            .sort(CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical);
        expect(helper.getDependencyLines(dependencies, focusedElementId)).toEqual(expectedResult);
    });

    it('should return DependencyLine array list sorted by non critical dependencies when calling getDependencyLines for ' +
        'calendar dependency items present in document', () => {
        const line = mockedDependencyLine;
        const expectedResult: CalendarDependencyLine[] = dependenciesWithinScopeWithCriticalDependencies
            .reverse()
            .map(({id, critical}) => ({id, critical, line, dimmedOut: false}))
            .sort(CalendarDependenciesSorterHelper.compareByDimmedOutAndCritical);

        expect(helper.getDependencyLines(dependenciesWithinScopeWithCriticalDependencies, null)).toEqual(expectedResult);
    });

    it('should return empty CalendarDependencyOutOfScopeIndicator array when calling getDependencyOutOfScopeIndicators for ' +
        'all dependency items not present in document', () => {
        expect(helper.getDependencyOutOfScopeIndicators(dependenciesOutOfScope)).toEqual([]);
    });

    it('should return empty CalendarDependencyOutOfScopeIndicator array when calling getDependencyOutOfScopeIndicators for ' +
        'all dependency items present in document', () => {
        expect(helper.getDependencyOutOfScopeIndicators(dependenciesWithinScope)).toEqual([]);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct predecessors out of scope', () => {
        const withinScopeTargetDependencies = uniqBy(getWithinScopeTargetDependencies(sourceDependenciesOutOfScope), item => item.id);
        const expectedResult: CalendarDependencyOutOfScopeIndicator[] = withinScopeTargetDependencies.map(({id}) => {
            const outOfScopeItems = sourceDependenciesOutOfScope.filter(dependency => dependency.target.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        }
        );

        expect(helper.getDependencyOutOfScopeIndicators(sourceDependenciesOutOfScope)).toEqual(expectedResult);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct predecessors out of scope near the calendar\'s edge', () => {
        const withinScopeTargetDependencies = uniqBy(
            getWithinScopeTargetDependencies(sourceDependenciesOutOfScopeNearEdge),
            item => item.id
        );
        const expectedResult: CalendarDependencyOutOfScopeIndicator[] = withinScopeTargetDependencies.map(({id}) => {
            const outOfScopeItems = sourceDependenciesOutOfScopeNearEdge.filter(relation => relation.target.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(relation => !!relation.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        }
        );

        expect(helper.getDependencyOutOfScopeIndicators(sourceDependenciesOutOfScopeNearEdge)).toEqual(expectedResult);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct successors out of scope', () => {
        const withinScopeSourceDependencies = uniqBy(getWithinScopeSourceDependencies(targetDependenciesOutOfScope), item => item.id);
        const expectedResult: CalendarDependencyOutOfScopeIndicator[] = withinScopeSourceDependencies.map(({id}) => {
            const outOfScopeItems = targetDependenciesOutOfScope.filter(dependency => dependency.source.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        }
        );

        expect(helper.getDependencyOutOfScopeIndicators(targetDependenciesOutOfScope)).toEqual(expectedResult);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct successors out of scope near the calendar\'s edge', () => {
        const withinScopeSourceDependencies = uniqBy(
            getWithinScopeSourceDependencies(targetDependenciesOutOfScopeNearEdge),
            item => item.id
        );
        const expectedResult: CalendarDependencyOutOfScopeIndicator[] = withinScopeSourceDependencies.map(({id}) => {
            const outOfScopeItems = targetDependenciesOutOfScopeNearEdge.filter(dependency => dependency.source.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        }
        );

        expect(helper.getDependencyOutOfScopeIndicators(targetDependenciesOutOfScopeNearEdge)).toEqual(expectedResult);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with dimmedOut false when no focused element is passed', () => {
        const focusedElementId = null;
        const actualResult = helper.getDependencyOutOfScopeIndicators(sourceAndTargetDependenciesOutOfScope, focusedElementId);
        for (const outOfScopeIndicator of actualResult) {
            expect(outOfScopeIndicator.dimmedOut).toBe(false);
        }
    });

    it('should return CalendarDependencyOutOfScopeIndicator with dimmedOut false when a focused element is passed ' +
        'which matches the id of the indicator', () => {
        const focusedElementId = sourceAndTargetDependenciesOutOfScope[0].target.id;
        const actualResult = helper.getDependencyOutOfScopeIndicators(sourceAndTargetDependenciesOutOfScope, focusedElementId);
        for (const outOfScopeIndicator of actualResult) {
            expect(outOfScopeIndicator.dimmedOut).toBe(false);
        }
    });

    it('should return CalendarDependencyOutOfScopeIndicator with dimmedOut true when a focused element is passed ' +
        'which does not match the id of the indicator', () => {
        const focusedElementId = 'something-completely-different';
        const actualResult = helper.getDependencyOutOfScopeIndicators(sourceAndTargetDependenciesOutOfScope, focusedElementId);
        for (const outOfScopeIndicator of actualResult) {
            expect(outOfScopeIndicator.dimmedOut).toBe(true);
        }
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct predecessors and successors out of scope', () => {
        const withinScopeTargetDependencies =
            uniqBy(getWithinScopeTargetDependencies(sourceAndTargetDependenciesOutOfScope), item => item.id);
        const withinScopeSourceDependencies =
            uniqBy(getWithinScopeSourceDependencies(sourceAndTargetDependenciesOutOfScope), item => item.id);
        const expectedOutOfScopePredecessors = withinScopeTargetDependencies.map(({id}) => {
            const outOfScopeItems = sourceAndTargetDependenciesOutOfScope.filter(dependency => dependency.target.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        });
        const expectedOutOfScopeSuccessors = withinScopeSourceDependencies.map(({id}) => {
            const outOfScopeItems = sourceAndTargetDependenciesOutOfScope.filter(dependency => dependency.source.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        });
        const expectedResult = [...expectedOutOfScopePredecessors, ...expectedOutOfScopeSuccessors];

        expect(helper.getDependencyOutOfScopeIndicators(sourceAndTargetDependenciesOutOfScope)).toEqual(expectedResult);
    });

    it('should return CalendarDependencyOutOfScopeIndicator with the correct critical dependencies predecessors and successors ' +
        'out of scope', () => {
        const withinScopeTargetDependencies =
            uniqBy(getWithinScopeTargetDependencies(criticalSourceAndTargetDependenciesOutOfScope), item => item.id);
        const withinScopeSourceDependencies =
            uniqBy(getWithinScopeSourceDependencies(criticalSourceAndTargetDependenciesOutOfScope), item => item.id);
        const expectedOutOfScopePredecessors = withinScopeTargetDependencies.map(({id}) => {
            const outOfScopeItems = criticalSourceAndTargetDependenciesOutOfScope.filter(dependency => dependency.target.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Predecessors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        });
        const expectedOutOfScopeSuccessors = withinScopeSourceDependencies.map(({id}) => {
            const outOfScopeItems = criticalSourceAndTargetDependenciesOutOfScope.filter(dependency => dependency.source.id === id);
            const outOfScopeItemsCount = outOfScopeItems.length;
            const critical = outOfScopeItems.some(dependency => !!dependency.critical);
            const outOfScopeDependencyType = CalendarDependencyOutOfScopeIndicatorTypeEnum.Successors;

            return getOutOfScopeIndicator(id, outOfScopeItemsCount, critical, outOfScopeDependencyType);
        });
        const expectedResult = [...expectedOutOfScopePredecessors, ...expectedOutOfScopeSuccessors];

        expect(helper.getDependencyOutOfScopeIndicators(criticalSourceAndTargetDependenciesOutOfScope)).toEqual(expectedResult);
    });

    it('should not apply Calendar Dependency Straight Line Strategy when it\'s possible to apply the Grid Line Strategy', () => {
        const dependencies = [dependenciesWithinScope[0]];
        calendarDependencyGridLineStrategyCanApplyStrategy.and.returnValue(true);

        helper.getDependencyLines(dependencies);

        expect(calendarDependencyStraightLineStrategyGetLineSpy).not.toHaveBeenCalled();
    });

    it('should apply Calendar Dependency Straight Line Strategy when it\'s not possible to apply the Grid Line Strategy', () => {
        const dependencies = [dependenciesWithinScope[0]];
        calendarDependencyGridLineStrategyCanApplyStrategy.and.returnValue(false);

        helper.getDependencyLines(dependencies);

        expect(calendarDependencyStraightLineStrategyGetLineSpy).toHaveBeenCalled();
    });

    it('should not apply Calendar Dependency Grid Line Strategy when it\'s possible to apply it', () => {
        const dependencies = [dependenciesWithinScope[0]];
        calendarDependencyGridLineStrategyCanApplyStrategy.and.returnValue(false);

        helper.getDependencyLines(dependencies);

        expect(calendarDependencyGridLineStrategyGetLineSpy).not.toHaveBeenCalled();
    });

    it('should apply Calendar Dependency Grid Line Strategy when it\'s possible to apply it', () => {
        const dependencies = [dependenciesWithinScope[0]];
        calendarDependencyGridLineStrategyCanApplyStrategy.and.returnValue(true);

        helper.getDependencyLines(dependencies);

        expect(calendarDependencyGridLineStrategyGetLineSpy).toHaveBeenCalled();
    });
});
