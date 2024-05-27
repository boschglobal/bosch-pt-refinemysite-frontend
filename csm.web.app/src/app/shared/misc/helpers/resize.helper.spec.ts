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

import {ResizeHelper} from './resize.helper';

describe('Resize Helper', () => {
    let resizeHelper: ResizeHelper;

    const resizeEvent: Event = new Event('resize');
    const mockEvent: Event = new Event('mock');

    const moduleDef: TestModuleMetadata = {
        providers: [ResizeHelper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => resizeHelper = TestBed.inject(ResizeHelper));

    it('should expose stream of window resize events', waitForAsync(() => {
        spyOn(resizeHelper.events$, 'next').and.callThrough();

        window.dispatchEvent(resizeEvent);

        expect(resizeHelper.events$.next).toHaveBeenCalledWith(resizeEvent);
    }));

    it('should trigger an event in the events stream with undefined when triggerResize is called without event', waitForAsync(() => {
        spyOn(resizeHelper.events$, 'next').and.callThrough();

        resizeHelper.triggerResize();

        expect(resizeHelper.events$.next).toHaveBeenCalledWith(undefined);
    }));

    it('should trigger an event in the events stream with an event value when triggerResize is called with event', waitForAsync(() => {
        spyOn(resizeHelper.events$, 'next').and.callThrough();

        resizeHelper.triggerResize(mockEvent);

        expect(resizeHelper.events$.next).toHaveBeenCalledWith(mockEvent);
    }));
});
