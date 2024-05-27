/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {TestBed} from '@angular/core/testing';

import {Point} from '../../../shared/misc/generic-types/point.type';
import {TaskCardWeekAnchor} from './task-card-week-anchor.helper';

describe('Task Card Week Anchor Helper', () => {
    let taskCardWeekAnchor: TaskCardWeekAnchor;

    const taskCardWeekMockedDOMRect = {x: 0, y: 0, width: 200, height: 40};

    beforeEach(() => taskCardWeekAnchor = TestBed.inject(TaskCardWeekAnchor));

    it('should retrieve source anchor coordinates', () => {
        const {x, y, height, width} = taskCardWeekMockedDOMRect;
        const expectedCoordinates: Point = {
            x: x + width,
            y: y + (height / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height, width});

            return element;
        });

        expect(taskCardWeekAnchor.source('foo', '')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when source element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(taskCardWeekAnchor.source('non-existing-task-id', '')).toBeNull();
    });

    it('should retrieve target anchor coordinates', () => {
        const {x, y, height, width} = taskCardWeekMockedDOMRect;
        const expectedCoordinates: Point = {
            x,
            y: y + (height / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height, width});

            return element;
        });

        expect(taskCardWeekAnchor.target('foo', '')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when target element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(taskCardWeekAnchor.target('non-existing-task-id', '')).toBeNull();
    });
});
