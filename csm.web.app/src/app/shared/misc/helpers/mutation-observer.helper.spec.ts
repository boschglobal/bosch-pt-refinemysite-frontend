/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {MutationObserverHelper} from './mutation-observer.helper';

describe('Mutation Observer Helper', () => {
    let mutationObserver: MutationObserverHelper;

    const moduleDef: TestModuleMetadata = {
        providers: [MutationObserverHelper]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => mutationObserver = TestBed.inject(MutationObserverHelper));

    it('should keep track of DOM element changes', (done) => {
        let mutations = 0;
        const element = document.body;
        const options: MutationObserverInit = {attributes: true};
        const observer = mutationObserver.observe(element, options);
        const subscription = observer.subscribe(() => mutations++);

        element.classList.add('mutation-observer-test-class');

        setTimeout(() => {
            expect(mutations).toBe(1);
            subscription.unsubscribe();
            element.classList.remove('mutation-observer-test-class');
            done();
        }, 0);
    });

});
