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
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {AlertTypeEnum} from '../../../../shared/alert/enums/alert-type.enum';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {TransitionStatusEnum} from '../../../../shared/ui/status-transition/status-transition.component';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {
    CalendarViewItem,
    CalendarViewItemsSortHelper,
} from '../../helpers/calendar-view-items-sort.helper';
import {Milestone} from '../../models/milestones/milestone';
import {Reschedule} from '../../models/reschedule/reschedule';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {RescheduleQueries} from '../../store/reschedule/reschedule.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

@Component({
    selector: 'ss-project-reschedule-review',
    templateUrl: './project-reschedule-review.component.html',
    styleUrls: ['./project-reschedule-review.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRescheduleReviewComponent implements OnInit, OnDestroy {

    public callout: MessageData = {
        type: AlertTypeEnum.Success,
        message: RESCHEDULE_TRANSLATION_KEYS.successMessage,
        messageParams: {},
        preformatted: false,
    };

    public failedItems: GroupItem<FailedItem>[] = [];

    public itemsPerGroupItem = 3;

    public objectTypeEnum = ObjectTypeEnum;

    public reschedule: Reschedule | null = null;

    public summary = {
        milestones: RESCHEDULE_TRANSLATION_KEYS.milestonesSummary,
        tasks: RESCHEDULE_TRANSLATION_KEYS.tasksSummary,
    };

    public transitionStatus = TransitionStatusEnum.InProgress;

    public validationComplete = false;

    private _disposableSubscriptions = new Subscription();

    private _transitionStatusMap: { [key in RequestStatusEnum]: TransitionStatusEnum } = {
        [RequestStatusEnum.empty]: TransitionStatusEnum.Completed,
        [RequestStatusEnum.error]: TransitionStatusEnum.Error,
        [RequestStatusEnum.progress]: TransitionStatusEnum.InProgress,
        [RequestStatusEnum.success]: TransitionStatusEnum.Completed,
    };

    private _workAreas: WorkareaResource[] = [];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _workareaQueries: WorkareaQueries,
        private _rescheduleQueries: RescheduleQueries,
        private _store: Store,
    ) {
    }

    public ngOnInit(): void {
        this._setSubscriptions();
    }

    public ngOnDestroy(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleMilestoneCardClicked(milestone: Milestone): void {
        this._store.dispatch(
            new CalendarScopeActions.Resolve.NavigateToElement(
                new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)
            )
        );
    }

    public handleTaskCardClicked(task: Task): void {
        this._store.dispatch(
            new CalendarScopeActions.Resolve.NavigateToElement(
                new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)
            )
        );
    }

    private _createFailedItems(rescheduleResource: RescheduleResource): GroupItem<FailedItem>[] {
        return [{
            id: UUID.v4(),
            items: [
                ...rescheduleResource.failed.milestones.map(
                    (item): FailedItem => ({
                        id: item,
                        resource: null,
                        type: ObjectTypeEnum.Milestone,
                    })),
                ...rescheduleResource.failed.tasks.map(
                    (item): FailedItem => ({
                        id: item,
                        resource: null,
                        type: ObjectTypeEnum.Task,
                    })),
            ],
        }];
    }

    private _createFailedItemsWithResources(reschedule: Reschedule): GroupItem<FailedItem>[] {
        const calendarViewItems: CalendarViewItem[] = [
            ...reschedule.failed.milestones.map(item => ({resource: item, type: ObjectTypeEnum.Milestone})),
            ...reschedule.failed.tasks.map(item => ({resource: item, type: ObjectTypeEnum.Task})),
        ];
        const sortedItems = CalendarViewItemsSortHelper.sort(calendarViewItems, this._workAreas);

        return [{
            id: UUID.v4(),
            items: sortedItems.map(({resource, type}) => ({
                resource,
                type,
                id: resource.id,
            })),
        }];
    }

    private _setCalloutMessage(): void {
        if (this.failedItems[0] && this.failedItems[0].items.length >= 1) {
            this.callout.type = AlertTypeEnum.Warning;
            this.callout.preformatted = true;

            if (this.failedItems[0].items.length > 1) {
                this.callout.message = RESCHEDULE_TRANSLATION_KEYS.warning;
                this.callout.messageParams = {
                    numberOfItems: this.failedItems[0].items.length,
                };
            } else {
                this.callout.message = RESCHEDULE_TRANSLATION_KEYS.warningSingular;
            }
        } else {
            const successfulMilestones = this.reschedule.successful.milestones.length;
            const successfulTasks = this.reschedule.successful.tasks.length;
            const successfulItems = successfulMilestones + successfulTasks;
            if (successfulItems > 0) {
                this.callout.message = RESCHEDULE_TRANSLATION_KEYS.successMessage;
                this.callout.type = AlertTypeEnum.Success;
            } else {
                this.callout.message = RESCHEDULE_TRANSLATION_KEYS.notFound;
                this.callout.type = AlertTypeEnum.Warning;
            }
        }
    }

    private _setSummaryListMessages(): void {
        const successfulMilestones = this.reschedule.successful.milestones.length;
        const successfulTasks = this.reschedule.successful.tasks.length;
        if (successfulMilestones === 1) {
            this.summary.milestones = RESCHEDULE_TRANSLATION_KEYS.milestonesSummarySingular;
        }
        if (successfulTasks === 1) {
            this.summary.tasks = RESCHEDULE_TRANSLATION_KEYS.tasksSummarySingular;
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workareaQueries.observeWorkareas()
                .subscribe(workAreas => this._workAreas = workAreas)
        );

        this._disposableSubscriptions.add(
            this._rescheduleQueries.observeRequestStatus()
                .subscribe(requestStatus => {
                    this.transitionStatus = this._transitionStatusMap[requestStatus];
                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._rescheduleQueries.observeCurrentItem()
                .subscribe(rescheduleResource => {
                    this.reschedule = Reschedule.fromRescheduleResource(rescheduleResource);
                    this.failedItems = this._createFailedItems(rescheduleResource);
                    this._setCalloutMessage();
                    this._setSummaryListMessages();
                    this.validationComplete = true;
                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._rescheduleQueries.observeRescheduleWithResources().subscribe((reschedule) => {
                this.reschedule = reschedule;
                this.failedItems = this._createFailedItemsWithResources(reschedule);
                this._setCalloutMessage();
                this._setSummaryListMessages();
                this.validationComplete = true;
                this._changeDetectorRef.detectChanges();
            })
        );
    }
}

interface MessageData {
    type: AlertTypeEnum;
    message: string;
    messageParams: Record<string, string | number>;
    preformatted: boolean;
}

export interface FailedItem {
    id: string;
    type: ObjectTypeEnum;
    resource: Task | Milestone;
}

export const RESCHEDULE_TRANSLATION_KEYS: Record<string, string> = Object.freeze({
    successMessage: 'Reschedule_Review_SuccessMessage',
    milestonesSummary: 'Reschedule_Review_MilestonesSummary',
    milestonesSummarySingular: 'Reschedule_Review_MilestonesSummarySingular',
    tasksSummary: 'Reschedule_Review_TasksSummary',
    tasksSummarySingular: 'Reschedule_Review_TasksSummarySingular',
    warning: 'Reschedule_Review_Warning',
    warningSingular: 'Reschedule_Review_WarningSingular',
    notFound: 'Generic_NoRecordsFound',
});
