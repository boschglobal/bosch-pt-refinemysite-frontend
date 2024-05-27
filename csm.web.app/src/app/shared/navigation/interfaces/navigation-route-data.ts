/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    BreadcrumbRawItem,
    ROUTE_DATA_BREADCRUMB
} from '../components/breadcrumb-component/breadcrumb.component';
import {
    NavBarRawItem,
    ROUTE_DATA_NAVBAR
} from '../components/navbar-component/navbar.component';

export interface NavigationRouteData {
    [ROUTE_DATA_BREADCRUMB]?: BreadcrumbRawItem,
    [ROUTE_DATA_NAVBAR]?: NavBarRawItem[],
}
