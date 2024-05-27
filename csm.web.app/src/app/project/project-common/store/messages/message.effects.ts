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
    of,
    zip
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {MessageService} from '../../api/messages/message.service';
import {MessageAttachmentService} from '../../api/messages/message-attachment.service';
import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResource} from '../../api/messages/resources/message-list.resource';
import {SaveMessageFileResource} from '../../api/messages/resources/save-message-file.resource';
import {AttachmentActions} from '../attachments/attachment.actions';
import {
    MessageActionEnum,
    MessageActions,
    MessageAttachmentActionEnum,
    MessageAttachmentActions
} from './message.actions';

@Injectable()
export class MessageEffects {

    constructor(private _actions$: Actions,
                private _messageService: MessageService,
                private _messageAttachmentService: MessageAttachmentService) {
    }

    /**
     * @description Request messages interceptor to request all messages by topic
     * @type {Observable<Action>}
     */
    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageActionEnum.RequestAll),
            switchMap((action: MessageActions.Request.All) => {
                const {topicId, lastMessageId, limit} = action.payload;
                return this._messageService
                    .findAll(topicId, lastMessageId, limit)
                    .pipe(
                        map((messageList: MessageListResource) => new MessageActions.Request.AllFulfilled({
                            messageList,
                            topicId,
                        })),
                        catchError(() => of(new MessageActions.Request.AllRejected(topicId))));
            })));

    /**
     * @description Post message interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageActionEnum.CreateOne),
            switchMap((action: MessageActions.Create.One) => {
                const {topicId, content, files} = action.payload;

                return this._messageService.create(topicId, content)
                    .pipe(
                        map((message: MessageResource) => files && files.length > 0
                            ? new MessageAttachmentActions.Create.All(new SaveMessageFileResource(message.id, files, topicId))
                            : new MessageActions.Create.OneFulfilled(message)),
                        catchError(() => of(new MessageActions.Create.OneRejected(topicId))));
            })));

    /**
     * @description Post message success interceptor
     * @type {Observable<Action>}
     */
    public createSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageActionEnum.CreateOneFulfilled),
            map(() => {
                const key = 'Reply_Create_SuccessMessage';
                return new AlertActions.Add.SuccessAlert(({message: {key}}));
            })));

    /**
     * @description Upload message file interceptor
     * @type {Observable<Action>}
     */
    public uploadMessageFile$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageAttachmentActionEnum.CreateAll),
            switchMap((action: MessageAttachmentActions.Create.All) => {
                const {messageId, files, topicId} = action.payload;
                const observableUpload: Observable<AttachmentResource>[] =
                    files.map((file: File) => this._messageAttachmentService.upload(messageId, file));
                const observableZipUpload: Observable<AttachmentResource[]> = zip(...observableUpload);

                return observableZipUpload
                    .pipe(
                        switchMap(() => this._messageService
                            .findOne(messageId)
                            .pipe(
                                map(message => new MessageActions.Create.OneFulfilled(message)),
                                catchError(() => of(new MessageActions.Create.OneRejected(topicId))))
                        ));
            })));

    /**
     * @description Delete message interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageActionEnum.DeleteOne),
            switchMap((action: MessageActions.Delete.One) => {
                const {topicId, messageId} = action.payload;

                return this._messageService
                    .delete(messageId)
                    .pipe(
                        mergeMap(() => [
                            new MessageActions.Delete.OneFulfilled(action.payload),
                            new AttachmentActions.Remove.AllByMessage(messageId),
                        ]),
                        catchError(() => of(new MessageActions.Delete.OneRejected(topicId))),
                    );
            })));
    /**
     * @description Delete message success interceptor
     * @type {Observable<Action>}
     */
    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(MessageActionEnum.DeleteOneFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Reply_Delete_SuccessMessage')}))));
}
