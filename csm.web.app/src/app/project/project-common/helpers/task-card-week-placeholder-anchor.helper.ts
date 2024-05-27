/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {Point} from '../../../shared/misc/generic-types/point.type';
import {TASK_CARD_WEEK_DIMENSIONS} from '../containers/task-card-week/task-card-week.constant';
import {TASK_CARD_WEEK_PLACEHOLDER_ID_PREFIX} from '../presentationals/task-card-week-placeholder/task-card-week-placeholder.component';

@Injectable({
    providedIn: 'root',
})
export class TaskCardWeekPlaceholderAnchor {
    public source(id: string): Point | null {
        const sourceElement = this._getAnchorElement(id);
        const {durationHeight, durationSpacer} = TASK_CARD_WEEK_DIMENSIONS;

        if (!sourceElement) {
            return null;
        }

        const {x, y, height, width} = sourceElement.getBoundingClientRect();

        return {
            x: x + width,
            y: y + height + durationSpacer - (durationHeight / 2),
        };
    }

    public target(id: string): Point | null {
        const targetElement = this._getAnchorElement(id);
        const {durationHeight, durationSpacer} = TASK_CARD_WEEK_DIMENSIONS;

        if (!targetElement) {
            return null;
        }

        const {x, y, height} = targetElement.getBoundingClientRect();

        return {
            x,
            y: y + height + durationSpacer - (durationHeight / 2),
        };
    }

    private _getAnchorElement(id: string): Element | null {
        return document.querySelector(`#${TASK_CARD_WEEK_PLACEHOLDER_ID_PREFIX}${id}`);
    }
}
