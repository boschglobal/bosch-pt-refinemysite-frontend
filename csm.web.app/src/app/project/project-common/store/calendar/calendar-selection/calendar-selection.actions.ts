/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {CalendarSelectionActionEnum} from '../../../enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../enums/calendar-selection-context.enum';

export enum CalendarSelectionActionsEnum {
    InitializeAll = '[Calendar Selection] Initialize all',
    SetContext = '[Calendar Selection] Set context',
    SetItems = '[Calendar Selection] Set items',
    SetSelection = '[Calendar Selection] Set selection',
    SetSelectionAction = '[Calendar Selection] Set selection action',
    ToggleSelectionItem = '[Calendar Selection] Toggle selection item',
}

export namespace CalendarSelectionActions {

    export namespace Initialize {

        export class All implements Action {
            public readonly type = CalendarSelectionActionsEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Set {

        export class Context implements Action {
            public readonly type = CalendarSelectionActionsEnum.SetContext;

            constructor(public payload: CalendarSelectionContextEnum) {
            }
        }

        export class Items implements Action {
            public readonly type = CalendarSelectionActionsEnum.SetItems;

            constructor(public payload: ObjectIdentifierPair[]) {
            }
        }

        export class Selection implements Action {
            public readonly type = CalendarSelectionActionsEnum.SetSelection;

            constructor(public isMultiSelecting: boolean,
                        public context?: CalendarSelectionContextEnum,
                        public items?: ObjectIdentifierPair[],
                        public action?: CalendarSelectionActionEnum) {
            }
        }

        export class SelectionAction implements Action {
            public readonly type = CalendarSelectionActionsEnum.SetSelectionAction;

            constructor(public payload: CalendarSelectionActionEnum) {
            }
        }
    }

    export namespace Toggle {

        export class SelectionItem implements Action {
            public readonly type = CalendarSelectionActionsEnum.ToggleSelectionItem;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }
    }
}

export type CalendarSelectionActions =
    CalendarSelectionActions.Initialize.All |
    CalendarSelectionActions.Set.SelectionAction |
    CalendarSelectionActions.Set.Context |
    CalendarSelectionActions.Set.Items |
    CalendarSelectionActions.Set.Selection |
    CalendarSelectionActions.Toggle.SelectionItem;
