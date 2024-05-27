/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {CalendarScopeActions} from './calendar-scope.actions';
import {CALENDAR_SCOPE_SLICE_INITIAL_STATE} from './calendar-scope.initial-state';
import {CALENDAR_SCOPE_REDUCER} from './calendar-scope.reducer';
import {CalendarScopeSlice} from './calendar-scope.slice';

describe('Calendar Scope Reducer', () => {
    let initialState: CalendarScopeSlice;
    let nextState: CalendarScopeSlice;
    let midState: CalendarScopeSlice;

    const object = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');

    beforeEach(() => {
        initialState = CALENDAR_SCOPE_SLICE_INITIAL_STATE;
        midState = cloneDeep(CALENDAR_SCOPE_SLICE_INITIAL_STATE);
        nextState = cloneDeep(CALENDAR_SCOPE_SLICE_INITIAL_STATE);
    });

    it('should handle CalendarScopeActions.InitializeAll action', () => {
        const action = new CalendarScopeActions.Initialize.All();

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle CalendarScopeActions.Initialize.Focus action', () => {
        const action = new CalendarScopeActions.Initialize.Focus();

        midState.focus = object;
        midState.focusResolveStatus = RequestStatusEnum.progress;
        midState.navigateToElement = object;

        expect(CALENDAR_SCOPE_REDUCER(midState, action)).toEqual(initialState);
    });

    it('should handle CalendarScopeActions.Initialize.ScopeParameters action', () => {
        const scopeParameters: CalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            mode: TasksCalendarModeEnum.EighteenWeeks,
            start: moment(),
        });
        const action = new CalendarScopeActions.Initialize.ScopeParameters();

        midState.scopeParameters = scopeParameters;

        expect(CALENDAR_SCOPE_REDUCER(midState, action)).toEqual(initialState);
    });

    it('should handle CalendarScopeActions.Resolve.Focus action', () => {
        const action = new CalendarScopeActions.Resolve.Focus(object);

        nextState.focusResolveStatus = RequestStatusEnum.progress;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Resolve.FocusFulfilled action', () => {
        const action = new CalendarScopeActions.Resolve.FocusFulfilled(object);

        nextState.focus = object;
        nextState.focusResolveStatus = RequestStatusEnum.success;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Resolve.NavigateToElementFulfilled action', () => {
        const action = new CalendarScopeActions.Resolve.NavigateToElementFulfilled(object);

        nextState.navigateToElement = object;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Set.ExpandedWeeks action', () => {
        const expandedWeeks = [moment()];
        const action = new CalendarScopeActions.Set.ExpandedWeeks(expandedWeeks);

        nextState.expandedWeeks = expandedWeeks;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Set.Focus action', () => {
        const action = new CalendarScopeActions.Set.Focus(object);

        nextState.focus = object;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Set.ScopeParameters action', () => {
        const scopeParameters: CalendarScopeParameters = Object.assign(new CalendarScopeParameters(), {
            mode: TasksCalendarModeEnum.EighteenWeeks,
            start: moment(),
        });
        const action = new CalendarScopeActions.Set.ScopeParameters(scopeParameters);

        nextState.scopeParameters = scopeParameters;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Set.Start action', () => {
        const start = moment();
        const action = new CalendarScopeActions.Set.Start(start);

        nextState.scopeParameters.start = start;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarScopeActions.Set.Mode action', () => {
        const mode = TasksCalendarModeEnum.EighteenWeeks;
        const action = new CalendarScopeActions.Set.Mode(mode);

        nextState.scopeParameters.mode = mode;

        expect(CALENDAR_SCOPE_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle unknown action type', () => {
        const defaultAction: Action = {type: 'DEFAULT'};

        expect(CALENDAR_SCOPE_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });
});
