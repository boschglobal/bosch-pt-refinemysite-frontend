/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ReplaySubject} from 'rxjs';

import {
    createMockIntersectionObserver,
    MOCK_INTERSECTION_OBSERVER_ENTRY
} from '../../../../test/mocks/intersection-observer';
import {IntersectionObserverHelper} from './intersection-observer.helper';

describe('Intersection Observer Helper', () => {
    let intersectionObserverHelper: IntersectionObserverHelper;
    let intersectionTrigger$: ReplaySubject<IntersectionObserverEntry>;

    const moduleDef: TestModuleMetadata = {
        providers: [
            IntersectionObserverHelper,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        intersectionTrigger$ = new ReplaySubject<IntersectionObserverEntry>(1);

        (window as any).IntersectionObserver = createMockIntersectionObserver(intersectionTrigger$);

        intersectionObserverHelper = TestBed.inject(IntersectionObserverHelper);
    });

    it('should notify the intersection of an element', (done) => {
        const element = document.body;
        const options: IntersectionObserverInit = {root: document.body};
        const observer = intersectionObserverHelper.observe(element, options);

        intersectionTrigger$.next(MOCK_INTERSECTION_OBSERVER_ENTRY);

        observer.subscribe((intersectionEntry) => {
            expect(intersectionEntry).toBe(MOCK_INTERSECTION_OBSERVER_ENTRY);
            done();
        });
    });
});
