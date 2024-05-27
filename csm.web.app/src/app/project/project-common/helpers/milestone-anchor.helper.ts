/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {Point} from '../../../shared/misc/generic-types/point.type';
import {CalendarDependencyLineStrategyType} from '../../../shared/ui/calendar/calendar/calendar.component';
import {MILESTONE_ID_PREFIX} from '../containers/milestone/milestone.component';

@Injectable({
    providedIn: 'root',
})
export class MilestoneAnchor {

    private _yBaseByCalendarStrategy: { [key in CalendarDependencyLineStrategyType]?: number } = {
        ['grid']: 8,
    };

    public source(id: string): Point | null {
        const sourceElement = this._getAnchorElement(id);

        if (!sourceElement) {
            return null;
        }

        const {x, y, height, width} = sourceElement.getBoundingClientRect();

        return {
            x: x + width - 1,
            y: y + (height / 2),
        };
    }

    public target(id: string): Point | null {
        const sourceElement = this._getAnchorElement(id);

        if (!sourceElement) {
            return null;
        }

        const {x, y, height} = sourceElement.getBoundingClientRect();

        return {
            x,
            y: y + (height / 2),
        };
    }

    public getYBaseByCalendarLineStrategy(strategy: CalendarDependencyLineStrategyType): number {
        return this._yBaseByCalendarStrategy[strategy];
    }

    private _getAnchorElement(id: string): Element | null {
        return document.querySelector(`#${MILESTONE_ID_PREFIX}${id} ss-milestone-marker`);
    }
}
