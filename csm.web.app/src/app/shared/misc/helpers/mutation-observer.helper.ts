/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Observable,
    Observer
} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MutationObserverHelper {

    public observe(element: Element, options?: MutationObserverInit): Observable<MutationRecord[]> {

        return new Observable((observer: Observer<MutationRecord[]>) => {
            const callback: MutationCallback =
                (mutations: MutationRecord[], internalMutationObserver: MutationObserver) => observer.next(mutations);
            const mutationObserver: MutationObserver = new MutationObserver(callback);

            mutationObserver.observe(element, options);

            return () => {
                this._unobserve(mutationObserver);
            };
        });

    }

    private _unobserve(mutationObserver: MutationObserver): void {
        mutationObserver.disconnect();
    }
}
