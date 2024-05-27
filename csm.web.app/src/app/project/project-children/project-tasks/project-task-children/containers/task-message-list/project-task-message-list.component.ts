/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    BehaviorSubject,
    combineLatest,
    Subscription
} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {InputFilesSize} from '../../../../../../shared/ui/forms/input-files/input-files.component';
import {MessageItemModel} from '../../../../../../shared/ui/messages/message-item-component/message-item.model';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {SaveMessageResource} from '../../../../../project-common/api/messages/resources/save-message.resource';
import {MessageActions} from '../../../../../project-common/store/messages/message.actions';
import {MessageQueries} from '../../../../../project-common/store/messages/message.queries';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';

export const TASK_MESSAGE_LIST_ID = 'project-task-message-list';

@Component({
    selector: 'ss-project-task-message-list',
    templateUrl: './project-task-message-list.component.html',
    styleUrls: ['./project-task-message-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTaskMessageListComponent implements OnInit, OnDestroy {

    @Input()
    public inputFilesSize: InputFilesSize;

    @Input()
    public topicId: string;

    @Input()
    public textMaxSize = 110;

    public isLoading: boolean;

    public messages: MessageItemModel[];

    public showLoadMore: boolean;

    private _hasMoreItems = false;

    private _isCreating: boolean;

    private _limit = 2;

    private _messagePreview = new BehaviorSubject<number>(this._limit);

    private _messagesNumber = 0;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _messageQueries: MessageQueries,
                private _modalService: ModalService,
                private _newsQueries: NewsQueries,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._requestMessages(this.topicId);
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._store.dispatch(new MessageActions.Initialize.AllByTopic(this.topicId));
        this._unsetSubscriptions();
    }

    /**
     * @description Triggered when load more button is clicked
     */
    public handleLoadMore(): void {
        const lastMessage: MessageItemModel = this.messages[this.messages.length - 1];
        const lastMessageId: string = lastMessage ? lastMessage.id : null;
        this._store.dispatch(new MessageActions.Request.All({topicId: this.topicId, lastMessageId, limit: this._limit}));
        this._messagePreview.next(this._messagePreview.value + this._limit);
        this._setShowLoadMore();
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Callback to handle when delete message is clicked
     * @param {string} messageId
     */
    public handleDelete(messageId: string): void {
        this._triggerDeleteMessageModal(messageId);
    }

    /**
     * @description Triggered when form is submitted
     * @param {SaveMessageResource} message
     */
    public onSubmitMessage(message: SaveMessageResource): void {
        this._isCreating = true;
        this._store.dispatch(new MessageActions.Create.One(message));
        this._changeDetectorRef.detectChanges();
    }

    private _setShowLoadMore(): void {
        this.showLoadMore = this._hasMoreItems || this._messagesNumber > this._messagePreview.value;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._messageQueries.observeMessagesByTopic(this.topicId),
                this._newsQueries.observeItemsByParentIdentifierPair([new ObjectIdentifierPair(ObjectTypeEnum.Topic, this.topicId)]),
                this._messagePreview,
            ]).subscribe(this._handleCurrentMessage.bind(this))
        );

        this._disposableSubscriptions.add(
            this._messageQueries
                .observeMessagesByTopicHasMoreItems(this.topicId)
                .subscribe(this._handleHasMoreItemsChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._messageQueries
                .observeMessagesByTopicRequestStatus(this.topicId)
                .subscribe(this._handleRequestStatusChange.bind(this))
        );
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        const inProgress = requestStatus === RequestStatusEnum.progress;

        if (this._isCreating) {
            this._isCreating = inProgress;
        } else {
            this.isLoading = inProgress;
        }

        this._changeDetectorRef.detectChanges();
    }

    private _handleHasMoreItemsChange(hasMoreItems: boolean): void {
        this._hasMoreItems = hasMoreItems;
        this._setShowLoadMore();
        this._changeDetectorRef.detectChanges();
    }

    private _requestMessages(topicId: string): void {
        this._store.dispatch(new MessageActions.Request.All({topicId, limit: this._limit}));
        this._store.dispatch(new TopicActions.Request.One(topicId));
    }

    private _handleCurrentMessage([messages, news, messagePreviewNumber]): void {
        this._messagesNumber = messages.length;
        this.messages = messages
            .map((message) => MessageItemModel.fromMessageResource(message, news, this._translateService.defaultLang))
            .slice(0, messagePreviewNumber);
        this._setShowLoadMore();
        this._changeDetectorRef.detectChanges();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _triggerDeleteMessageModal(messageId: string): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Reply_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new MessageActions.Delete.One({topicId: this.topicId, messageId})),
                cancelCallback: () => this._store.dispatch(new MessageActions.Delete.OneReset(this.topicId)),
                requestStatusObservable: this._messageQueries.observeMessagesByTopicRequestStatus(this.topicId),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }
}
