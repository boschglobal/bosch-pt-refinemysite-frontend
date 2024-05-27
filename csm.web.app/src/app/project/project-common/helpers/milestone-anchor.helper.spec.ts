/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {TestBed} from '@angular/core/testing';

import {Point} from '../../../shared/misc/generic-types/point.type';
import {MilestoneAnchor} from './milestone-anchor.helper';

describe('Milestone Anchor Helper', () => {
    let milestoneAnchor: MilestoneAnchor;

    const milestoneMockedDOMRect = {x: 0, y: 0, width: 40, height: 40};

    beforeEach(() => milestoneAnchor = TestBed.inject(MilestoneAnchor));

    it('should retrieve source anchor coordinates', () => {
        const {x, y, height, width} = milestoneMockedDOMRect;
        const expectedCoordinates: Point = {
            x: x + width - 1,
            y: y + (height / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height, width});

            return element;
        });

        expect(milestoneAnchor.source('foo')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when source element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(milestoneAnchor.source('non-existing-milestone-id')).toBeNull();
    });

    it('should retrieve target anchor coordinates', () => {
        const {x, y, height, width} = milestoneMockedDOMRect;
        const expectedCoordinates: Point = {
            x,
            y: y + (height / 2),
        };

        spyOn(document, 'querySelector').and.callFake(() => {
            const element = document.createElement('div');

            spyOn(element, 'getBoundingClientRect').and.returnValue({x, y, height, width});

            return element;
        });

        expect(milestoneAnchor.target('foo')).toEqual(expectedCoordinates);
    });

    it('should retrieve null when target element is not found', () => {
        spyOn(document, 'querySelector').and.callFake(() => null);

        expect(milestoneAnchor.target('non-existing-milestone-id')).toBeNull();
    });

    it('should retrieve the yBase value for the line strategy when getYBaseByCalendarLineStrategy is called', () => {
        const expectedYBaseForGridLineStrategy = 8;

        expect(milestoneAnchor.getYBaseByCalendarLineStrategy('grid')).toEqual(expectedYBaseForGridLineStrategy);
        expect(milestoneAnchor.getYBaseByCalendarLineStrategy('line')).toBeUndefined();
    });
});
