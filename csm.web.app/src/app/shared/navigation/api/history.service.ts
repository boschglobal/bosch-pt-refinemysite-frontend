/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    NavigationEnd,
    Router
} from '@angular/router';
import {
    filter,
    pairwise
} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {

    private _history: string[] = ['/'];

    private _canSkipHistory = false;

    private _skipHistory = false;

    /**
     * @description Retrieve length of the list
     * @returns {number}
     */
    public get length() {
        return this._history.length;
    }

    constructor(private _router: Router) {
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                pairwise())
            .subscribe((events: [NavigationEnd, NavigationEnd]) => {
                this._canSkipHistory = true;
                this._pushHistory(events);
            });
    }

    /**
     * @description Add entry to history at the bottom of the list
     * @param url
     */
    public pushState(url: string): void {
        const lastUrl: string = this._history[this.length - 1];

        if (url !== lastUrl) {
            this._history.push(url);
        }
    }

    /**
     * @description Remove last entry from history and return it
     * @returns {undefined|string}
     */
    public popState(): string {
        return this._history.pop();
    }

    /**
     * @description Navigates back in history
     */
    public back(): void {
        if (this.length) {
            this._skipHistory = this._canSkipHistory;
            this._router.navigateByUrl(this.popState());
        }
    }

    private _pushHistory(events: NavigationEnd[]): void {
        const theaterIdentifier = '(theater:';

        if (!this._skipHistory
            && events[0].url.indexOf(theaterIdentifier) < 0
            && events[1].url.indexOf(theaterIdentifier) < 0) {
            this.pushState(events[0].url);
        }

        this._skipHistory = false;
    }
}
