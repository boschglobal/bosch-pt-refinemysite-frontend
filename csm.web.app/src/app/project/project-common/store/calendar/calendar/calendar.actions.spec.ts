/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CalendarActionEnum,
    CalendarActions,
} from './calendar.actions';

describe('Calendar Actions', () => {
    it('should handle CalendarActions.Initialize.All action', () => {
        expect(new CalendarActions.Initialize.All().type)
            .toBe(CalendarActionEnum.InitializeAll);
    });

    it('should handle CalendarActions.Set.UserSettings action', () => {
        expect(new CalendarActions.Set.UserSettings(null).type)
            .toBe(CalendarActionEnum.SetUserSettings);
    });

    it('should handle CalendarActions.Set.UserSettingsFulfilled action', () => {
        expect(new CalendarActions.Set.UserSettingsFulfilled(null).type)
            .toBe(CalendarActionEnum.SetUserSettingsFulfilled);
    });

    it('should handle CalendarActions.Set.UserSettingsRejected action', () => {
        expect(new CalendarActions.Set.UserSettingsRejected().type)
            .toBe(CalendarActionEnum.SetUserSettingsRejected);
    });

    it('should handle CalendarActions.Request.UserSettings action', () => {
        expect(new CalendarActions.Request.UserSettings().type)
            .toBe(CalendarActionEnum.RequestUserSettings);
    });

    it('should handle CalendarActions.Export.One action', () => {
        expect(new CalendarActions.Export.One(null, null, null).type)
            .toBe(CalendarActionEnum.ExportOne);
    });

    it('should handle CalendarActions.Export.OneFulfilled action', () => {
        expect(new CalendarActions.Export.OneFulfilled(null).type)
            .toBe(CalendarActionEnum.ExportOneFulfilled);
    });

    it('should handle CalendarActions.Export.OneRejected action', () => {
        expect(new CalendarActions.Export.OneRejected().type)
            .toBe(CalendarActionEnum.ExportOneRejected);
    });

    it('should handle CalendarActions.Export.OneReset action', () => {
        expect(new CalendarActions.Export.OneReset().type)
            .toBe(CalendarActionEnum.ExportOneReset);
    });
});
