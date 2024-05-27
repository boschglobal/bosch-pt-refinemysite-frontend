/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Observable,
    Observer
} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ResizeObserverHelper {

    public observe(element: Element, options?: ResizeObserverOptions): Observable<ResizeObserverEntry> {

        return new Observable((observer: Observer<ResizeObserverEntry>) => {
            const callback: ResizeObserverCallback =
                (entries: ResizeObserverEntry[]) => {
                    for (const entry of entries) {
                        observer.next(entry);
                    }
                };

            const resizeObserver: ResizeObserver = new ResizeObserver(callback);

            resizeObserver.observe(element, options);

            return () => {
                this._unobserve(resizeObserver, element);
            };
        });

    }

    private _unobserve(resizeObserver: ResizeObserver, element: Element): void {
        resizeObserver.unobserve(element);
    }
}
