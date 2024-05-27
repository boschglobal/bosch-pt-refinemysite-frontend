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
import {UIModule} from '../ui.module';
import {
    TrafficLightWithLabelComponent,
    TrafficLightWithLabelSettings
} from './traffic-light-with-label.component';

describe('Traffic Light With Label Component', () => {
    let fixture: ComponentFixture<TrafficLightWithLabelComponent>;
    let comp: TrafficLightWithLabelComponent;
    let de: DebugElement;

    const defaultValue = '20';
    const defaultSettings: TrafficLightWithLabelSettings = {
        valueFormatter: (value) => `${value} %`,
        size: 30,
        ranges: [
            {min: 0, max: 10, color: COLORS.red},
            {min: 11, max: 20, color: COLORS.yellow},
            {min: 21, max: 30, color: COLORS.light_green},
        ]
    };

    const trafficLightValueSelector = '[data-automation="ss-traffic-light-with-label-value"]';

    const getTrafficLightValueSelector = () => de.query(By.css(trafficLightValueSelector));

    const moduleDef: TestModuleMetadata = {
        imports: [UIModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrafficLightWithLabelComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should render the correct value', () => {
        const expectedResult = defaultValue;

        comp.value = defaultValue;

        fixture.detectChanges();

        expect(getTrafficLightValueSelector().nativeElement.innerText).toEqual(expectedResult);
    });

    it('should render the correct value when a formatting value function is passed', () => {
        const expectedResult = `${defaultValue} %`;

        comp.value = defaultValue;
        comp.settings = defaultSettings;

        fixture.detectChanges();

        expect(getTrafficLightValueSelector().nativeElement.innerText).toEqual(expectedResult);
    });
});
