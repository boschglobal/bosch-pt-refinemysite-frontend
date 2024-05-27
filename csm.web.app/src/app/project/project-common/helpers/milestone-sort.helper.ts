/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {WorkareaResource} from '../api/workareas/resources/workarea.resource';
import {Milestone} from '../models/milestones/milestone';

export class MilestoneSortHelper {

    public static sortByCalendarView(milestones: Milestone[], workareas: WorkareaResource[]): Milestone[] {
        return [...milestones]
            .sort(this.sortByWorkareaPlacementWrapperFn(workareas))
            .sort(this._sortByMilestoneDateFn);
    }

    public static sortByWorkareaPlacementWrapperFn(workareas: WorkareaResource[]): (a: Milestone, b: Milestone) => number {
        return (a: Milestone, b: Milestone) => {
            const workareaA = workareas.find(workarea => workarea.id === a.workArea?.id);
            const workareaB = workareas.find(workarea => workarea.id === b.workArea?.id);
            const bothOnHeader = a.header && b.header;
            const bothOnSameWA = !!workareaA && !!workareaB && workareaA.position === workareaB.position;
            const bothWithoutWA = !a.header && !b.header && !a.workArea && !b.workArea;
            const positionDiff = a.position - b.position;
            const aWorkareaPositionOnUIHigherThenB = !!workareaA && workareaA.position < (workareaB?.position || Number.MAX_VALUE);
            const aBeforeB = a.header || (!b.header && aWorkareaPositionOnUIHigherThenB) ? -1 : 1;

            return bothOnHeader || bothOnSameWA || bothWithoutWA
                ? positionDiff
                : aBeforeB;
        };
    }

    private static _sortByMilestoneDateFn({date: aDate}: Milestone, {date: bDate}: Milestone): number {
        const isEqual = aDate.isSame(bDate, 'd');
        const aIsBefore = aDate.isBefore(bDate, 'd') ? -1 : 1;

        return isEqual
            ? 0
            : aIsBefore;
    }
}
