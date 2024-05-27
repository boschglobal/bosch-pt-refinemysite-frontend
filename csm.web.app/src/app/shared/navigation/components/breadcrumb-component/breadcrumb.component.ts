/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Params,
    PRIMARY_OUTLET,
    Router
} from '@angular/router';
import {
    select,
    Store
} from '@ngrx/store';
import {flatMapDeep} from 'lodash';
import {
    Observable,
    Subscription
} from 'rxjs';
import {
    debounceTime,
    filter,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {ResizeHelper} from '../../../misc/helpers/resize.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../../ui/constants/breakpoints.constant';
import {COLORS} from '../../../ui/constants/colors.constant';
import {HistoryService} from '../../api/history.service';

export const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

@Component({
    selector: 'ss-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

    /**
     * @description Property to get breadcrumbPath view
     */
    @ViewChild('breadcrumbPath', {static: false})
    public set breadcrumbPath(element: ElementRef) {
        if (element) {
            this._breadcrumbPathElement = element;
        }
    }

    /**
     * @description Property with all the breadcrumbs
     * @type {Array}
     */
    public breadcrumbs: Breadcrumb[] = [];

    /**
     * @description Color of the path separator icon
     * @type {string}
     */
    public pathSeparatorColor: string = COLORS.dark_grey_75;

    /**
     * @description Flag to manage navigation history state
     * @type {boolean}
     */
    public hasNavigationHistory = false;

    /**
     * @description Flag to manage breadcrumb visibility
     * @type {boolean}
     */
    public showBreadcrumb = false;

    /**
     * @description Flag to manage external content visibility
     * @type {boolean}
     */
    public showContent = false;

    private _breadcrumbPathElement: ElementRef;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _breakpointHelper: BreakpointHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _historyService: HistoryService,
                private _resizeHelper: ResizeHelper,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._setBreadcrumbs();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleNavigateBack(): void {
        this._historyService.back();
    }

    public trackByFn(index: number, item: Breadcrumb): string {
        return item.url;
    }

    private _setBreadcrumbs(): void {
        const root: ActivatedRoute = this._router.routerState.root;

        this.breadcrumbs = this._getBreadcrumbs(root);

        this._updateNavigationHistoryState();
        this._setBreadcrumbVisibility();
        this._setBreadcrumbScroll();
    }

    private _getBreadcrumbs(route: ActivatedRoute): Breadcrumb[] {
        const getChildBreadcrumbs = (breadcrumb) => breadcrumb.outlet !== PRIMARY_OUTLET ? [] : breadcrumb.children;
        const recursiveFn = (breadcrumb: any) => [breadcrumb, flatMapDeep(getChildBreadcrumbs(breadcrumb), recursiveFn)];

        const flatBreadcrumbsPaths: ActivatedRoute[] = flatMapDeep(route.children, recursiveFn);
        const filteredFlatBreadcrumbsPaths: ActivatedRoute[] = flatBreadcrumbsPaths
            .filter((breadcrumb: ActivatedRoute) => this._hasBreadcrumbData(breadcrumb));

        return filteredFlatBreadcrumbsPaths
            .slice(0, filteredFlatBreadcrumbsPaths.length - 1)
            .map((breadcrumb: ActivatedRoute) => ({
                staticLabel: this._getActivatedRouteStaticLabel(breadcrumb),
                dynamicLabel: this._getActivatedRouteDynamicLabel(breadcrumb),
                url: this._getActivatedRouteFullURL(breadcrumb)
            }));
    }

    private _setBreadcrumbScroll(): void {
        if (!this.showBreadcrumb || !this._breadcrumbPathElement) {
            return;
        }

        this._breadcrumbPathElement.nativeElement.scroll({
            left: !this._breakpointHelper.isCurrentBreakpoint(breakpointsRange.xs)
                ? this._breadcrumbPathElement.nativeElement.scrollWidth
                : 0,
            behavior: 'smooth',
        });
    }

    private _setBreadcrumbVisibility(): void {
        this.showBreadcrumb = !!this.breadcrumbs.length;
        this.showContent = !this.showBreadcrumb;

        this._changeDetectorRef.detectChanges();
    }

    private _updateNavigationHistoryState(): void {
        this.hasNavigationHistory = !!this._historyService.length;
    }

    private _hasBreadcrumbData(activatedRoute: ActivatedRoute): boolean {
        return activatedRoute.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB);
    }

    private _getActivatedRouteStaticLabel(activatedRoute: ActivatedRoute): string {
        return activatedRoute.snapshot.data[ROUTE_DATA_BREADCRUMB].staticLabel;
    }

    private _getActivatedRouteDynamicLabel(activatedRoute: ActivatedRoute): Observable<string> {
        const getFilterFunction: Function = activatedRoute.snapshot.data[ROUTE_DATA_BREADCRUMB].dynamicLabel;
        const hasFilterFunction = typeof getFilterFunction !== 'undefined';

        return hasFilterFunction ? this._store.pipe(select(getFilterFunction(activatedRoute.snapshot.params))) : null;
    }

    private _getActivatedRouteFullURL(activatedRoute: ActivatedRoute): string {
        return activatedRoute.pathFromRoot
            .map(route => route.snapshot.url.map(segment => segment.path).join('/')).join('/');
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(() => this._setBreadcrumbs()));

        this._disposableSubscriptions.add(
            this._resizeHelper.events$
                .pipe(
                    filter(() => this.showBreadcrumb),
                    debounceTime(300))
                .subscribe(() => this._setBreadcrumbScroll()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface Breadcrumb {
    staticLabel?: string;
    dynamicLabel?: Observable<string>;
    url: string;
}

export interface BreadcrumbRawItem {
    staticLabel?: string;
    dynamicLabel?: (params: Params) => Function;
}
