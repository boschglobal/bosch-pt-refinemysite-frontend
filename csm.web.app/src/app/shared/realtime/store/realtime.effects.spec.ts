/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    discardPeriodicTasks,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {RealtimeServiceStub} from '../../../../test/stubs/realtime-service.stub';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AlertActions} from '../../alert/store/alert.actions';
import {RealtimeService} from '../api/realtime.service';
import {
    REALTIME_EVENT_TIMEOUT_TIMER,
    RealtimeEffects
} from './realtime.effects';

describe('Realtime Effects', () => {
    let realtimeEffects: RealtimeEffects;

    const openConnection$: Subject<void> = new Subject<void>();
    const openEvents$: Subject<Event> = new Subject<Event>();
    const errorEvents$: Subject<Event> = new Subject<Event>();
    const openEvent: Event = new Event('');
    const errorEvent: Event = new Event('');

    const moduleDef: TestModuleMetadata = {
        providers: [
            RealtimeEffects,
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(null, openConnection$, openEvents$, errorEvents$),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        realtimeEffects = TestBed.inject(RealtimeEffects);
    });

    it('should trigger a AlertActions.Add.WarningAlert action only once after openConnection emits and ' +
        'the first connection error occurs', () => {
        const results: AlertActions.Add.WarningAlert[] = [];
        const expectedResult = new AlertActions.Add.WarningAlert({
            message: new AlertMessageResource('Realtime_UnavailableConnection_Message'),
        });

        realtimeEffects.connectionError$.subscribe((result: AlertActions.Add.WarningAlert) => {
            results.push(result);
        });

        openConnection$.next();
        errorEvents$.next(errorEvent);
        errorEvents$.next(errorEvent);

        expect(results.length).toBe(1);
        expect(results[0].type).toBe(expectedResult.type);
        expect(results[0].payload.message).toEqual(expectedResult.payload.message);
    });

    it('should trigger a AlertActions.Add.WarningAlert action only once after openConnection emits and ' +
        `connection open event does not occur in ${REALTIME_EVENT_TIMEOUT_TIMER} seconds timeframe`, fakeAsync(() => {
        const results: AlertActions.Add.WarningAlert[] = [];
        const expectedResult = new AlertActions.Add.WarningAlert({
            message: new AlertMessageResource('Realtime_UnavailableConnection_Message'),
        });

        realtimeEffects.connectionError$.subscribe((result: AlertActions.Add.WarningAlert) =>
            results.push(result));

        openConnection$.next();
        tick(REALTIME_EVENT_TIMEOUT_TIMER + 1);

        openEvents$.next();
        openEvents$.next();

        expect(results.length).toBe(1);
        expect(results[0].type).toBe(expectedResult.type);
        expect(results[0].payload.message).toEqual(expectedResult.payload.message);
    }));

    it('should not trigger a AlertActions.Add.WarningAlert action after openConnection emits ' +
        `but connection open event occurs within ${REALTIME_EVENT_TIMEOUT_TIMER} seconds timeframe`, fakeAsync(() => {
        const results = [];

        realtimeEffects.connectionError$.subscribe((result) =>
            results.push(result));

        openConnection$.next();
        tick(REALTIME_EVENT_TIMEOUT_TIMER - 1);

        openEvents$.next(openEvent);
        openEvents$.next(openEvent);

        expect(results).toEqual([]);
        discardPeriodicTasks();
    }));
});
