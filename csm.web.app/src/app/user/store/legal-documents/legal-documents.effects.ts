/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {of} from 'rxjs';
import {
    catchError,
    map,
    switchMap
} from 'rxjs/operators';

import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';
import {UserLegalDocumentsService} from '../../api/user-legal-documents.service';
import {
    LegalDocumentsActions,
    LegalDocumentsEnum
} from './legal-documents.actions';

@Injectable()
export class LegalDocumentsEffects {
    constructor(private _actions$: Actions,
                private _legalDocumentsService: UserLegalDocumentsService) {
    }

    /**
     * @description Get the latest version of legal document.
     * @type {Observable<Action>}
     */
    public findCurrent$ = createEffect(() => this._actions$
    .pipe(
        ofType(LegalDocumentsEnum.RequestAll),
        switchMap(() =>
            this._legalDocumentsService.findCurrent()
                .pipe(
                    map((legalDocuments: LegalDocumentListResource) =>
                    new LegalDocumentsActions.Request.AllFulfilled(legalDocuments)),
                    catchError(() => of(new LegalDocumentsActions.Request.AllRejected()))
                )
        )));

    /**
     * @description Get the latest version of legal documents by country and locale.
     * @type {Observable<Action>}
     */
         public findUnregistered$ = createEffect(() => this._actions$
         .pipe(
             ofType(LegalDocumentsEnum.RequestAllUnregistered),
            switchMap((action: LegalDocumentsActions.Request.UnregisteredAll) =>
                 this._legalDocumentsService.findUnregistered(action.country, action.locale)
                     .pipe(
                         map((legalDocuments: LegalDocumentListResource) =>
                         new LegalDocumentsActions.Request.UnregisteredAllFulfilled(legalDocuments)),
                         catchError(() => of(new LegalDocumentsActions.Request.UnregisteredAllRejected()))
                     )
             )));

    /**
     * @description Consent to a document version.
     * @type {Observable<Action>}
     */
     public consents$ = createEffect(() => this._actions$
     .pipe(
         ofType(LegalDocumentsEnum.ConsentAll),
        switchMap((action: LegalDocumentsActions.Consent.All) =>
             this._legalDocumentsService.consents(action.ids)
                 .pipe(
                     map(() =>
                     new LegalDocumentsActions.Consent.AllFulfilled()),
                     catchError(() => of(new LegalDocumentsActions.Consent.AllRejected()))
                 )
         )));

    /**
     * @description Delay consent to all documents.
     * @type {Observable<Action>}
     */
     public delayConsent$ = createEffect(() => this._actions$
     .pipe(
         ofType(LegalDocumentsEnum.DelayConsent),
        switchMap(() =>
             this._legalDocumentsService.delayConsent()
                 .pipe(
                     map(() =>
                     new LegalDocumentsActions.Consent.DelayFulfilled()),
                     catchError(() => of(new LegalDocumentsActions.Consent.DelayRejected()))
                 )
         )));
}
