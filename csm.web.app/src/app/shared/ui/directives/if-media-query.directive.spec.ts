/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ChangeDetectorRef} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ResizeHelper} from '../../misc/helpers/resize.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../constants/breakpoints.constant';
import {IfMediaQueryDirective} from './if-media-query.directive';
import {IfMediaQueryTestComponent} from './if-media-query.test.component';

describe('If Media Query Directive', () => {
    let fixture: ComponentFixture<IfMediaQueryTestComponent>;
    let comp: IfMediaQueryTestComponent;
    let changeDetectorRef: ChangeDetectorRef;
    let resizeHelper: ResizeHelper;

    const initialInnerWidth: number = window.innerWidth;

    function updateWindowInnerWidth(width: number): void {
        Object.defineProperty(window, 'innerWidth', {
            get: () => width,
        });

        resizeHelper.triggerResize();
    }

    function getNumberOfRenderedElements(): number {
        return fixture.debugElement.queryAll(By.css('span')).length;
    }

    const moduleDef: TestModuleMetadata = {
        declarations: [
            IfMediaQueryDirective,
            IfMediaQueryTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IfMediaQueryTestComponent);
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        resizeHelper = fixture.componentRef.injector.get(ResizeHelper);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    afterAll(() => {
        fixture.destroy();
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should enforce change detection when the host of the directive toggles visibility', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        updateWindowInnerWidth(breakpointsRange.xs.min);
        fixture.detectChanges();

        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should display 2 elements in xs resolution', () => {
        updateWindowInnerWidth(breakpointsRange.xs.min);
        fixture.detectChanges();
        expect(getNumberOfRenderedElements()).toBe(2);
    });

    it('should display 2 elements in sm resolution', () => {
        updateWindowInnerWidth(breakpointsRange.sm.min);
        fixture.detectChanges();
        expect(getNumberOfRenderedElements()).toBe(2);
    });

    it('should display 3 elements in md resolution', () => {
        updateWindowInnerWidth(breakpointsRange.md.min);
        fixture.detectChanges();
        expect(getNumberOfRenderedElements()).toBe(3);
    });

    it('should display 2 elements in lg resolution', () => {
        updateWindowInnerWidth(breakpointsRange.lg.min);
        fixture.detectChanges();
        expect(getNumberOfRenderedElements()).toBe(2);
    });

    it('should display 2 elements in xl resolution', () => {
        updateWindowInnerWidth(breakpointsRange.xl.min);
        fixture.detectChanges();
        expect(getNumberOfRenderedElements()).toBe(2);
    });
});
