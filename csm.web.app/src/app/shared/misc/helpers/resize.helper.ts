/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Injectable,
    NgZone
} from '@angular/core';
import {
    fromEvent,
    Subject
} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ResizeHelper {
    /**
     * @description Centralized stream of window resize events
     * @description For performance reasons, the use of this stream is preferred over the creation of new listeners
     */
    public events$: Subject<void | Event> = new Subject<void | Event>();

    constructor(private _ngZone: NgZone) {
        this._initialize();
    }

    public triggerResize(event?: Event): void {
        this.events$.next(event);
    }

    private _initialize(): void {
        this._ngZone.runOutsideAngular(() => {
            fromEvent(window, 'resize')
                .subscribe((event: Event) => this.events$.next(event));
        });
    }
}
