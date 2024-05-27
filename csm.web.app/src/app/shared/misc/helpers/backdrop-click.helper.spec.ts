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
    waitForAsync,
} from '@angular/core/testing';
import {Subscription} from 'rxjs';

import {
    BackdropClickEventTypeEnum,
    BackdropClickHelper,
} from './backdrop-click.helper';

describe('Backdrop Click Helper', () => {
    let backdropClickHelper: BackdropClickHelper;
    let disposableSubscription = new Subscription();

    const mouseDownEvent = new Event('mousedown');
    const mouseUpEvent = new Event('mouseup');
    const touchEndEvent = new Event('touchend');

    const moduleDef: TestModuleMetadata = {
        providers: [BackdropClickHelper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => backdropClickHelper = TestBed.inject(BackdropClickHelper));

    afterEach(() => {
        disposableSubscription.unsubscribe();
        disposableSubscription = new Subscription();
    });

    it('should emit the event when the body receives an mousedown event and the subscriber is observing an MouseDown event', () => {
        let emitted = false;
        const filterFunction = () => true;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emitted = true);

        document.dispatchEvent(mouseDownEvent);

        expect(emitted).toBeTruthy();
    });

    it('should emit the event when the body receives an mouseup event and the subscriber is observing an MouseUp event', () => {
        let emitted = false;
        const filterFunction = () => true;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseUp], filterFunction)
            .subscribe(() => emitted = true);

        document.dispatchEvent(mouseUpEvent);

        expect(emitted).toBeTruthy();
    });

    it('should emit the event when the body receives an touchend event and the subscriber is observing an TouchEnd event', () => {
        let emitted = false;
        const filterFunction = () => true;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.TouchEnd], filterFunction)
            .subscribe(() => emitted = true);

        document.dispatchEvent(touchEndEvent);

        expect(emitted).toBeTruthy();
    });

    it('should not emit the event when the body receives an mousedown event and the subscriber is observing an MouseUp event', () => {
        let emitted = false;
        const filterFunction = () => true;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseUp], filterFunction)
            .subscribe(() => emitted = true);

        document.dispatchEvent(mouseDownEvent);

        expect(emitted).toBeFalsy();
    });

    it('should not emit the event when the body receives an mousedown event and the filter function returned false', () => {
        let emitted = false;
        const filterFunction = () => false;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emitted = true);

        document.dispatchEvent(mouseDownEvent);

        expect(emitted).toBeFalsy();
    });

    it('should emit the event only to the latest subscriber when there are two subscribers observing the event', () => {
        let emittedFirst = false;
        let emittedSecond = false;
        const filterFunction = () => true;

        disposableSubscription.add(
            backdropClickHelper
                .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
                .subscribe(() => emittedFirst = true));

        disposableSubscription.add(
            backdropClickHelper
                .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
                .subscribe(() => emittedSecond = true));

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();
    });

    it('should emit the event to the first subscriber after emitting to the second one when ' +
        'there are two subscribers observing the event', () => {
        let emittedFirst = false;
        let emittedSecond = false;
        const filterFunction = () => true;

        disposableSubscription.add(
            backdropClickHelper
                .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
                .subscribe(() => emittedFirst = true));

        disposableSubscription.add(
            backdropClickHelper
                .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
                .subscribe(() => emittedSecond = true));

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeTruthy();
        expect(emittedSecond).toBeTruthy();
    });

    it('should not emit the event when the subscriber has unsubscribed in the meantime', () => {
        let emitted = false;
        const filterFunction = () => true;

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emitted = true);

        disposableSubscription.unsubscribe();

        document.dispatchEvent(mouseDownEvent);

        expect(emitted).toBeFalsy();
    });

    it('should not emit the event to the first subscriber after emitting to the second one when ' +
        'there are two subscribers observing the event and the first one has unsubscribed in the meantime', () => {
        let emittedFirst = false;
        let emittedSecond = false;
        const filterFunction = () => true;
        const oldestSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emittedFirst = true);

        disposableSubscription = backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emittedSecond = true);

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();

        oldestSubscription.unsubscribe();

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();
    });

    it('should not emit the event to the first subscriber after emitting to the second one when ' +
        'the first event is a DownEvent and the second one is a UpEvent', () => {
        let emittedFirst = false;
        let emittedSecond = false;
        const filterFunction = () => true;

        disposableSubscription.add(backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseUp], filterFunction)
            .subscribe(() => emittedFirst = true));

        disposableSubscription.add(backdropClickHelper
            .observe([BackdropClickEventTypeEnum.MouseDown], filterFunction)
            .subscribe(() => emittedSecond = true));

        document.dispatchEvent(mouseDownEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();

        document.dispatchEvent(mouseUpEvent);

        expect(emittedFirst).toBeFalsy();
        expect(emittedSecond).toBeTruthy();
    });
});
