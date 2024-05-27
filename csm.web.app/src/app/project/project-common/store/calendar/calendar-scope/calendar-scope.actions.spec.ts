/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CalendarScopeActionEnum,
    CalendarScopeActions,
} from './calendar-scope.actions';

describe('Calendar Scope Actions', () => {
    it('should check CalendarScopeActions.Initialize.All type', () => {
        expect(new CalendarScopeActions.Initialize.All().type)
            .toBe(CalendarScopeActionEnum.InitializeAll);
    });

    it('should check CalendarScopeActions.Initialize.Focus type', () => {
        expect(new CalendarScopeActions.Initialize.Focus().type)
            .toBe(CalendarScopeActionEnum.InitializeFocus);
    });

    it('should check CalendarScopeActions.Initialize.ScopeParameters type', () => {
        expect(new CalendarScopeActions.Initialize.ScopeParameters().type)
            .toBe(CalendarScopeActionEnum.InitializeScopeParameters);
    });

    it('should check CalendarScopeActions.Resolve.Focus() type', () =>
        expect(new CalendarScopeActions.Resolve.Focus(null).type)
            .toBe(CalendarScopeActionEnum.ResolveFocus));

    it('should check CalendarScopeActions.Resolve.FocusFulfilled() type', () =>
        expect(new CalendarScopeActions.Resolve.FocusFulfilled(null).type)
            .toBe(CalendarScopeActionEnum.ResolveFocusFulfilled));

    it('should check CalendarScopeActions.Resolve.NavigateToElement() type', () =>
        expect(new CalendarScopeActions.Resolve.NavigateToElement(null).type)
            .toBe(CalendarScopeActionEnum.ResolveNavigateToElement));

    it('should check CalendarScopeActions.Resolve.NavigateToElementFulfilled() type', () =>
        expect(new CalendarScopeActions.Resolve.NavigateToElementFulfilled(null).type)
            .toBe(CalendarScopeActionEnum.ResolveNavigateToElementFulfilled));

    it('should check CalendarScopeActions.Set.ExpandedWeeks() type', () =>
        expect(new CalendarScopeActions.Set.ExpandedWeeks(null).type)
            .toBe(CalendarScopeActionEnum.SetExpandedWeeks));

    it('should check CalendarScopeActions.Set.Focus() type', () =>
        expect(new CalendarScopeActions.Set.Focus(null).type)
            .toBe(CalendarScopeActionEnum.SetFocus));

    it('should check CalendarScopeActions.Set.Mode type', () => {
        expect(new CalendarScopeActions.Set.Mode(null).type)
            .toBe(CalendarScopeActionEnum.SetMode);
    });

    it('should check CalendarScopeActions.Set.ScopeParameters type', () => {
        expect(new CalendarScopeActions.Set.ScopeParameters(null).type)
            .toBe(CalendarScopeActionEnum.SetScopeParameters);
    });

    it('should check CalendarScopeActions.Set.Start type', () => {
        expect(new CalendarScopeActions.Set.Start(null).type)
            .toBe(CalendarScopeActionEnum.SetStart);
    });
});
