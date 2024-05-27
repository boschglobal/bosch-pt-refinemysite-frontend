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
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {omit} from 'lodash';
import {
    Observable,
    of,
    zip
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {SaveTopicResource} from '../../api/topics/resources/save-topic.resource';
import {SaveTopicAttachmentResource} from '../../api/topics/resources/save-topic-attachment.resource';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicListResource} from '../../api/topics/resources/topic-list.resource';
import {TopicService} from '../../api/topics/topic.service';
import {TopicAttachmentService} from '../../api/topics/topic-attachment.service';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {AttachmentActions} from '../attachments/attachment.actions';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {
    TopicActionEnum,
    TopicActions,
    TopicAttachmentActionEnum,
    TopicAttachmentActions
} from './topic.actions';

@Injectable()
export class TopicEffects {

    private _taskQueries: ProjectTaskQueries = new ProjectTaskQueries(this._store);

    constructor(private _actions$: Actions,
                private _topicFileService: TopicAttachmentService,
                private _topicService: TopicService,
                private _store: Store<State>) {
    }

    /**
     * @description Request topics interceptor to request current task topics
     * @type {Observable<Action>}
     */
    public requestCurrentTopics$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.RequestAll),
            withLatestFrom(this._store
                .pipe(
                    select(this._taskQueries.getCurrentItemId()))),
            mergeMap(([{lastTopicId, limit, taskId}, currentTaskId]: [TopicActions.Request.All, string]) =>
                this._topicService
                    .findAll(taskId || currentTaskId, lastTopicId, limit)
                    .pipe(
                        map((topicListResource: TopicListResource) => new TopicActions.Request.AllFulfilled(topicListResource)),
                        catchError(() => of(new TopicActions.Request.AllRejected()))))));

    /**
     * @description Request topic interceptor to request topic
     * @type {Observable<Action>}
     */
    public requestTaskTopic$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.RequestOne),
            switchMap((action: TopicActions.Request.One) => {
                const topicId = action.payload;

                return this._topicService
                    .findOne(topicId)
                    .pipe(
                        map(topicResource => new TopicActions.Request.OneFulfilled(topicResource)),
                        catchError(() => of(new TopicActions.Request.OneRejected())));
            })));

    /**
     * @description Update topic criticality
     * @type {Observable<Action>}
     */
    public updateCurrentTaskTopicCriticality$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.UpdateCriticality),
            switchMap((action: TopicActions.Update.Criticality) => {
                const {id, criticality} = action.payload;

                return this._topicService
                    .updateCriticality(id, criticality)
                    .pipe(
                        map(topic => new TopicActions.Update.CriticalityFulfilled(topic)),
                        catchError(() => of(new TopicActions.Request.One(id))));
            })));

    /**
     * @description Create topic interceptor
     * @type {Observable<Action>}
     */
    public createTopic$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.CreateOne),
            withLatestFrom(this._store
                .pipe(
                    select(this._taskQueries.getCurrentItemId()))),
            mergeMap(([action, currentTaskId]) => {
                const postTopicAction = action as TopicActions.Create.One;
                const parsedTopic: SaveTopicResource = this._parseTopic(postTopicAction.payload);

                return this._topicService
                    .create(parsedTopic, postTopicAction.taskId || currentTaskId)
                    .pipe(
                        map((topicResource: TopicResource) => {
                            const files: File[] = postTopicAction.payload.files;

                            return files.length > 0
                                ? new TopicAttachmentActions.Create.All(new SaveTopicAttachmentResource(topicResource.id, files))
                                : new TopicActions.Create.OneFulfilled(topicResource.id);
                        }),
                        catchError(() => of(new TopicActions.Create.OneRejected())));
            })));

    /**
     * @description Upload topic file interceptor
     * @type {Observable<Action>}
     */
    public uploadTopicFile$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicAttachmentActionEnum.CreateAll),
            switchMap((action: TopicAttachmentActions.Create.All) => {
                const topicId: string = action.payload.id;
                const files: File[] = action.payload.files;
                const observableUpload: Observable<AttachmentResource>[] =
                    files.map((file: File) => this._topicFileService.upload(topicId, file));
                const observableZipUpload: Observable<AttachmentResource[]> = zip(...observableUpload);

                return observableZipUpload
                    .pipe(
                        map(() => new TopicActions.Create.OneFulfilled(topicId)),
                        catchError(() => of(new TopicActions.Create.OneRejected())));
            })));

    /**
     * @description Create topic success interceptor
     * @type {Observable<Action>}
     */
    public createTopicSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.CreateOneFulfilled),
            switchMap((action: TopicActions.Create.OneFulfilled) => {
                const topicId: string = action.payload;

                return this._topicService
                    .findOne(topicId)
                    .pipe(
                        mergeMap((topicResource: TopicResource) => [
                            new TopicActions.Update.List(topicResource.id),
                            new TopicActions.Request.OneFulfilled(topicResource),
                            new AlertActions.Add.SuccessAlert({message: {key: 'Topic_Create_SuccessMessage'}}),
                        ]),
                        catchError(() => of(new TopicActions.Request.OneRejected())));
            })));

    /**
     * @description Delete topic interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.DeleteOne),
            switchMap((action: TopicActions.Delete.One) => {
                const topicId = action.payload;

                return this._topicService
                    .delete(topicId)
                    .pipe(
                        mergeMap(() => [
                            new TopicActions.Delete.OneFulfilled(topicId),
                            new AttachmentActions.Remove.AllByTopic(topicId),
                        ]),
                        catchError(() => of(new TopicActions.Delete.OneRejected())),
                    );
            })));
    /**
     * @description Delete topic success interceptor
     * @type {Observable<Action>}
     */
    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TopicActionEnum.DeleteOneFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Topic_Delete_SuccessMessage')}))));

    private _parseTopic(topic: SaveTopicResource): SaveTopicResource {
        const {description, criticality} = topic;

        const parsedData: Object = {
            description: description === '' ? null : description,
            criticality: criticality ? TopicCriticalityEnum.CRITICAL : TopicCriticalityEnum.UNCRITICAL
        };
        let parsedTopic: SaveTopicResource = Object.assign({}, topic, parsedData);
        parsedTopic = omit(parsedTopic, 'files');

        return parsedTopic;
    }
}
