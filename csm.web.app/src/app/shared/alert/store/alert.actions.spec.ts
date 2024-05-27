/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AlertTypeEnum} from '../enums/alert-type.enum';
import {
    AlertActionEnum,
    AlertActions,
    AlertPayload,
} from './alert.actions';

describe('Alert Actions', () => {

    it('should check AlertActions.Add.Alert() type', () => {
        const payload: AlertPayload = {type: AlertTypeEnum.Success, message: {text: '123'}};

        expect(new AlertActions.Add.Alert(payload).type).toBe(AlertActionEnum.AddAlert);
    });

    it('should check AlertActions.Add.ErrorAlert() type', () => {
        expect(new AlertActions.Add.ErrorAlert(null).type).toBe(AlertActionEnum.AddAlert);
    });

    it('should check AlertActions.Add.NeutralAlert() type', () => {
        expect(new AlertActions.Add.NeutralAlert(null).type).toBe(AlertActionEnum.AddAlert);
    });

    it('should check AlertActions.Add.SuccessAlert() type', () => {
        expect(new AlertActions.Add.SuccessAlert(null).type).toBe(AlertActionEnum.AddAlert);
    });

    it('should check AlertActions.Add.WarningAlert() type', () => {
        expect(new AlertActions.Add.WarningAlert(null).type).toBe(AlertActionEnum.AddAlert);
    });

    it('should check AlertActions.Remove.Alert() type', () => {
        expect(new AlertActions.Remove.Alert(null).type).toBe(AlertActionEnum.RemoveAlert);
    });

    it('should check AlertActions.Remove.AllAlerts() type', () => {
        expect(new AlertActions.Remove.AllAlerts().type).toBe(AlertActionEnum.RemoveAllAlerts);
    });

    it('should check AlertActions.Add.Announcements() type', () => {
        expect(new AlertActions.Add.Announcements(null).type).toBe(AlertActionEnum.AddAnnouncements);
    });

    it('should check AlertActions.Remove.AllAnnouncements() type', () => {
        expect(new AlertActions.Remove.AllAnnouncements().type).toBe(AlertActionEnum.RemoveAllAnnouncements);
    });

    it('should check AlertActions.Request.ReadAnnouncements() type', () => {
        expect(new AlertActions.Request.ReadAnnouncements().type).toBe(AlertActionEnum.RequestReadAnnouncements);
    });

    it('should check AlertActions.Request.ReadAnnouncementsFulfilled() type', () => {
        expect(new AlertActions.Request.ReadAnnouncementsFulfilled(null).type).toBe(AlertActionEnum.RequestReadAnnouncementsFulfilled);
    });

    it('should check AlertActions.Request.ReadAnnouncementsRejected() type', () => {
        expect(new AlertActions.Request.ReadAnnouncementsRejected().type).toBe(AlertActionEnum.RequestReadAnnouncementsRejected);
    });

    it('should check AlertActions.Set.AnnouncementHasRead() type', () => {
        expect(new AlertActions.Set.AnnouncementHasRead(null).type).toBe(AlertActionEnum.SetAnnouncementHasRead);
    });

    it('should check AlertActions.Set.AnnouncementHasReadFulfilled() type', () => {
        expect(new AlertActions.Set.AnnouncementHasReadFulfilled(null).type).toBe(AlertActionEnum.SetAnnouncementHasReadFulfilled);
    });

    it('should check AlertActions.Set.AnnouncementHasReadRejected() type', () => {
        expect(new AlertActions.Set.AnnouncementHasReadRejected().type).toBe(AlertActionEnum.SetAnnouncementHasReadRejected);
    });
});
