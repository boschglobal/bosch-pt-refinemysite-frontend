/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {AlertResource} from '../api/resources/alert.resource';
import {AlertMessageResource} from '../api/resources/alert-message.resource';
import {AnnouncementListResource} from '../api/resources/announcement-list.resource';
import {AlertTypeEnum} from '../enums/alert-type.enum';

export enum AlertActionEnum {
    AddAlert = '[Alert] Add alert',
    RemoveAlert = '[Alert] Remove alert',
    RemoveAllAlerts = '[Alert] Remove all alerts',
    AddAnnouncements = '[Alert] Add announcements',
    RemoveAllAnnouncements = '[Alert] Remove all announcements',
    SetAnnouncementHasRead = '[Alert] Set announcement has read',
    SetAnnouncementHasReadFulfilled = '[Alert] Set announcement has read fulfilled',
    SetAnnouncementHasReadRejected = '[Alert] Set announcement has read rejected',
    RequestReadAnnouncements = '[Alert] Request read announcements',
    RequestReadAnnouncementsFulfilled = '[Alert] Request read announcements fulfilled',
    RequestReadAnnouncementsRejected = '[Alert] Request read announcements rejected',
}

export namespace AlertActions {

    export namespace Request {

        export class ReadAnnouncements implements Action {
            public readonly type = AlertActionEnum.RequestReadAnnouncements;
        }

        export class ReadAnnouncementsFulfilled implements Action {
            public readonly type = AlertActionEnum.RequestReadAnnouncementsFulfilled;

            constructor(public payload: string[]) {
            }
        }

        export class ReadAnnouncementsRejected implements Action {
            public readonly type = AlertActionEnum.RequestReadAnnouncementsRejected;
        }

    }

    export namespace Add {
        export class Alert implements Action {
            readonly type = AlertActionEnum.AddAlert;

            constructor(public payload: AlertPayload) {
                this.payload = new AlertResource(payload.type, payload.message);
            }
        }

        export class ErrorAlert extends Alert {
            constructor(public payloadPart: AlertPayloadPart) {
                super(Object.assign({type: AlertTypeEnum.Error}, payloadPart));
            }
        }

        export class NeutralAlert extends Alert {
            constructor(public payloadPart: AlertPayloadPart) {
                super(Object.assign({type: AlertTypeEnum.Neutral}, payloadPart));
            }
        }

        export class SuccessAlert extends Alert {
            constructor(public payloadPart: AlertPayloadPart) {
                super(Object.assign({type: AlertTypeEnum.Success}, payloadPart));
            }
        }

        export class WarningAlert extends Alert {
            constructor(public payloadPart: AlertPayloadPart) {
                super(Object.assign({type: AlertTypeEnum.Warning}, payloadPart));
            }
        }

        export class Announcements implements Action {
            readonly type = AlertActionEnum.AddAnnouncements;

            constructor(public payload: AnnouncementListResource) {
            }
        }
    }

    export namespace Set {
        export class AnnouncementHasRead implements Action {
            public readonly type = AlertActionEnum.SetAnnouncementHasRead;

            constructor(public payload: string) {
            }
        }

        export class AnnouncementHasReadFulfilled implements Action {
            public readonly type = AlertActionEnum.SetAnnouncementHasReadFulfilled;

            constructor(public payload: string) {
            }
        }

        export class AnnouncementHasReadRejected implements Action {
            public readonly type = AlertActionEnum.SetAnnouncementHasReadRejected;
        }
    }

    export namespace Remove {
        export class Alert implements Action {
            readonly type = AlertActionEnum.RemoveAlert;

            constructor(public payload: string) {
            }
        }

        export class AllAlerts implements Action {
            readonly type = AlertActionEnum.RemoveAllAlerts;
        }

        export class AllAnnouncements implements Action {
            readonly type = AlertActionEnum.RemoveAllAnnouncements;
        }
    }
}

export type AlertActions =
    AlertActions.Add.Alert |
    AlertActions.Add.ErrorAlert |
    AlertActions.Add.NeutralAlert |
    AlertActions.Add.SuccessAlert |
    AlertActions.Add.WarningAlert |
    AlertActions.Add.Announcements |
    AlertActions.Remove.Alert |
    AlertActions.Remove.AllAlerts |
    AlertActions.Remove.AllAnnouncements |
    AlertActions.Set.AnnouncementHasRead |
    AlertActions.Set.AnnouncementHasReadFulfilled |
    AlertActions.Set.AnnouncementHasReadRejected |
    AlertActions.Request.ReadAnnouncements |
    AlertActions.Request.ReadAnnouncementsFulfilled |
    AlertActions.Request.ReadAnnouncementsRejected;

export interface AlertPayload {
    type: AlertTypeEnum;
    message: AlertMessageResource;
}

interface AlertPayloadPart {
    message: AlertMessageResource;
}
