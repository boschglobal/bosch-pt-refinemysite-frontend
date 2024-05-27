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
export class IntersectionObserverHelper {

    public observe(element: Element, options?: IntersectionObserverInit): Observable<IntersectionObserverEntry> {
        return new Observable((observer: Observer<IntersectionObserverEntry>) => {
            const callback: IntersectionObserverCallback =
                (entries: IntersectionObserverEntry[]) => {
                    for (const entry of entries) {
                        observer.next(entry);
                    }
                };

            const intersectionObserver: IntersectionObserver = new IntersectionObserver(callback, options);

            intersectionObserver.observe(element);

            return () => {
                this._unobserve(intersectionObserver);
            };
        });
    }

    private _unobserve(intersectionObserver: IntersectionObserver): void {
        intersectionObserver.disconnect();
    }
}
