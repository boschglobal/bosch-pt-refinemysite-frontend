/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    fromEvent,
    merge,
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {MutationObserverHelper} from '../../misc/helpers/mutation-observer.helper';
import {ScrollHelper} from '../../misc/helpers/scroll.helper';
import {OPEN_FLYOUT_CSS_CLASS} from '../../ui/flyout/directive/flyout.directive';
import {StickyElement} from './resources/sticky-element.datatype';

export const STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES = [OPEN_FLYOUT_CSS_CLASS, 'no-scroll'];

@Injectable({
    providedIn: 'root',
})
export class StickyService {

    private _stickies: StickyElement[] = [];

    constructor(private _mutationObserverHelper: MutationObserverHelper,
                private _scrollHelper: ScrollHelper) {
        this._setSubscriptions();
    }

    /**
     * @description Registers an element to be sticky
     * @param {StickyElement} stickyElement
     */
    public register(stickyElement: StickyElement): void {
        this._stickies.push(stickyElement);
    }

    /**
     * @description Unregisters an element with give id
     * @param {string} id
     */
    public unregister(id: string): void {
        this._stickies = this._stickies.filter((sticky: StickyElement) => sticky.id !== id);
    }

    private _setSubscriptions(): void {
        const $scrollEvent = this._scrollHelper.windowScrollChange$;

        const $resizeEvent = fromEvent(window, 'resize');

        const $documentBodyObserver = this._mutationObserverHelper.observe(document.body, {
            attributeFilter: ['class'],
            attributeOldValue: true
        })
            .pipe(
                filter((event: MutationRecord[]) =>
                    event.some(record => {
                        const recordClassList = Array.from((record.target as Element).classList);
                        const allowedClassWasAdded = recordClassList
                            .some(recordClassName => STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES.includes(recordClassName));
                        const allowedClassWasRemoved = STICKY_UPDATE_TRIGGER_DOCUMENT_BODY_CLASSES.includes(record.oldValue);

                        return allowedClassWasAdded || allowedClassWasRemoved;
                    })),
                filter((event: MutationRecord[]) => !!event.length));

        const $events = merge(
            $scrollEvent,
            $resizeEvent,
            $documentBodyObserver,
        );

        $events.subscribe(() => {
            this._stickies.forEach((stickyElement: StickyElement) => stickyElement.updateSticky());
        });
    }
}
