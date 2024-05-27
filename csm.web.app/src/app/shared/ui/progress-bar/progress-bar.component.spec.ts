/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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

import {ProgressBarComponent} from './progress-bar.component';

describe('Progress Bar Component', () => {
    let fixture: ComponentFixture<ProgressBarComponent>;
    let comp: ProgressBarComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const loadingBarSelector = '[data-automation="ss-progress-bar"]';
    const determinateLoadingBarSelector = '[data-automation="ss-progress-determinate-bar"]';
    const indeterminateLoadingBarSelector = '[data-automation="ss-progress-indeterminate-bar"]';

    const moduleDef: TestModuleMetadata = {
        declarations: [ProgressBarComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProgressBarComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should show the determinate loading bar if we receive a percentage', () => {
        comp.percentage = 88;
        fixture.detectChanges();

        expect(el.querySelector(determinateLoadingBarSelector)).not.toBeNull();
    });

    it('should not show the determinate loading bar if we receive a null percentage', () => {
        comp.percentage = null;
        fixture.detectChanges();

        expect(el.querySelector(determinateLoadingBarSelector)).toBeNull();
    });

    it('should show the indeterminate loading bar if we receive a null percentage', () => {
        comp.percentage = null;
        fixture.detectChanges();

        expect(el.querySelector(indeterminateLoadingBarSelector)).not.toBeNull();
    });

    it('should not show the indeterminate loading bar we receive a percentage', () => {
        comp.percentage = 88;
        fixture.detectChanges();

        expect(el.querySelector(indeterminateLoadingBarSelector)).toBeNull();
    });

    it('should show loading bar border if showBarBorder is true and we receive a percentage', () => {
        comp.showBarBorder = true;
        comp.percentage = 88;
        fixture.detectChanges();

        expect(el.querySelector(loadingBarSelector).outerHTML).toContain('ss-progress-bar--has-border');
    });

    it('should show loading bar border if showBarBorder is true and we receive a null percentage', () => {
        comp.showBarBorder = true;
        comp.percentage = null;
        fixture.detectChanges();

        expect(el.querySelector(loadingBarSelector).outerHTML).toContain('ss-progress-bar--has-border');
    });

    it('should not show loading bar border if showBarBorder is false', () => {
        comp.showBarBorder = false;
        fixture.detectChanges();

        expect(el.querySelector(loadingBarSelector).innerHTML).not.toContain('ss-progress-bar--has-border');
    });

    it('should show the determinate loading bar with the received percentage as width', () => {
        comp.percentage = 88;
        fixture.detectChanges();

        expect(el.querySelector(determinateLoadingBarSelector)).not.toBeNull();
        expect(el.querySelector(determinateLoadingBarSelector).outerHTML).toContain('style="width: 88%;"');
    });

    it('should set percentageValue to 100 if percentage is bigger than 100', () => {
        comp.percentage = 110;
        fixture.detectChanges();

        expect(comp.percentageValue).toBe(100);
    });

    it('should set percentageValue to 0.1 if percentage is lower than 0', () => {
        comp.percentage = -1;
        fixture.detectChanges();

        expect(comp.percentageValue).toBe(0);
    });

    it('should set percentageValue', () => {
        comp.percentage = 88;
        fixture.detectChanges();

        expect(comp.percentageValue).toBe(88);
    });

});
