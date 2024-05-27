/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {PRIMARY_OUTLET} from '@angular/router';

@Component({
    selector: 'ss-navigation-tabs',
    templateUrl: './navigation-tabs.component.html',
    styleUrls: ['./navigation-tabs.component.scss'],
})
export class NavigationTabsComponent {

    /**
     * @description Input to define the tabs to be displayed
     * @type {NavigationTabsRoutes}
     */
    @Input()
    public routes: NavigationTabsRoutes[];

    /**
     * @description Input to define the router outlet name
     * @type {string}
     */
    @Input()
    public outlet: string = PRIMARY_OUTLET;

    /**
     * @description Return href for anchor tag
     * @param {NavigationTabsRoutes} route
     * @returns {any}
     */
    public getNavigationPath(route: NavigationTabsRoutes): any {
        return this.outlet === PRIMARY_OUTLET
            ? [route.link]
            : [{
                outlets: {
                    [this.outlet]: [route.link],
                },
            }];
    }
}

export interface NavigationTabsRoutes {
    link: string;
    label: string;
    disabled?: boolean;
    hasMarker?: boolean;
    queryParams?: object;
}
