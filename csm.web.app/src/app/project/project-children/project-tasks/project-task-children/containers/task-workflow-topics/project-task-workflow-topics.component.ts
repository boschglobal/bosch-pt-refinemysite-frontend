/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

import {State} from '../../../../../../app.reducers';
import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {UserResource} from '../../../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveTopicResource} from '../../../../../project-common/api/topics/resources/save-topic.resource';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';
import {ProjectTaskTopicCaptureComponent} from '../../presentationals/task-topic-capture/project-task-topic-capture.component';

@Component({
    selector: 'ss-project-task-workflow-topics',
    templateUrl: './project-task-workflow-topics.component.html',
    styleUrls: ['./project-task-workflow-topics.component.scss'],
})
export class ProjectTaskWorkflowTopicsComponent implements OnInit, OnDestroy {

    /**
     * @description Property with project task topic capture
     */
    @ViewChild('projectTaskTopicCapture', {static: true})
    public projectTaskTopicCapture: ProjectTaskTopicCaptureComponent;

    /**
     * @description Whether the capture is in collapsed
     * @type {boolean}
     */
    public isCollapsed = true;

    /**
     * @description Whether the capture is in submitting state
     * @type {boolean}
     */
    public isSubmitting: boolean;

    /**
     * @description Property with user information
     */
    public user: ResourceReferenceWithPicture;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _hasMoreItems: boolean;

    private _hasTopics: boolean;

    private _isLoading: boolean;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
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

    public get canShowNoItemsFeedback(): boolean {
        return !this._hasTopics && !this._isLoading && !this._hasMoreItems;
    }

    public handleCaptureCanceled(): void {
        this.isCollapsed = true;
        this._changeDetectorRef.detectChanges();
    }

    public handleCaptureFocused(): void {
        this.isCollapsed = false;
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Triggered when submit capture is clicked
     * @param {SaveTopicResource} value
     */
    public onSubmitCapture(value: SaveTopicResource): void {
        this._store.dispatch(new TopicActions.Create.One(value));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._topicQueries.observeTopicsByTask()
                .pipe(map(topics => !!topics.length))
                .subscribe(hasTopics => this._setHasTopics(hasTopics))
        );

        this._disposableSubscriptions.add(
            this._topicQueries
                .observeTopicsByTaskRequestStatus()
                .subscribe(this._handleRequestStatusChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._topicQueries
                .observeTopicsByTaskHasMoreItems()
                .subscribe(this._handleHasMoreItemsChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._topicQueries
                .observeCreateRequestStatus()
                .subscribe(this._handleSubmitStatusChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe(this._handleCurrentUser.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this._isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _handleSubmitStatusChange(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.success) {
            this.projectTaskTopicCapture.handleCancel();
        }
    }

    private _handleCurrentUser(user: UserResource): void {
        const {id, firstName, lastName, _embedded} = user;

        this.user = new ResourceReferenceWithPicture(
            id,
            `${firstName} ${lastName}`,
            _embedded.profilePicture._links.small.href
        );
    }

    private _handleHasMoreItemsChange(hasMoreItems: boolean): void {
        this._hasMoreItems = hasMoreItems;
    }

    private _setHasTopics(hasTopics: boolean): void {
        this._hasTopics = hasTopics;
    }
}
