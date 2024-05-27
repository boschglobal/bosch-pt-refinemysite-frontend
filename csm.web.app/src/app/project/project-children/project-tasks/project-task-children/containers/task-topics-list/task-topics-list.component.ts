/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {last} from 'lodash';
import {
    combineLatest,
    Subscription,
} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ButtonSize} from '../../../../../../shared/ui/button/button.component';
import {InputFilesSize} from '../../../../../../shared/ui/forms/input-files/input-files.component';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {NewsResource} from '../../../../../project-common/api/news/resources/news.resource';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';
import {CriticalityChange} from '../../presentationals/task-topic-card/project-task-topic-card.component';
import {ProjectTaskTopicCardModel} from '../../presentationals/task-topic-card/project-task-topic-card.model';

export type TaskTopicsListSize = 'small' | 'tiny';

export const LOAD_MORE_TOPICS_LIMIT = 2;

const BUTTON_SIZE_MAP: { [key in TaskTopicsListSize]: ButtonSize } = {
    small: 'small',
    tiny: 'tiny',
};

const INPUT_FILES_SIZE_MAP: { [key in TaskTopicsListSize]: InputFilesSize } = {
    small: 'normal',
    tiny: 'small',
};

const TEXT_MAX_SIZE = 110;

@Component({
    selector: 'ss-task-topics-list',
    templateUrl: './task-topics-list.component.html',
    styleUrls: ['./task-topics-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTopicsListComponent implements OnInit, OnDestroy {

    @Input()
    public set size(size: TaskTopicsListSize) {
        this.buttonSize = BUTTON_SIZE_MAP[size];
        this.inputFilesSize = INPUT_FILES_SIZE_MAP[size];
    }

    @Input()
    public taskId: string;

    @Input()
    public textMaxSize = TEXT_MAX_SIZE;

    public inputFilesSize: InputFilesSize;

    public hasMoreItems: boolean;

    public isLoading: boolean;

    public buttonSize: ButtonSize = 'small';

    public topics: ProjectTaskTopicCardModel[] = [];

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _newsQueries: NewsQueries,
                private _store: Store<State>,
                private _topicQueries: TopicQueries,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCriticalityChange(criticalityChange: CriticalityChange): void {
        this._store.dispatch(new TopicActions.Update.Criticality(criticalityChange));
    }

    public handleDelete(topicId: string): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Topic_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new TopicActions.Delete.One(topicId)),
                cancelCallback: () => this._store.dispatch(new TopicActions.Delete.OneReset()),
                requestStatusObservable: this._topicQueries.observeTopicsByTaskRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    public handleLoadMore(): void {
        const lastTopicId = last(this.topics)?.id || null;

        this._store.dispatch(new TopicActions.Request.All(lastTopicId, LOAD_MORE_TOPICS_LIMIT, this.taskId));
    }

    public trackByFn(index: number, item: ProjectTaskTopicCardModel): string {
        return item.id;
    }

    private _handleHasMoreItemsChange(hasMoreItems: boolean): void {
        this.hasMoreItems = hasMoreItems;
        this._changeDetectorRef.detectChanges();
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._changeDetectorRef.detectChanges();
    }

    private _handleTopicsChange(topics: TopicResource[], news: NewsResource[]): void {
        this.topics = topics
            .filter(topic => !!topic)
            .map(topic => ProjectTaskTopicCardModel.fromTopicResource(
                topic,
                news,
                this._translateService.defaultLang,
            ));
        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._topicQueries.observeTopicsByTask(),
                this._newsQueries.observeAllItems(),
            ]).subscribe(([topics, news]) => this._handleTopicsChange(topics, news))
        );

        this._disposableSubscriptions.add(
            this._topicQueries
                .observeTopicsByTaskRequestStatus()
                .subscribe(requestStatus => this._handleRequestStatusChange(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._topicQueries
                .observeTopicsByTaskHasMoreItems()
                .subscribe(hasMoreItems => this._handleHasMoreItemsChange(hasMoreItems))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
