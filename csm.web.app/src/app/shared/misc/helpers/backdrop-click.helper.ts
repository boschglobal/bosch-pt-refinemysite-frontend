/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    fromEvent,
    merge,
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import {
    filter,
    finalize,
    skip,
} from 'rxjs/operators';

export enum BackdropClickEventTypeEnum {
    MouseUp = 'mouseup',
    MouseDown = 'mousedown',
    TouchEnd = 'touchend',
}

export interface BackdropClickSubscription {
    eventTypes: BackdropClickEventTypeEnum[];
    filterFunction: (event: Event) => boolean;
    subject: Subject<Event>;
}

@Injectable({
    providedIn: 'root',
})
export class BackdropClickHelper {

    private _subscriptions: BackdropClickSubscription[] = [];

    private _subscription = new Subscription();

    public observe(eventTypes: BackdropClickEventTypeEnum[], filterFunction: (event: Event) => boolean): Observable<Event> {
        const subject = new Subject<Event>();
        const backdropClickSubscription: BackdropClickSubscription = {
            eventTypes,
            filterFunction,
            subject,
        };

        this._subscriptions.push(backdropClickSubscription);
        this._subscribe(backdropClickSubscription);

        return subject.pipe(finalize(() => this._unsubscribe(backdropClickSubscription)));
    }

    private _subscribe(subscription: BackdropClickSubscription, skipFirstEvent = false): void {
        this._subscription.unsubscribe();

        if (!subscription) {
            return;
        }

        const {eventTypes, filterFunction, subject} = subscription;
        const skipCount = skipFirstEvent ? 1 : 0;
        const events = eventTypes.map(event => fromEvent(document, event));

        this._subscription = merge(...events)
            .pipe(
                skip(skipCount),
                filter(filterFunction))
            .subscribe(event => {
                const currentSubscription = this._subscriptions.pop();
                const nextSubscription = this._subscriptions[this._subscriptions.length - 1];
                const skipFirst = currentSubscription.eventTypes.includes(BackdropClickEventTypeEnum.MouseDown)
                    && nextSubscription?.eventTypes.includes(BackdropClickEventTypeEnum.MouseUp);

                this._subscribe(nextSubscription, skipFirst);
                subject.next(event);
            });
    }

    private _unsubscribe(currentSubscription: BackdropClickSubscription): void {
        const lastSubscription = this._subscriptions[this._subscriptions.length - 1];

        this._subscriptions = this._subscriptions.filter(subscription => currentSubscription !== subscription);

        if (lastSubscription === currentSubscription) {
            this._subscribe(this._subscriptions[this._subscriptions.length - 1]);
        }
    }
}
