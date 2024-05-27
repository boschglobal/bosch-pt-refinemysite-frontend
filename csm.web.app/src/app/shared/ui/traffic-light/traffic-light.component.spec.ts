/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {COLORS} from '../constants/colors.constant';
import {DIMENSIONS} from '../constants/dimensions.constant';
import {UIModule} from '../ui.module';
import {
    TrafficLightComponent,
    TrafficLightSettings
} from './traffic-light.component';

describe('Traffic Light Component', () => {
    let fixture: ComponentFixture<TrafficLightComponent>;
    let comp: TrafficLightComponent;
    let de: DebugElement;

    const defaultComponentValue = 15;
    const defaultComponentSize = DIMENSIONS.base_dimension__x2;
    const defaultComponentSettings: TrafficLightSettings = {
        size: 30,
        ranges: [
            {min: 0, max: 10, color: COLORS.red},
            {min: 11, max: 20, color: COLORS.yellow},
            {min: 21, max: 30, color: COLORS.light_green},
        ]
    };

    const dataAutomationSelectorTrafficLight = '[data-automation="ss-traffic-light"]';
    const dataAutomationSelectorTrafficLightCircle = '[data-automation="ss-traffic-light-circle"]';
    const cssClassTrafficLightEmpty = 'ss-traffic-light--empty';
    const getElement = (selector: string) => {
        return document.querySelector(selector);
    };
    const getNativeElement = (selector: string) => {
        return de.query(By.css(selector)).nativeElement;
    };
    const moduleDef: TestModuleMetadata = {
        imports: [UIModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrafficLightComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should render a specific traffic light color for a given value', () => {
        const expectedResult = COLORS.yellow;

        comp.value = defaultComponentValue;
        comp.settings = defaultComponentSettings;

        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorTrafficLightCircle).getAttribute('fill')).toEqual(expectedResult);
    });

    it('should render a traffic light with the default size dimension', () => {
        const expectedResult = `${defaultComponentSize}px`;

        comp.value = defaultComponentValue;
        comp.settings = Object.assign({}, defaultComponentSettings, {size: null});

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTrafficLight).style.width).toEqual(expectedResult);
        expect(getNativeElement(dataAutomationSelectorTrafficLight).style.height).toEqual(expectedResult);
    });

    it('should render a traffic light with the specified size dimension', () => {
        const size = 100;
        const expectedResult = `${size}px`;

        comp.value = defaultComponentValue;
        comp.settings = Object.assign({}, defaultComponentSettings, {size});

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTrafficLight).style.width).toEqual(expectedResult);
        expect(getNativeElement(dataAutomationSelectorTrafficLight).style.height).toEqual(expectedResult);
    });

    it('should return null fill color when a given value does not met any range', () => {
        comp.value = 1000;
        comp.settings = defaultComponentSettings;

        expect(comp.getFillColor()).toBeNull();
    });

    it('should return the correct styles', () => {
        const size = 100;
        const expectedResult = {width: `${size}px`, height: `${size}px`};

        comp.value = defaultComponentValue;
        comp.settings = Object.assign({}, defaultComponentSettings, {size});

        expect(comp.getStyles()).toEqual(expectedResult);
    });

    it('should have ss-traffic-light--empty CSS class when the value is NULL', () => {
        comp.value = null;
        comp.settings = defaultComponentSettings;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTrafficLight).classList).toContain(cssClassTrafficLightEmpty);
    });

    it('should not have ss-traffic-light--empty CSS class when the value is numeric', () => {
        comp.value = 20;
        comp.settings = defaultComponentSettings;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTrafficLight).classList).not.toContain(cssClassTrafficLightEmpty);
    });

});
