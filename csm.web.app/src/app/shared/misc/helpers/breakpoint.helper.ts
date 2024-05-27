/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    fromEvent,
    Observable
} from 'rxjs';
import {
    distinctUntilChanged,
    map
} from 'rxjs/operators';

import {
    BreakpointRange,
    BREAKPOINTS_RANGE
} from '../../ui/constants/breakpoints.constant';

@Injectable({
    providedIn: 'root',
})
export class BreakpointHelper {

    /**
     * @description Retrieves Observable of name of breakpoints that emits when breakpoint changes
     * @returns {Observable<string>}
     */
    public breakpointChange(): Observable<string> {
        return fromEvent(window, 'resize')
            .pipe(
                map(() => this.currentBreakpoint()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves name of current breakpoints
     * @returns {undefined|string}
     */
    public currentBreakpoint(): string {
        const windowWidth = window.innerWidth;

        return Object.keys(BREAKPOINTS_RANGE).find((breakpointName: string) => {
            return this.isCurrentBreakpoint(BREAKPOINTS_RANGE[breakpointName], windowWidth);
        });
    }

    /**
     * @description Retrieves whether specified breakpointRange is currently active
     * @param breakpointRange
     * @param windowWidth
     */
    public isCurrentBreakpoint({min, max}: BreakpointRange, windowWidth = window.innerWidth): boolean {
        return windowWidth >= min && windowWidth <= max;
    }
}
