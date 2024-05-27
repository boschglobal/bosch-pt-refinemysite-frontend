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
import {take} from 'rxjs/operators';

import {MOCK_RESIZE_OBSERVER_ENTRY} from '../../../../test/mocks/resize-observer';
import {ResizeObserverHelper} from './resize-observer.helper';

describe('Resize Observer Helper', () => {
    let resizeObserver: ResizeObserverHelper;

    const moduleDef: TestModuleMetadata = {
        providers: [ResizeObserverHelper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => resizeObserver = TestBed.inject(ResizeObserverHelper));

    it('should keep track of some given element resize changes', () => {
        const newWidth = MOCK_RESIZE_OBSERVER_ENTRY.contentRect.width;
        const element = document.body;
        const options: ResizeObserverOptions = {box: 'content-box'};

        resizeObserver.observe(element, options)
            .pipe(
                take(1)
            )
            .subscribe(entry =>
                expect(entry.contentRect.width).toBe(newWidth)
            );

        element.style.width = `${newWidth}px`;
    });

});
