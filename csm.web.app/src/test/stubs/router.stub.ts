/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    NavigationEnd,
    NavigationExtras,
    UrlTree
} from '@angular/router';
import {
    Observable,
    Subject
} from 'rxjs';

import {ACTIVATED_ROUTE_BASE} from '../mocks/activated-routes';

export class RouterStub {

    public ne = new NavigationEnd(0, 'foo/123/bar/456', 'foo/123/bar/456');

    private _subject: Subject<NavigationEnd> = new Subject();

    private _routerState = {root: ACTIVATED_ROUTE_BASE};

    public get routerState() {
        return this._routerState;
    }

    public get events(): Observable<NavigationEnd> {
        return this._subject;
    }

    public navigate(url: string) {
        this._subject.next(new NavigationEnd(0, url, url));

        return new Promise((resolve, reject) => {
            resolve(url);
        });
    }

    public navigateByUrl(url: string) {
        this._subject.next(new NavigationEnd(0, url, url));

        return new Promise((resolve, reject) => {
            resolve(url);
        });
    }

    public createUrlTree(commands: any[], navigationExtras?: NavigationExtras): UrlTree {
        return new UrlTree();
    }

    public serializeUrl(url: UrlTree): string {
        return '';
    }
}
