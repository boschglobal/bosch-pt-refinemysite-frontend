/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    ElementRef,
    HostListener,
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
import {
    Observable,
    Subscription
} from 'rxjs';
import {
    filter,
    take
} from 'rxjs/operators';

import {FeatureToggleEnum} from '../../../../../configurations/feature-toggles/feature-toggle.enum';
import {State} from '../../../../app.reducers';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {FeatureToggleHelper} from '../../../misc/helpers/feature-toggle.helper';
import {ScrollHelper} from '../../../misc/helpers/scroll.helper';
import {BreakpointsEnum} from '../../../ui/constants/breakpoints.constant';

export const ROUTE_DATA_NAVBAR = 'menu';

@Component({
    selector: 'ss-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {

    /**
     * @description Array of arrays of the navBar item
     * @type {NavBarItem}
     */
    public navBar: NavBarItem[][];

    /**
     * @description Flag to know if the navigation bar is open
     * @type {boolean}
     */
    public isNavBarOpen = false;

    /**
     * @description Property with user information
     */
    public user: ResourceReferenceWithPicture;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _distanceToTop: number;

    @ViewChild('nav', {static: true})
    public nav: ElementRef;

    @HostListener('document:click', ['$event'])
    private _offClickHandler(event: Event) {
        event.stopPropagation();
        this.isNavBarOpen = false;
        this._manageScroll();
    }

    @HostListener('window:resize')
    private _handleResize() {
        this._setDistanceToTop();
        this._manageScroll();
    }

    constructor(private _featureToggleHelper: FeatureToggleHelper,
                private _router: Router,
                private _scrollHelper: ScrollHelper,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._setNavBar();
        this._setDistanceToTop();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Retrieves a unique identifier for each item
     * @param {number} index
     * @param {NavBarItem} item
     * @returns {number}
     */
    public trackByFn(index: number, item: NavBarItem): number {
        return index;
    }

    /**
     * @description Triggered when dropdown is opened
     * @param {Event} event
     */
    public toggleNavBarPanel(event: Event): void {
        event.stopPropagation();
        this.isNavBarOpen = !this.isNavBarOpen;

        this._manageScroll();
    }

    /**
     * @description Retrieve icon for expandable list
     * @returns {string}
     */
    public getNavBarIcon(): string {
        return this.isNavBarOpen ? 'close' : 'menu';
    }

    /**
     * @description Retrieves nav bar style
     * @returns {Object}
     */
    public getNavStyle(): Object {
        return this.isNavBarOpen || window.innerWidth >= BreakpointsEnum.sm ? {
            height: `${window.innerHeight - this._distanceToTop}px`,
        } : {};
    }

    public shouldHideScroll(): boolean {
        return this.isNavBarOpen && window.innerWidth <= BreakpointsEnum.sm;
    }

    private _setDistanceToTop(): void {
        this._distanceToTop = this.nav.nativeElement.getBoundingClientRect().top;
    }

    private _manageScroll(): void {
        if (this.shouldHideScroll()) {
            this._hideScroll();
        } else {
            this._showScroll();
        }
    }

    private _hideScroll(): void {
        document.body.classList.add('no-scroll');
    }

    private _showScroll(): void {
        if (document.body.classList.contains('no-scroll')) {
            document.body.classList.remove('no-scroll');
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd))
                .subscribe(() => this._setNavBar())
        );

        this._disposableSubscriptions.add(
            this._scrollHelper.windowScrollChange$
                .subscribe(() => this._setDistanceToTop())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setNavBar(): void {
        const root: ActivatedRoute = this._router.routerState.root;

        this.navBar = this._getNavBar(root);
    }

    private _getNavBar(route: ActivatedRoute, navBar: NavBarItem[][] = []): NavBarItem[][] {
        const children: ActivatedRoute[] = route.children;

        if (!children.length) {
            return navBar;
        }

        for (const child of children) {
            if (child.outlet !== PRIMARY_OUTLET) {
                continue;
            }

            if (!this._hasNavBarData(child)) {
                return this._getNavBar(child, navBar);
            }

            const navBarItemsItems: NavBarItem[] = this._getActiveNavBar(child);

            navBar.push(navBarItemsItems);

            return this._getNavBar(child, navBar);
        }

        return navBar;
    }

    private _hasNavBarData(activatedRoute: ActivatedRoute): boolean {
        return activatedRoute.snapshot.data.hasOwnProperty(ROUTE_DATA_NAVBAR);
    }

    private _getActiveNavBar(activatedRoute: ActivatedRoute): NavBarItem[] {
        const navBarRaw = activatedRoute.snapshot.data[ROUTE_DATA_NAVBAR];
        const navBar: NavBarItem[] = [];

        for (const item of navBarRaw) {
            const entry: NavBarItem = {
                dynamicLabel: item.dynamicLabel ? this._getObservable(activatedRoute, item.dynamicLabel) : null,
                staticLabel: item.staticLabel ? item.staticLabel : null,
                url: typeof item.url === 'string' ? item.url : item.url(this._store),
                icon: item.icon,
                permissions: typeof item.permissions === 'boolean'
                    ? item.permissions
                    : this._hasPermission(this._getObservable(activatedRoute, item.permissions)),
                isFeatureActive: Array.isArray(item.features) ?
                    item.features.every(feature => this._featureToggleHelper.isFeatureActive(feature))
                    : true,
                exact: item.exact,
            };

            if (entry.permissions && entry.isFeatureActive) {
                navBar.push(entry);
            }
        }

        return navBar;
    }

    private _hasPermission(permissionObservable: Observable<any>): boolean {
        let permission = false;

        permissionObservable.pipe(
            take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();

        return permission;
    }

    private _getObservable(activatedRoute: ActivatedRoute, observableFunction: Function): Observable<any> {
        const getFilterFunction: Function = observableFunction;
        const hasFilterFunction = typeof getFilterFunction !== 'undefined';

        return hasFilterFunction ? this._store.pipe(select(getFilterFunction(activatedRoute.snapshot.params))) : null;
    }
}

export interface NavBarItem {
    dynamicLabel?: Observable<string>;
    staticLabel?: string;
    url: string;
    icon: string;
    exact: boolean;
    permissions: boolean;
    isFeatureActive?: boolean;
}

export interface NavBarRawItem {
    dynamicLabel?: (params: Params) => Function;
    staticLabel?: string;
    url: string | ((store: Store<State>) => string);
    icon: string;
    exact?: boolean;
    permissions: boolean | ((params: Params) => Function);
    features?: FeatureToggleEnum[];
}
