/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {CalendarSelectionActionEnum} from '../../../enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../enums/calendar-selection-context.enum';
import {CalendarSelectionActions} from './calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from './calendar-selection.initial-state';
import {CALENDAR_SELECTION_REDUCER} from './calendar-selection.reducer';
import {CalendarSelectionSlice} from './calendar-selection.slice';

describe('Calendar Selection Reducer', () => {
    let initialState: CalendarSelectionSlice;
    let nextState: CalendarSelectionSlice;
    let midState: CalendarSelectionSlice;

    const item1 = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
    const item2 = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'bar');

    beforeEach(() => {
        initialState = CALENDAR_SELECTION_SLICE_INITIAL_STATE;
        midState = cloneDeep(CALENDAR_SELECTION_SLICE_INITIAL_STATE);
        nextState = cloneDeep(CALENDAR_SELECTION_SLICE_INITIAL_STATE);
    });

    it('should handle CalendarSelectionActions.InitializeAll action', () => {
        const action = new CalendarSelectionActions.Initialize.All();
        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle CalendarSlectionActions.Set.Context Action', () => {
        const newContext = CalendarSelectionContextEnum.Dependencies;
        const action = new CalendarSelectionActions.Set.Context(newContext);

        nextState.context = newContext;

        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Set.Items action', () => {
        const newItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
        ];
        const action = new CalendarSelectionActions.Set.Items(newItems);

        nextState.items = newItems;

        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Set.Selection with optional parameters action', () => {
        const newItems = [
            new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
        ];
        const newContext = CalendarSelectionContextEnum.Dependencies;
        const newIsMultiSelecting = true;
        const newAction = CalendarSelectionActionEnum.Copy;
        const action = new CalendarSelectionActions.Set.Selection(newIsMultiSelecting, newContext, newItems, newAction);

        nextState.isMultiSelecting = newIsMultiSelecting;
        nextState.items = newItems;
        nextState.context = newContext;
        nextState.action = newAction;

        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Set.Selection action without optional parameters', () => {
        const newIsMultiSelecting = true;
        const action = new CalendarSelectionActions.Set.Selection(newIsMultiSelecting);

        nextState.isMultiSelecting = newIsMultiSelecting;

        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Set.SelectionAction action', () => {
        const newAction = CalendarSelectionActionEnum.Copy;
        const action = new CalendarSelectionActions.Set.SelectionAction(newAction);

        nextState.action = newAction;

        expect(CALENDAR_SELECTION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Toggle.SelectionItem action when item is not in the selection', () => {
        const action = new CalendarSelectionActions.Toggle.SelectionItem(item1);

        midState.items = [item2];
        nextState.items = [item2, item1];

        expect(CALENDAR_SELECTION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle CalendarSelectionActions.Toggle.SelectionItem action when item is already in the selection', () => {
        const action = new CalendarSelectionActions.Toggle.SelectionItem(item1);

        midState.items = [item1, item2];
        nextState.items = [item2];

        expect(CALENDAR_SELECTION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle calendarSelectionReducer default case', () => {
        const action: Action = {type: 'DEFAULT'};
        expect(CALENDAR_SELECTION_REDUCER(undefined, action)).toEqual(initialState);
    });
});
