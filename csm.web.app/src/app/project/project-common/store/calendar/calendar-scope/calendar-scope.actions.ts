/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import * as moment from 'moment';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';

export enum CalendarScopeActionEnum {
    InitializeAll = '[Calendar Scope] Initialize all',
    InitializeFocus = '[Calendar Scope] Initialize focus',
    InitializeScopeParameters = '[Calendar Scope] Initialize scope parameters',
    ResolveFocus = '[Calendar Scope] Resolve focus',
    ResolveFocusFulfilled = '[Calendar Scope] Resolve focus fulfilled',
    ResolveNavigateToElement = '[Calendar Scope] Resolve navigate to element',
    ResolveNavigateToElementFulfilled = '[Calendar Scope] Resolve navigate to element fulfilled',
    SetExpandedWeeks = '[Calendar Scope] Set expanded weeks',
    SetFocus = '[Calendar Scope] Set focus',
    SetMode = '[Calendar Scope] Set mode',
    SetStart = '[Calendar Scope] Set start',
    SetScopeParameters = '[Calendar Scope] Set scope parameters',
}

export namespace CalendarScopeActions {

    export namespace Initialize {

        export class All implements Action {
            public readonly type = CalendarScopeActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class Focus implements Action {
            public readonly type = CalendarScopeActionEnum.InitializeFocus;

            constructor() {
            }
        }

        export class ScopeParameters implements Action {
            public readonly type = CalendarScopeActionEnum.InitializeScopeParameters;

            constructor() {
            }
        }
    }

    export namespace Resolve {
        export class Focus implements Action {
            public readonly type = CalendarScopeActionEnum.ResolveFocus;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class FocusFulfilled implements Action {
            public readonly type = CalendarScopeActionEnum.ResolveFocusFulfilled;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class NavigateToElement implements Action {
            public readonly type = CalendarScopeActionEnum.ResolveNavigateToElement;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class NavigateToElementFulfilled implements Action {
            public readonly type = CalendarScopeActionEnum.ResolveNavigateToElementFulfilled;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }
    }

    export namespace Set {

        export class ExpandedWeeks implements Action {
            public readonly type = CalendarScopeActionEnum.SetExpandedWeeks;

            constructor(public payload: moment.Moment[]) {
            }
        }

        export class Focus implements Action {
            public readonly type = CalendarScopeActionEnum.SetFocus;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class Mode implements Action {
            public readonly type = CalendarScopeActionEnum.SetMode;

            constructor(public payload: TasksCalendarModeEnum) {
            }
        }

        export class ScopeParameters implements Action {
            public readonly type = CalendarScopeActionEnum.SetScopeParameters;

            constructor(public payload: CalendarScopeParameters) {
            }
        }

        export class Start implements Action {
            public readonly type = CalendarScopeActionEnum.SetStart;

            constructor(public payload: moment.Moment) {
            }
        }
    }
}

export type CalendarScopeActions =
    CalendarScopeActions.Initialize.All |
    CalendarScopeActions.Initialize.Focus |
    CalendarScopeActions.Initialize.ScopeParameters |
    CalendarScopeActions.Resolve.Focus |
    CalendarScopeActions.Resolve.FocusFulfilled |
    CalendarScopeActions.Resolve.NavigateToElement |
    CalendarScopeActions.Resolve.NavigateToElementFulfilled |
    CalendarScopeActions.Set.ExpandedWeeks |
    CalendarScopeActions.Set.Focus |
    CalendarScopeActions.Set.Mode |
    CalendarScopeActions.Set.Start |
    CalendarScopeActions.Set.ScopeParameters;
