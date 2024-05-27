/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

enum SortPriority {
    Low = 1,
    Standard = 2,
    Critical = 3,
}

interface DependencyLineUnionType {
    dimmedOut: boolean;
    critical?: boolean;
}

function evaluateCalendarDependencyLine({dimmedOut, critical}: DependencyLineUnionType): number {
    if (critical) {
        return SortPriority.Critical;
    }
    if (dimmedOut) {
        return SortPriority.Low;
    }
    return SortPriority.Standard;
}
export class CalendarDependenciesSorterHelper {

    public static compareByDimmedOutAndCritical(first: DependencyLineUnionType,
                                                second: DependencyLineUnionType,
    ): number {
        const [firstScore, secondScore] = [first, second]
            .map(line => evaluateCalendarDependencyLine(line));
        return firstScore - secondScore;
    }
}
