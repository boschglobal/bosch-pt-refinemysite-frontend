/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {TestBed} from '@angular/core/testing';

import {FlyoutService} from './flyout.service';

describe('Flyout Service', () => {
    const testId = 'flyout';
    const testId2 = 'flyout2';
    let flyoutService: FlyoutService;

    beforeEach(() => flyoutService = TestBed.inject(FlyoutService));

    it('should be created', () => {
        expect(flyoutService).toBeTruthy();
    });

    it('should return true when a flyout is open', () => {
        expect(flyoutService.isFlyoutOpen(testId)).toBeFalsy();

        flyoutService.open(testId);

        expect(flyoutService.isFlyoutOpen(testId)).toBeTruthy();
    });

    it('should return false when a flyout is not open', () => {
        expect(flyoutService.isFlyoutOpen(testId)).toBeFalsy();
    });

    it('should only open flyout if id exists', () => {
        flyoutService.open(testId);

        expect(flyoutService.isFlyoutOpen(testId)).toBeTruthy();

        flyoutService.close(testId);

        expect(flyoutService.isFlyoutOpen(testId)).toBeFalsy();
    });

    it('should not set the same id if it exists already exits', () => {
        flyoutService.open(testId);
        flyoutService.open(testId);
        flyoutService.open(testId);

        expect(flyoutService.isFlyoutOpen(testId)).toBeTruthy();

        flyoutService.close(testId);

        expect(flyoutService.isFlyoutOpen(testId)).toBeFalsy();
    });

    it('should allow multiple flyouts to be opened and closed at the same time', () => {
        flyoutService.open(testId);
        flyoutService.open(testId2);

        expect(flyoutService.isFlyoutOpen(testId)).toBeTruthy();
        expect(flyoutService.isFlyoutOpen(testId2)).toBeTruthy();

        flyoutService.close(testId);
        flyoutService.close(testId2);

        expect(flyoutService.isFlyoutOpen(testId)).toBeFalsy();
        expect(flyoutService.isFlyoutOpen(testId2)).toBeFalsy();
    });

    it('should dispatch next open event and next close event when flyout is opened and closed', () => {
        spyOn(flyoutService.openEvents, 'next');
        spyOn(flyoutService.closeEvents, 'next');

        flyoutService.open(testId);
        expect(flyoutService.openEvents.next).toHaveBeenCalledWith(testId);

        flyoutService.close(testId);
        expect(flyoutService.closeEvents.next).toHaveBeenCalledWith(testId);
    });

    it('should not dispatch next open event when flyout is already open', () => {
        const spy = spyOn(flyoutService.openEvents, 'next');

        flyoutService.open(testId);
        expect(flyoutService.openEvents.next).toHaveBeenCalledWith(testId);

        spy.calls.reset();

        flyoutService.open(testId);
        expect(flyoutService.openEvents.next).not.toHaveBeenCalled();
    });

    it('should not dispatch next close event when flyout was already closed', () => {
        const spy = spyOn(flyoutService.closeEvents, 'next');

        flyoutService.open(testId);
        flyoutService.close(testId);

        expect(flyoutService.closeEvents.next).toHaveBeenCalledWith(testId);

        spy.calls.reset();

        flyoutService.close(testId);
        expect(flyoutService.closeEvents.next).not.toHaveBeenCalled();
    });

});
