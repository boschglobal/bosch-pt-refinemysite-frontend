/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Directive,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import {Subscription} from 'rxjs';

import {ResizeHelper} from '../../misc/helpers/resize.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../constants/breakpoints.constant';

const DEFAULT_WINDOW_WIDTH_RANGE: WindowWidthRange = {
    min: 0,
    max: Infinity,
};

@Directive({
    selector: '[ssIfMediaQuery]',
})
export class IfMediaQueryDirective implements OnInit, OnDestroy {

    /**
     * @description Sets the window width range in which the content should appear
     * @param windowWidthRangeDescriptor
     */
    @Input()
    public set ssIfMediaQuery(windowWidthRangeDescriptor: WindowWidthRangeDescriptor) {
        this._windowWidthRanges = Array.isArray(windowWidthRangeDescriptor)
            ? this._getWindowWidthRangesFromArray(windowWidthRangeDescriptor)
            : [windowWidthRangeDescriptor];
    }

    private _isShown = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _windowWidth: number;

    private _windowWidthRanges: WindowWidthRange[] = [DEFAULT_WINDOW_WIDTH_RANGE];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _resizeHelper: ResizeHelper,
                private _templateRef: TemplateRef<any>,
                private _viewContainer: ViewContainerRef) {
    }

    ngOnInit() {
        this._setEventListeners();
        this._setInitialWidth();
        this._setVisibility();
    }

    ngOnDestroy() {
        this._unsetEventListeners();
    }

    private _setEventListeners(): void {
        this._disposableSubscriptions.add(
            this._resizeHelper.events$.subscribe(() => this._handleWindowResize())
        );
    }

    private _unsetEventListeners(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setInitialWidth(): void {
        this._windowWidth = window.innerWidth;
    }

    private _handleWindowResize(): void {
        this._windowWidth = window.innerWidth;
        this._setVisibility();
    }

    private _setVisibility(): void {
        const canShow = this._canShow();
        if (canShow && !this._isShown) {
            this._viewContainer.createEmbeddedView(this._templateRef);
            this._isShown = true;
            this._changeDetectorRef.detectChanges();
        } else if (!canShow && this._isShown) {
            this._viewContainer.clear();
            this._isShown = false;
            this._changeDetectorRef.detectChanges();
        }
    }

    private _canShow(): boolean {
        return this._windowWidthRanges.some(this._isInRange.bind(this));
    }

    private _isInRange(windowRange: WindowWidthRange): boolean {
        return this._windowWidth >= windowRange.min && this._windowWidth <= windowRange.max;
    }

    private _getWindowWidthRangesFromArray(breakpointNames: BreakpointName[]): WindowWidthRange[] {
        return breakpointNames.map(breakpointName => breakpointsRange[breakpointName]);
    }
}

type BreakpointName = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface WindowWidthRange {
    min: number;
    max: number;
}

type WindowWidthRangeDescriptor = WindowWidthRange | BreakpointName[];
