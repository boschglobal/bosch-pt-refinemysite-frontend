/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MarkerComponent} from './marker.component';
import {MarkerTestComponent} from './marker.test.component';

describe('Marker Component', () => {
    let fixture: ComponentFixture<MarkerTestComponent>;
    let testHostComp: MarkerTestComponent;
    let component: MarkerComponent;
    let de: DebugElement;

    const getElement = (selector: string) => fixture.debugElement.query(By.css(selector)).nativeElement;
    const markerHostSelector = 'ss-marker';
    const dataAutomationSelector = '[data-automation="marker"]';

    const moduleDef: TestModuleMetadata = {
        declarations: [MarkerComponent, MarkerTestComponent],
        imports: [BrowserAnimationsModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MarkerTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(markerHostSelector));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a ss-marker class', () => {
        expect(getElement(dataAutomationSelector).classList).toContain('ss-marker');
    });

    it('should add a critical modifier class when isCritical is set to true', () => {
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).toContain('ss-marker--critical');
    });

    it('should not add a critical modifier class when isCritical is set to false', () => {
        testHostComp.isCritical = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).not.toContain('ss-marker--critical');
    });

    it('should not animate marker when triggerAnimation is set to false', () => {
        testHostComp.triggerAnimation = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).toContain('ng-animate-disabled');
    });

    it('should animate marker when triggerAnimation is set to true', () => {
        testHostComp.triggerAnimation = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).not.toContain('ng-animate-disabled');
    });

    it('should add with-border class when border is set to true', () => {
        testHostComp.withBorder = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).toContain('ss-marker--with-border');
    });

    it('should not add with-border class when border is set to false', () => {
        testHostComp.withBorder = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).not.toContain('ss-marker--with-border');
    });

    it('should add a small modifier class when size is set to `small`', () => {
        testHostComp.size = 'small';
        fixture.detectChanges();

        expect(getElement(dataAutomationSelector).classList).toContain('ss-marker--small');
    });
});
