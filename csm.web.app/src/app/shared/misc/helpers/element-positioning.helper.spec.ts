/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {
    updateWindowInnerHeight,
    updateWindowInnerWidth
} from '../../../../test/helpers';
import {ElementPositioningHelper} from './element-positioning.helper';

describe('Element Positioning Helper', () => {
    const getElement = (width: number, height: number, top: number, left: number) => {
        return {
            getBoundingClientRect(): ClientRect | DOMRect {
                return {
                    width,
                    height,
                    top,
                    left,
                } as DOMRect;
            },
        } as Element;
    };

    const initialInnerHeight: number = window.innerHeight;
    const initialInnerWidth: number = window.innerWidth;
    const trigger: Element = getElement(100, 100, 200, 200);
    const component: Element = getElement(50, 50, 0, 0);
    const largeComponent: Element = getElement(250, 250, 0, 0);
    const triggerAtTopLeft: Element = getElement(100, 100, 0, 0);
    const triggerAtBottomLeft: Element = getElement(100, 100, window.innerHeight - 100, 0);
    const triggerAtTopRight: Element = getElement(100, 100, 0, window.innerWidth - 100);

    const moduleDef: TestModuleMetadata = {};

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    afterEach(() => {
        updateWindowInnerHeight(initialInnerHeight);
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should get correct coordinates when positioning element to above aligned to start', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'above');
        const expectedResult = {
            x: 200,
            y: 150,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to center', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'above');
        const expectedResult = {
            x: 225,
            y: 150,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to end', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'above');
        const expectedResult = {
            x: 250,
            y: 150,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to below aligned to start', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'below');
        const expectedResult = {
            x: 200,
            y: 300,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to center', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'below');
        const expectedResult = {
            x: 225,
            y: 300,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to end', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'below');
        const expectedResult = {
            x: 250,
            y: 300,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to start', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'left');
        const expectedResult = {
            x: 150,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to center', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'left');
        const expectedResult = {
            x: 150,
            y: 225,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to end', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'left');
        const expectedResult = {
            x: 150,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to start', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'right');
        const expectedResult = {
            x: 300,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to center', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'right');
        const expectedResult = {
            x: 300,
            y: 225,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to end', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'right');
        const expectedResult = {
            x: 300,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to start and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'above', true);
        const expectedResult = {
            x: 200,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to center and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'above', true);
        const expectedResult = {
            x: 225,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to above aligned to end and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'above', true);
        const expectedResult = {
            x: 250,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to below aligned to start and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'below', true);
        const expectedResult = {
            x: 200,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to below aligned to center and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'below', true);
        const expectedResult = {
            x: 225,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to below aligned to end and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'below', true);
        const expectedResult = {
            x: 250,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to start and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'left', true);
        const expectedResult = {
            x: 250,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to center and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'left', true);
        const expectedResult = {
            x: 250,
            y: 225,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to left aligned to end and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'left', true);
        const expectedResult = {
            x: 250,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to start and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'start', 'right', true);
        const expectedResult = {
            x: 200,
            y: 200,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to center and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'center', 'right', true);
        const expectedResult = {
            x: 200,
            y: 225,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should get correct coordinates when positioning element to right aligned to end and hover the trigger', () => {
        const positioner = new ElementPositioningHelper(trigger, component, 'end', 'right', true);
        const expectedResult = {
            x: 200,
            y: 250,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should normalize x and y value when it\'s not possible to apply the correct fallback position at placement ' +
        'bottom/left corner', () => {
        const positioner = new ElementPositioningHelper(trigger, largeComponent, 'start', 'below');
        const expectedResult = {
            x: 42,
            y: 42,
        };

        updateWindowInnerHeight(300);
        updateWindowInnerWidth(300);

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should normalize x and y value when it\'s not possible to apply the correct fallback position at placement top/left corner', () => {
        const positioner = new ElementPositioningHelper(triggerAtTopLeft, largeComponent, 'end', 'left');
        const expectedResult = {
            x: 42,
            y: 8,
        };

        updateWindowInnerHeight(300);
        updateWindowInnerWidth(300);

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should fallback to position \'below\' when position \'above\' does not have space to fit component', () => {
        const positioner = new ElementPositioningHelper(triggerAtTopLeft, component, 'start', 'above');
        const triggerRect = triggerAtTopLeft.getBoundingClientRect();
        const expectedResult = {
            x: triggerRect.left,
            y: triggerRect.height,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);

    });

    it('should fallback to position \'above\' when position \'below\' does not have space to fit component', () => {
        const positioner = new ElementPositioningHelper(triggerAtBottomLeft, component, 'start', 'below');
        const triggerRect = triggerAtBottomLeft.getBoundingClientRect();
        const componentRect = component.getBoundingClientRect();
        const expectedResult = {
            x: triggerRect.left,
            y: triggerRect.top - componentRect.height,
        };
        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should fallback to position \'right\' when position \'left\' does not have space to fit component', () => {
        const positioner = new ElementPositioningHelper(triggerAtTopLeft, component, 'start', 'left');
        const triggerRect = triggerAtTopLeft.getBoundingClientRect();
        const expectedResult = {
            x: triggerRect.width,
            y: triggerRect.top,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should fallback to position \'left\' when position \'right\' does not have space to fit component', () => {
        const positioner = new ElementPositioningHelper(triggerAtTopRight, component, 'start', 'right');
        const triggerRect = triggerAtTopRight.getBoundingClientRect();
        const componentRect = component.getBoundingClientRect();
        const expectedResult = {
            x: triggerRect.left - componentRect.width,
            y: triggerRect.top,
        };

        expect(positioner.getCoordinates()).toEqual(expectedResult);
    });

    it('should use same placement strategy if previous strategy was not defined as \'normalized\' and ' +
        'component still fits the view', () => {
        const positionerAbove = new ElementPositioningHelper(trigger, component, 'start', 'above');
        const positionerBelow = new ElementPositioningHelper(trigger, component, 'start', 'below');
        const expectedResultAbove = positionerAbove.getCoordinates();
        const expectedResultBelow = positionerBelow.getCoordinates();

        expect(positionerAbove.getCoordinates()).toEqual(expectedResultAbove);
        expect(positionerBelow.getCoordinates()).toEqual(expectedResultBelow);

        updateWindowInnerHeight(1000);
        updateWindowInnerWidth(1000);

        expect(positionerAbove.getCoordinates()).toEqual(expectedResultAbove);
        expect(positionerBelow.getCoordinates()).toEqual(expectedResultBelow);
    });

    it('should use different placement strategy if previous strategy was not defined as \'normalized\' and ' +
        'component doesn\'t fit the view anymore', () => {
        const positionerRight = new ElementPositioningHelper(trigger, component, 'start', 'right');
        const positionerBelow = new ElementPositioningHelper(trigger, component, 'start', 'below');
        const expectedResultRight = positionerRight.getCoordinates();
        const expectedResultBelow = positionerBelow.getCoordinates();

        expect(positionerRight.getCoordinates()).toEqual(expectedResultRight);
        expect(positionerBelow.getCoordinates()).toEqual(expectedResultBelow);

        updateWindowInnerHeight(300);
        updateWindowInnerWidth(300);

        expect(positionerRight.getCoordinates()).not.toEqual(expectedResultRight);
        expect(positionerBelow.getCoordinates()).not.toEqual(expectedResultBelow);
    });

    it('should use different placement strategy when trigger changed position and previous strategy was \'normalized\'', () => {
        const positioner = new ElementPositioningHelper(trigger, largeComponent, 'start', 'below');

        updateWindowInnerHeight(300);
        updateWindowInnerWidth(300);

        const coordinatesNormalized = positioner.getCoordinates();

        updateWindowInnerHeight(initialInnerHeight);
        updateWindowInnerWidth(initialInnerWidth);

        const coordinates = positioner.getCoordinates();

        expect(coordinatesNormalized).not.toEqual(coordinates);
    });
});
