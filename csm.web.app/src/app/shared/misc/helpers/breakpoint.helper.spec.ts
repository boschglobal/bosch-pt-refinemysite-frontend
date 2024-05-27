/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {first} from 'rxjs/operators';

import {updateWindowInnerWidth} from '../../../../test/helpers';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../ui/constants/breakpoints.constant';
import {BreakpointHelper} from './breakpoint.helper';

describe('Breakpoint Helper', () => {
    let breakpointHelper: BreakpointHelper;

    const resizeEvent: Event = new Event('resize');
    const initialInnerWidth: number = window.innerWidth;

    const moduleDef: TestModuleMetadata = {
        providers: [BreakpointHelper]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => breakpointHelper = TestBed.inject(BreakpointHelper));

    afterAll(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should emit breakpoint name when breakpoint changes', waitForAsync(() => {
        breakpointHelper
            .breakpointChange()
            .pipe(first())
            .subscribe((result: string) => {
                expect(result).toBe('xs');
            });

        updateWindowInnerWidth(breakpointsRange.xs.max);
        window.dispatchEvent(resizeEvent);
    }));

    it('should retrieve "xs" when currentBreakpoint is called and the window width is in the "xs" defined range', () => {
        updateWindowInnerWidth(breakpointsRange.xs.max);

        expect(breakpointHelper.currentBreakpoint()).toBe('xs');
    });

    it('should retrieve "lg" when currentBreakpoint is called and the window width is in the "lg" defined range', () => {
        updateWindowInnerWidth(breakpointsRange.lg.max);

        expect(breakpointHelper.currentBreakpoint()).toBe('lg');
    });

    it('should retrieve TRUE when isCurrentBreakpoint with "xs" range is called and the window width is in the "xs" defined range', () => {
        updateWindowInnerWidth(breakpointsRange.xs.max);

        expect(breakpointHelper.isCurrentBreakpoint(breakpointsRange.xs)).toBeTruthy();
    });

    it('should retrieve FALSE when isCurrentBreakpoint with "xs" range is called and the window width is not in the "xs" defined range', () => {
        updateWindowInnerWidth(breakpointsRange.lg.max);

        expect(breakpointHelper.isCurrentBreakpoint(breakpointsRange.xs)).toBeFalsy();
    });
});
