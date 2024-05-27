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
import {TASK_CARD_WEEK_ID_PREFIX} from '../containers/task-card-week/task-card-week.component';

@Injectable({
    providedIn: 'root',
})
export class TaskCardWeekAnchor {

    private _yBaseByCalendarStrategy: { [key in CalendarDependencyLineStrategyType]?: number } = {
        ['grid']: 4,
    };

    public source(id: string, contextSelector: string): Point | null {
        const sourceElement = this._getAnchorElement(id, contextSelector);

        if (!sourceElement) {
            return null;
        }

        const {x, y, height, width} = sourceElement.getBoundingClientRect();

        return {
            x: x + width,
            y: y + (height / 2),
        };
    }

    public target(id: string, contextSelector: string): Point | null {
        const targetElement = this._getAnchorElement(id, contextSelector);

        if (!targetElement) {
            return null;
        }

        const {x, y, height} = targetElement.getBoundingClientRect();

        return {
            x,
            y: y + (height / 2),
        };
    }

    public getYBaseByCalendarLineStrategy(strategy: CalendarDependencyLineStrategyType): number {
        return this._yBaseByCalendarStrategy[strategy];
    }

    private _getAnchorElement(id: string, contextSelector: string): Element | null {
        const selector = `${contextSelector} #${TASK_CARD_WEEK_ID_PREFIX}${id} .ss-task-card-week__duration-indicator`;

        return document.querySelector(selector);
    }
}
