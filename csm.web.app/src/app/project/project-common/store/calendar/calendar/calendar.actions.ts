/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {CalendarExportFilters} from '../../../api/calendar/resources/calendar-export-filters';
import {CalendarUserSettings} from '../../../api/calendar/resources/calendar-user-settings';
import {CalendarExportFormatEnum} from '../../../enums/calendar-export-format.enum';

export enum CalendarActionEnum {
    InitializeAll = '[Calendar] Initialize all',
    ExportOne = '[Calendar] Export one',
    ExportOneFulfilled = '[Calendar] Export one fulfilled',
    ExportOneRejected = '[Calendar] Export one rejected',
    ExportOneReset = '[Calendar] Export one reset',
    RequestUserSettings = '[Calendar] Request User Settings',
    SetUserSettings = '[Calendar] Set User Settings',
    SetUserSettingsFulfilled = '[Calendar] Set User Settings Fulfilled',
    SetUserSettingsRejected = '[Calendar] Set User Settings Rejected',
}

export namespace CalendarActions {

    export namespace Initialize {

        export class All implements Action {
            public readonly type = CalendarActionEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Export {

        export class One implements Action {
            public readonly type = CalendarActionEnum.ExportOne;

            constructor(public projectId: string,
                        public filters: CalendarExportFilters,
                        public format: CalendarExportFormatEnum) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = CalendarActionEnum.ExportOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = CalendarActionEnum.ExportOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = CalendarActionEnum.ExportOneReset;

            constructor() {
            }
        }
    }

    export namespace Set {

        export class UserSettings implements Action {
            public readonly type = CalendarActionEnum.SetUserSettings;

            constructor(public payload: CalendarUserSettings) {
            }
        }

        export class UserSettingsFulfilled implements Action {
            public readonly type = CalendarActionEnum.SetUserSettingsFulfilled;

            constructor(public payload: CalendarUserSettings) {
            }
        }

        export class UserSettingsRejected implements Action {
            public readonly type = CalendarActionEnum.SetUserSettingsRejected;
        }
    }

    export namespace Request {

        export class UserSettings implements Action {
            public readonly type = CalendarActionEnum.RequestUserSettings;
        }
    }
}

export type CalendarActions =
    CalendarActions.Initialize.All |
    CalendarActions.Export.One |
    CalendarActions.Export.OneFulfilled |
    CalendarActions.Export.OneRejected |
    CalendarActions.Export.OneReset |
    CalendarActions.Request.UserSettings |
    CalendarActions.Set.UserSettings |
    CalendarActions.Set.UserSettingsFulfilled |
    CalendarActions.Set.UserSettingsRejected;
