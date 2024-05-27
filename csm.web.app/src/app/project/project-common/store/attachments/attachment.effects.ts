/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    map,
    switchMap
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';
import {TaskAttachmentService} from '../../api/tasks/task-attachment.service';
import {
    AttachmentActionEnum,
    AttachmentActions
} from './attachment.actions';

@Injectable()
export class AttachmentEffects {

    constructor(private _actions$: Actions,
                private _taskAttachmentService: TaskAttachmentService) {
    }

    public requestAllTaskAttachments$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(AttachmentActionEnum.RequestAllByTask),
            switchMap((action: AttachmentActions.Request.AllByTask) => {
                const objectIdentifier = action.payload.objectIdentifier;
                const includeChildren = action.payload.includeChildren;

                return this._taskAttachmentService.getAll(objectIdentifier.id, includeChildren)
                    .pipe(
                        map((attachmentList: AttachmentListResource) => new AttachmentActions.Request.AllByTaskFulfilled({
                            attachmentList,
                            objectIdentifier,
                        })),
                        catchError(() => of(new AttachmentActions.Request.AllByTaskRejected(objectIdentifier.stringify()))));
            })));

    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(AttachmentActionEnum.DeleteOne),
            switchMap((action: AttachmentActions.Delete.One) => {
                const id = action.payload;
                return this._taskAttachmentService.delete(id)
                    .pipe(
                        map(() => new AttachmentActions.Delete.OneFulfilled(id)),
                        catchError(() => of(new AttachmentActions.Delete.OneRejected())));
            })));

    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(AttachmentActionEnum.DeleteOneFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Attachment_Delete_SuccessMessage')}))));
}
