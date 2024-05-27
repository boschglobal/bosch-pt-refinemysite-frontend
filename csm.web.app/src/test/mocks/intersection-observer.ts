/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ReplaySubject,
    Subscription
} from 'rxjs';

export const createMockIntersectionObserver = (intersectionTrigger$: ReplaySubject<IntersectionObserverEntry>): Function => {
    class MockIntersectionObserver {
        constructor(
            public callback: (entries: Array<IntersectionObserverEntry>) => void,
            public options?: IntersectionObserverInit
        ) {}

        private _disposableSubscriptions = new Subscription();

        public observe(): void {
            this._disposableSubscriptions.add(
                intersectionTrigger$.subscribe((entry: IntersectionObserverEntry) => {
                    this.callback([entry]);
                })
            );
        }

        public unobserve() {
            this._disposableSubscriptions.unsubscribe();
        }

        public disconnect() {}
    }

    return MockIntersectionObserver;
};

export const MOCK_INTERSECTION_OBSERVER_ENTRY: IntersectionObserverEntry = {
    intersectionRatio: 0.5,
    isIntersecting: true,
} as IntersectionObserverEntry;
