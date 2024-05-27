/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {AttachmentListResourceLinks} from '../../api/attachments/resources/attachment-list.resource';
import {AttachmentSlice} from './attachment.slice';

@Injectable({
    providedIn: 'root'
})
export class AttachmentQueries extends BaseQueries<AttachmentResource, AttachmentSlice, AttachmentListResourceLinks> {
    public moduleName = 'projectModule';
    public sliceName = 'attachmentSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeAttachments(parentType: ObjectTypeEnum, parentId: string, includeChildren = false): Observable<AttachmentResource[]> {
        const objectIdentifier = this._buildObjectIdentifierString(parentType, parentId, includeChildren);
        return this._store
            .pipe(
                select(this.getItemsByParent(objectIdentifier)),
                distinctUntilChanged(isEqual));
    }

    public observeAttachmentsRequestStatus(parentType: ObjectTypeEnum, parentId: string, includeChildren = false): Observable<RequestStatusEnum> {
        const objectIdentifierId = this._buildObjectIdentifierString(parentType, parentId, includeChildren);
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(objectIdentifierId)),
                distinctUntilChanged());
    }

    public observeCurrentAttachmentRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    private _buildObjectIdentifierString(parentType: ObjectTypeEnum, parentId: string, includeChildren: boolean): string {
        return new ObjectListIdentifierPair(parentType, parentId, includeChildren).stringify();
    }
}
