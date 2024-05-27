/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {
    Actions,
    ofType,
} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {Task} from '../../../../../project-common/models/tasks/task';
import {ProjectTaskActions} from '../../../../../project-common/store/tasks/task.actions';
import {
    TopicActionEnum,
    TopicActions,
} from '../../../../../project-common/store/topics/topic.actions';

export const REQUEST_TOPICS_LIMIT = 1;

export const REQUEST_TASK_ACTIONS: TopicActionEnum[] = [
    TopicActionEnum.CreateOneFulfilled,
    TopicActionEnum.DeleteOneFulfilled,
    TopicActionEnum.UpdateCriticalityFulfilled,
];

const COLLAPSED_ICON_ROTATION = 270;
const EXPANDED_ICON_ROTATION = 90;
const TEXT_MAX_SIZE = 54;

@Component({
    selector: 'ss-task-drawer-topics',
    templateUrl: './task-drawer-topics.component.html',
    styleUrls: ['./task-drawer-topics.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDrawerTopicsComponent implements OnInit, OnDestroy {

    @Input()
    public set task({id, statistics: {criticalTopics, uncriticalTopics}}: Task) {
        this.taskId = id;
        this.numberOfTopics = criticalTopics + uncriticalTopics;
    }

    public arrowIconRotation = EXPANDED_ICON_ROTATION;

    public collapsed = false;

    public numberOfTopics: number;

    public taskId: string;

    public textMaxSize = TEXT_MAX_SIZE;

    private _disposableSubscriptions = new Subscription();

    constructor(private _actions: Actions,
                private _modalService: ModalService,
                private _store: Store) {
    }

    ngOnInit(): void {
        this._requestTopics();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleAddButton(): void {
        this._modalService.open({
            id: ModalIdEnum.CreateTopic,
            data: {
                taskId: this.taskId,
            },
        });
    }

    public handleCollapse(): void {
        this.collapsed = !this.collapsed;
        this.arrowIconRotation = this.collapsed ? COLLAPSED_ICON_ROTATION : EXPANDED_ICON_ROTATION;
    }

    private _requestTask(): void {
        this._store.dispatch(new ProjectTaskActions.Request.One(this.taskId));
    }

    private _requestTopics(): void {
        this._store.dispatch(new TopicActions.Initialize.All());
        this._store.dispatch(new TopicActions.Request.All(null, REQUEST_TOPICS_LIMIT, this.taskId));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._actions
                .pipe(ofType(...REQUEST_TASK_ACTIONS))
                .subscribe(() => this._requestTask())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
