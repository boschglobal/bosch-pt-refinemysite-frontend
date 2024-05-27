/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {LegalDocumentResource} from '../../api/resources/user-legal-documents.resource';
import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';
import {LegalDocumentTypeEnum} from '../../user-common/enums/legal-document-type.enum';
import {LegalDocumentsSlice} from './legal-documents.slice';

@Injectable({
    providedIn: 'root',
})
export class LegalDocumentsQueries extends BaseQueries<LegalDocumentListResource, LegalDocumentsSlice, null> {

    public sliceName = 'legalDocumentsSlice';

    public moduleName = 'userModule';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves request status
     * @returns {RequestStatusEnum}
     */
    public observeLegalDocumentsRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._getRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the slices of LegalDocuments
     * @returns {Observable<LegalDocumentResource[]>}
     */
    public observeLegalDocumentsList(): Observable<LegalDocumentResource[]> {
        return this._store
            .pipe(
                select(this._getFilteredLegalDocuments()),
                map(legalDocumentList => legalDocumentList.items),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves an observable with the slices of LegalDocuments that is not delayed and is not consented
     * @returns {Observable<LegalDocumentResource[]>}
     */
    public observeLegalDocumentsListToConsent(): Observable<LegalDocumentResource[]> {
        return this._store
            .pipe(
                select(this._getFilteredLegalDocuments()),
                filter(legalDocumentList => legalDocumentList.delayed === 0),
                map(legalDocumentList => legalDocumentList.items.filter(document => !document.consented)),
                filter(items => items.length !== 0),
                distinctUntilChanged(isEqual));
    }

    private _getFilteredDocumentsBySupportedTypes(documents: LegalDocumentResource[]): LegalDocumentResource[] {
        return documents.filter(({type}) => type === LegalDocumentTypeEnum.TermsAndConditions || type === LegalDocumentTypeEnum.Eula);
    }

    private _getFilteredLegalDocuments(): (state: State) => LegalDocumentListResource {
        return (state: State) => {
            const slice = this._getSlice(state);

            return {
                ...slice,
                items: this._getFilteredDocumentsBySupportedTypes(slice.items),
            };
        };
    }

    private _getRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).requestStatus;
    }
}
