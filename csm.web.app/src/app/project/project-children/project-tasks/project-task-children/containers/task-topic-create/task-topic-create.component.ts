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
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {UserResource} from '../../../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveTopicResource} from '../../../../../project-common/api/topics/resources/save-topic.resource';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';

@Component({
    selector: 'ss-task-topic-create',
    templateUrl: './task-topic-create.component.html',
    styleUrls: ['./task-topic-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTopicCreateComponent implements OnInit, OnDestroy {

    @Output()
    public closed: EventEmitter<null> = new EventEmitter();

    public isSubmitting: boolean;

    public user: ResourceReferenceWithPicture;

    private _disposableSubscriptions = new Subscription();

    constructor(private _modalService: ModalService,
                private _store: Store<State>,
                private _topicQueries: TopicQueries,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCancel(): void {
        this._store.dispatch(new TopicActions.Create.OneReset());
        this.closed.emit();
    }

    public handleSubmit(saveTopicResource: SaveTopicResource): void {
        const taskId = this._modalService.currentModalData.taskId;

        this._store.dispatch(new TopicActions.Create.One(saveTopicResource, taskId));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._topicQueries.observeCreateRequestStatus()
                .subscribe(requestStatus => this._handleCreateRequestStatus(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe(user => this._handleCurrentUser(user))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleCurrentUser(user: UserResource): void {
        const {id, firstName, lastName, _embedded} = user;

        this.user = new ResourceReferenceWithPicture(
            id,
            `${firstName} ${lastName}`,
            _embedded.profilePicture._links.small.href
        );
    }

    private _handleCreateRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.success) {
            this._store.dispatch(new TopicActions.Create.OneReset());
            this.closed.emit();
        }
    }
}
