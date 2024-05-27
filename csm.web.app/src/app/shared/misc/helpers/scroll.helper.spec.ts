/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Subscription} from 'rxjs';

import {ScrollHelper} from './scroll.helper';

describe('Scroll Helper', () => {
    let scrollHelper: ScrollHelper;

    const scrollEvent: Event = new Event('scroll');
    const disposableSubscription: Subscription = new Subscription();

    const moduleDef: TestModuleMetadata = {
        providers: [ScrollHelper]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => scrollHelper = TestBed.inject(ScrollHelper));

    afterEach(() => disposableSubscription.unsubscribe());

    it('should emit window scroll event', () => {
        disposableSubscription.add(scrollHelper.windowScrollChange$
            .subscribe((event: Event) => expect(event).toEqual(scrollEvent)));
        window.dispatchEvent(scrollEvent);
    });

    it('should emit scroll event of element', () => {
        disposableSubscription.add(scrollHelper.someScrollChange$
            .subscribe((event: Event) => expect(event).toEqual(scrollEvent)));
        document.body.dispatchEvent(scrollEvent);
    });

});
