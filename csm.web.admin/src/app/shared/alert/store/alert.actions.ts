/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {AlertMessageResource} from '../api/resources/alert-message.resource';
import {AlertResource} from '../api/resources/alert.resource';
import {AlertTypeEnum} from '../enums/alert-type.enum';

export enum AlertActionEnum {
    AddAlert = '[Alert] Add alert',
    RemoveAlert = '[Alert] Remove alert',
    RemoveAllAlerts = '[Alert] Remove all alerts',
}

export namespace AlertActions {
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
    }
}

export type AlertActions =
    AlertActions.Add.Alert |
    AlertActions.Add.ErrorAlert |
    AlertActions.Add.SuccessAlert |
    AlertActions.Add.WarningAlert |
    AlertActions.Remove.Alert |
    AlertActions.Remove.AllAlerts;

export interface AlertPayload {
    type: AlertTypeEnum;
    message: AlertMessageResource;
}

interface AlertPayloadPart {
    message: AlertMessageResource;
}
