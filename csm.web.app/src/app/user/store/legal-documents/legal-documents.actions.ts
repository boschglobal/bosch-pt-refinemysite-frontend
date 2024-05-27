/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';
import {CountryEnum} from '../../user-common/enums/country.enum';

export enum LegalDocumentsEnum {
    RequestAll = '[Legal Documents] Request legal documents',
    RequestAllFulfilled = '[Legal Documents] Request legal documents fulfilled',
    RequestAllRejected = '[Legal Documents] Request legal documents rejected',
    RequestAllUnregistered = '[Legal Documents] Request unregistered documents',
    RequestAllUnregisteredFulfilled = '[Legal Documents] Request unregistered documents fulfilled',
    RequestAllUnregisteredRejected = '[Legal Documents] Request unregistered documents rejected',
    ConsentAll = '[Legal Documents] Consent legal documents',
    ConsentAllFulfilled = '[Legal Documents] Consent legal documents fulfilled',
    ConsentAllRejected = '[Legal Documents] Consent legal documents rejected',
    DelayConsent = '[Legal Documents] Delay consent',
    DelayConsentFulfilled = '[Legal Documents] Delay consent fulfilled',
    DelayConsentRejected = '[Legal Documents] Delay consent rejected',
}

export namespace LegalDocumentsActions {

    export namespace Request {

        export class All implements Action {
            readonly type = LegalDocumentsEnum.RequestAll;

            constructor() {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = LegalDocumentsEnum.RequestAllFulfilled;

            constructor(public payload: LegalDocumentListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = LegalDocumentsEnum.RequestAllRejected;

            constructor() {
            }
        }

        export class UnregisteredAll implements Action {
            readonly type = LegalDocumentsEnum.RequestAllUnregistered;

            constructor(public country: CountryEnum, public locale: LanguageEnum) {
            }
        }

        export class UnregisteredAllFulfilled implements Action {
            readonly type = LegalDocumentsEnum.RequestAllUnregisteredFulfilled;

            constructor(public payload: LegalDocumentListResource) {
            }
        }

        export class UnregisteredAllRejected implements Action {
            readonly type = LegalDocumentsEnum.RequestAllUnregisteredRejected;

            constructor() {
            }
        }
    }

    export namespace Consent {

        export class All implements Action {
            readonly type = LegalDocumentsEnum.ConsentAll;

            constructor(public ids: string[]) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = LegalDocumentsEnum.ConsentAllFulfilled;

            constructor() {
            }
        }

        export class AllRejected implements Action {
            readonly type = LegalDocumentsEnum.ConsentAllRejected;

            constructor() {
            }
        }

        export class Delay implements Action {
            readonly type = LegalDocumentsEnum.DelayConsent;

            constructor() {
            }
        }

        export class DelayFulfilled implements Action {
            readonly type = LegalDocumentsEnum.DelayConsentFulfilled;

            constructor() {
            }
        }

        export class DelayRejected implements Action {
            readonly type = LegalDocumentsEnum.DelayConsentRejected;

            constructor() {
            }
        }
    }
}

export type LegalDocumentsActions =
    LegalDocumentsActions.Request.All |
    LegalDocumentsActions.Request.AllFulfilled |
    LegalDocumentsActions.Request.AllRejected |
    LegalDocumentsActions.Request.UnregisteredAll |
    LegalDocumentsActions.Request.UnregisteredAllFulfilled |
    LegalDocumentsActions.Request.UnregisteredAllRejected |
    LegalDocumentsActions.Consent.All |
    LegalDocumentsActions.Consent.AllFulfilled |
    LegalDocumentsActions.Consent.AllRejected |
    LegalDocumentsActions.Consent.Delay |
    LegalDocumentsActions.Consent.DelayFulfilled |
    LegalDocumentsActions.Consent.DelayRejected;
