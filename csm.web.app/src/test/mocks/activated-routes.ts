/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {UrlSegment} from '@angular/router';

import {ROUTE_DATA_BREADCRUMB} from '../../app/shared/navigation/components/breadcrumb-component/breadcrumb.component';
import {ROUTE_DATA_NAVBAR} from '../../app/shared/navigation/components/navbar-component/navbar.component';
import {ActivatedRouteStub} from '../stubs/activated-route.stub';

const ACTIVATED_ROUTE_1 = new ActivatedRouteStub();
const ACTIVATED_ROUTE_2 = new ActivatedRouteStub();
const ACTIVATED_ROUTE_3 = new ActivatedRouteStub();
const ACTIVATED_ROUTE_4 = new ActivatedRouteStub();
const ACTIVATED_ROUTE_5 = new ActivatedRouteStub();
export const ACTIVATED_ROUTE_BASE = new ActivatedRouteStub();

ACTIVATED_ROUTE_1.children = [ACTIVATED_ROUTE_2];
ACTIVATED_ROUTE_1.data = {
    [ROUTE_DATA_BREADCRUMB]: {staticLabel: 'message_foo'},
    [ROUTE_DATA_NAVBAR]: [
        {
            dynamicLabel: () => (state: any) => 'dynamicLabel',
            icon: 'folder',
            url: () => (state: any) => 'url_url',
            permissions: true,
            exact: true,
        },
        {
            staticLabel: 'Project_Dashboard_TasksLabel',
            icon: 'tasks',
            url: () => (state: any) => 'url_url',
            permissions: () => (state: any) => true,
        },
    ],
};
ACTIVATED_ROUTE_1.url = [new UrlSegment('foo', {})];
ACTIVATED_ROUTE_1.pathFromRoot = [ACTIVATED_ROUTE_1];

ACTIVATED_ROUTE_2.children = [ACTIVATED_ROUTE_3];
ACTIVATED_ROUTE_2.data = {[ROUTE_DATA_BREADCRUMB]: {dynamicLabel: () => (state: any) => state.userSlice.items[0].firstName}};
ACTIVATED_ROUTE_2.url = [new UrlSegment('123', {})];
ACTIVATED_ROUTE_2.pathFromRoot = [ACTIVATED_ROUTE_1, ACTIVATED_ROUTE_2];

ACTIVATED_ROUTE_3.children = [ACTIVATED_ROUTE_4];
ACTIVATED_ROUTE_3.data = {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'message_bar'}};
ACTIVATED_ROUTE_3.url = [new UrlSegment('bar', {})];
ACTIVATED_ROUTE_3.pathFromRoot = [ACTIVATED_ROUTE_1, ACTIVATED_ROUTE_2, ACTIVATED_ROUTE_3];

ACTIVATED_ROUTE_4.url = [new UrlSegment('456', {})];
ACTIVATED_ROUTE_4.pathFromRoot = [ACTIVATED_ROUTE_1, ACTIVATED_ROUTE_2, ACTIVATED_ROUTE_3, ACTIVATED_ROUTE_4];

ACTIVATED_ROUTE_5.outlet = 'secondary';
ACTIVATED_ROUTE_5.url = [new UrlSegment('detail', {})];
ACTIVATED_ROUTE_5.pathFromRoot = [ACTIVATED_ROUTE_1];

ACTIVATED_ROUTE_BASE.children = [ACTIVATED_ROUTE_5, ACTIVATED_ROUTE_1];
ACTIVATED_ROUTE_BASE.url = [new UrlSegment('', {})];
