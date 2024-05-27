/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
export class ScrollHelper {

    /**
     * @description Centralized stream of window scroll events
     * @description For performance reasons, the use of this stream is preferred over the creation of new listeners
     */

    public someScrollChange$: Subject<Event>;

    public windowScrollChange$: Subject<Event>;

    private _someScrollChangeOptions: AddEventListenerOptions = {
        capture: true,
        passive: true
    };

    private _windowScrollChangeOptions: AddEventListenerOptions = {
        passive: true
    };

    constructor(private _ngZone: NgZone) {
        this.someScrollChange$ = this._initialize(this._someScrollChangeOptions);
        this.windowScrollChange$ = this._initialize(this._windowScrollChangeOptions);
    }

    private _initialize(options?: AddEventListenerOptions): Subject<Event> {
        const observable: Subject<Event> = new Subject();

        this._ngZone.runOutsideAngular(() => fromEvent(window, 'scroll', options)
            .subscribe((ev: Event) => observable.next(ev)));

        return observable;
    }

}
