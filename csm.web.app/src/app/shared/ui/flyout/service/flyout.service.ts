/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FlyoutService {

    public openEvents: Subject<string> = new Subject();

    public closeEvents: Subject<string> = new Subject();

    private _flyoutIds = [];

    public isFlyoutOpen(id: string): boolean {
        return this._flyoutIds.some((item) => item === id);
    }

    public open(id: string): void {
        this._setFlyoutId(id);
    }

    public close(id: string): void {
        this._unsetFlyout(id);
    }

    private _setFlyoutId(id: string) {
        if (!this._flyoutIds.includes(id)) {
            this._flyoutIds.push(id);
            this.openEvents.next(id);
        }
    }

    private _unsetFlyout(id: string) {
        const index = this._flyoutIds.indexOf(id);

        if (index !== -1) {
            this._flyoutIds.splice(index, 1);
            this.closeEvents.next(id);
        }
    }
}
