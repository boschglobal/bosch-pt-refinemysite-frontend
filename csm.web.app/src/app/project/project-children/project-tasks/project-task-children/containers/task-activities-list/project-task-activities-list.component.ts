/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    combineLatest,
    Subscription
} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TheaterService} from '../../../../../../shared/theater/api/theater.service';
import {ActivityResource} from '../../../../../project-common/api/activities/resources/activity.resource';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {ActivityActions} from '../../../../../project-common/store/activities/activity.actions';
import {ActivityQueries} from '../../../../../project-common/store/activities/activity.queries';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {ROUTE_PARAM_TASK_ID} from '../../../../../project-routing/project-route.paths';
import {ProjectTaskActivitiesListModel} from './project-task-activities-list.model';

@Component({
    selector: 'ss-project-task-activities-list',
    templateUrl: './project-task-activities-list.component.html',
    styleUrls: ['./project-task-activities-list.component.scss'],
})
export class ProjectTaskActivitiesListComponent implements OnInit, OnDestroy {

    /**
     * @description Property with activities
     * @type {Array}
     */
    public activities: ProjectTaskActivitiesListModel[] = [];

    /**
     * @description Property with loading status
     * @type {boolean}
     */
    public isLoading: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _hasMoreItems: boolean;

    private _isUnavailable: boolean;

    private _taskId: string;

    constructor(private _activatedRoute: ActivatedRoute,
                private _activityQueries: ActivityQueries,
                private _newsQueries: NewsQueries,
                private _store: Store<State>,
                private _theaterService: TheaterService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setTaskId();
        this._setSubscriptions();
        this._requestActivities();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._resetActivitiesSlice();
    }

    /**
     * @description Retrieves a unique identifier for each item
     * @param {number} index
     * @param {TopicResource} item
     * @returns {string}
     */
    public trackByFn(index: number, item: ActivityResource) {
        return index;
    }

    /**
     * @description Triggered when load more button is clicked
     */
    public handleLoadMore(): void {
        if (this.isLoading) {
            return;
        }

        const lastActivityId: string = this.activities[this.activities.length - 1].activity.id;
        const taskId = this._taskId;

        this._store.dispatch(new ActivityActions.Request.All({
            lastActivityId,
            taskId,
        }));
    }

    public handleRetry(): void {
        this._requestActivities();
    }

    /**
     * @description Triggered when thumbnail is clicked
     * @param {AttachmentResource} attachment
     */
    public openTheater(attachment: AttachmentResource): void {
        this._theaterService.open([attachment], attachment.id);
    }

    /**
     * @description Retrieves if we can render more items
     * @returns {boolean}
     */
    public get canRenderMoreItems(): boolean {
        return this._hasMoreItems && !this.isLoading;
    }

    public get canRenderActivitiesUnavailable(): boolean {
        return this._isUnavailable && !this.isLoading && !this.activities.length;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._activityQueries.observeActivities(),
                this._newsQueries.observeItemsByIdentifierPair([new ObjectIdentifierPair(ObjectTypeEnum.Task, this._taskId)])
            ]).subscribe(this._setActivities.bind(this))
        );

        this._disposableSubscriptions.add(
            this._activityQueries
                .observeActivitiesRequestStatus()
                .subscribe(this._handleRequestStatusChange.bind(this)));

        this._disposableSubscriptions.add(
            this._activityQueries
                .observeActivitiesHasMoreItems()
                .subscribe(this._handleHasMoreItemsChange.bind(this)));

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => {
                    this._resetActivitiesSlice();
                    this._requestActivities();
                }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setTaskId(): void {
        this._taskId = this._activatedRoute.snapshot.parent.params[ROUTE_PARAM_TASK_ID];
    }

    private _setActivities([activities, news]): void {
        const referenceDate = news[0] ? moment(news[0].createdDate) : null;

        this.activities = activities
            .map((activity: ActivityResource) => new ProjectTaskActivitiesListModel(activity, this._isActivityNew(activity, referenceDate)));
    }

    private _isActivityNew(activity: ActivityResource, referenceDate: moment.Moment | null): boolean {
        return referenceDate ? moment(activity.date).isSameOrAfter(referenceDate) : false;
    }

    private _handleHasMoreItemsChange(hasMoreItems: boolean): void {
        this._hasMoreItems = hasMoreItems;
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._isUnavailable = requestStatus === RequestStatusEnum.error;
    }

    private _requestActivities(): void {
        this._store.dispatch(new ActivityActions.Request.All({
            taskId: this._taskId,
        }));
    }

    private _resetActivitiesSlice(): void {
        this._store.dispatch(new ActivityActions.Initialize.All());
    }
}
