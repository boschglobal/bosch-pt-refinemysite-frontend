/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CalendarSelectionActions,
    CalendarSelectionActionsEnum
} from './calendar-selection.actions';

describe('Calendar Selection Actions', () => {
    it('should check CalendarSelectionActions.Initialize.All() type', () => {
        expect(new CalendarSelectionActions.Initialize.All().type)
            .toBe(CalendarSelectionActionsEnum.InitializeAll);
    });

    it('should check CalendarSelectionActions.Set.Context() type', () => {
        expect(new CalendarSelectionActions.Set.Context(null).type)
            .toBe(CalendarSelectionActionsEnum.SetContext);
    });

    it('should check CalendarSelectionActions.Set.Items() type', () => {
        expect(new CalendarSelectionActions.Set.Items(null).type)
            .toBe(CalendarSelectionActionsEnum.SetItems);
    });

    it('should check CalendarSelectionActions.Set.Selection() type', () => {
        expect(new CalendarSelectionActions.Set.Selection(null).type)
            .toBe(CalendarSelectionActionsEnum.SetSelection);
    });

    it('should check CalendarSelectionActions.Set.SelectionAction() type', () => {
        expect(new CalendarSelectionActions.Set.SelectionAction(null).type)
            .toBe(CalendarSelectionActionsEnum.SetSelectionAction);
    });

    it('should check CalendarSelectionActions.Toggle.SelectionItem() type', () => {
        expect(new CalendarSelectionActions.Toggle.SelectionItem(null).type)
            .toBe(CalendarSelectionActionsEnum.ToggleSelectionItem);
    });
});
