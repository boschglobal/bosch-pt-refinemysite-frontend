/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {TestBed} from '@angular/core/testing';

import {Point} from '../../../shared/misc/generic-types/point.type';
import {TASK_CARD_WEEK_DIMENSIONS} from '../containers/task-card-week/task-card-week.constant';
import {TaskCardWeekPlaceholderAnchor} from './task-card-week-placeholder-anchor.helper';

describe('Task Card Week Placeholder Anchor Helper', () => {
    let taskCardWeekPlaceholderAnchor: TaskCardWeekPlaceholderAnchor;

    const {durationSpacer, durationHeight} = TASK_CARD_WEEK_DIMENSIONS;
    const taskCardWeekPlaceholderMockedDOMRect = {x: 0, y: 0, width: 200, height: 40};

    beforeEach(() => taskCardWeekPlaceholderAnchor = TestBed.inject(TaskCardWeekPlaceholderAnchor));

    it('should retrieve source anchor coordinates', () => {
        const {x, y, height, width} = taskCardWeekPlaceholderMockedDOMRect;
        const expectedCoordinates: Point = {
            x: x + width,
            y: y + height + durationSpacer - (durationHeight / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height, width});

            return element;
        });

        expect(taskCardWeekPlaceholderAnchor.source('foo')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when source element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(taskCardWeekPlaceholderAnchor.source('non-existing-task-id')).toBeNull();
    });

    it('should retrieve target anchor coordinates', () => {
        const {x, y, height} = taskCardWeekPlaceholderMockedDOMRect;
        const expectedCoordinates: Point = {
            x,
            y: y + height + durationSpacer - (durationHeight / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height});

            return element;
        });

        expect(taskCardWeekPlaceholderAnchor.target('foo')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when target element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(taskCardWeekPlaceholderAnchor.target('non-existing-task-id')).toBeNull();
    });
});
