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
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../test/mocks/store';
import {State} from '../../../app.reducers';
import {RealtimeActions} from '../../../shared/realtime/store/realtime.actions';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {CanDeactivateProjectCalendarGuard} from './can-deactivate-project-calendar.guard';

describe('Can Deactivate Project Calendar Guard', () => {
    let guard: CanDeactivateProjectCalendarGuard;
    let store: Store<State>;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(CanDeactivateProjectCalendarGuard);
        store = TestBed.inject(Store);
    });

    it('should allow deactivation of the route', () => {
        expect(guard.canDeactivate()).toBeTruthy();
    });

    it('should unset realtime updates context', () => {
        const expectedResult = new RealtimeActions.Unset.Context();

        spyOn(store, 'dispatch');

        guard.canDeactivate();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action to initialize Calendar focus', () => {
        const expectedResult = new CalendarScopeActions.Initialize.Focus();

        spyOn(store, 'dispatch');

        guard.canDeactivate();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
