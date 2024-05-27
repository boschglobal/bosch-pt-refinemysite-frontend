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
} from '@angular/core';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {withLatestFrom} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {
    CRAFT_COLORS,
    CraftColor
} from '../../../../../shared/ui/constants/colors.constant';
import {NewsResource} from '../../../../project-common/api/news/resources/news.resource';
import {RelationResource} from '../../../../project-common/api/relations/resources/relation.resource';
import {TaskConstraintsResource} from '../../../../project-common/api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../../../project-common/api/tasks/resources/task.resource';
import {TASK_CARD_DESCRIPTION_BY_TYPE} from '../../../../project-common/containers/task-card-week/task-card-week.model.helper';
import {TaskCardDescriptionTypeEnum} from '../../../../project-common/enums/task-card-description-type.enum';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {Task} from '../../../../project-common/models/tasks/task';
import {
    TaskShiftAmountMode,
    TaskShiftAmountUnit
} from '../../../../project-common/pipes/task-shift-amount/task-shift-amount.pipe';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {NewsQueries} from '../../../../project-common/store/news/news.queries';
import {RelationQueries} from '../../../../project-common/store/relations/relation.queries';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-tasks-preview',
    templateUrl: './tasks-preview.component.html',
    styleUrls: ['./tasks-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPreviewComponent implements OnDestroy {

    @Input()
    public isTaskSelected: (taskId: string) => boolean = () => false;

    @Input()
    public isTaskFocused: (taskId: string) => boolean = () => false;

    @Input()
    public isTaskDimmedOut: (taskId: string) => boolean = () => false;

    @Input()
    public shiftAmount: number;

    @Input()
    public shiftMode: TaskShiftAmountMode;

    @Input()
    public shiftUnit: TaskShiftAmountUnit = 'week';

    @Input()
    public set taskIds(taskIds: string[]) {
        if (taskIds.length > 1) {
            this._setStackedPreview(taskIds);
        } else {
            this._setCardPreview(taskIds);
        }
    }

    public backgroundTask: TasksPreviewModel;

    public mainTask: TasksPreviewModel;

    public news: NewsResource[] = [];

    public predecessorRelations: RelationResource[] = [];

    public showPreview = false;

    public showUnreadNews = false;

    public successorRelations: RelationResource[] = [];

    public tasksCount: number;

    public tasksPreviewMode: TasksPreviewModeEnum;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _taskCardDescriptionType: TaskCardDescriptionTypeEnum;

    constructor(
        private _calendarQueries: CalendarQueries,
        private _changeDetectorRef: ChangeDetectorRef,
        private _newsQueries: NewsQueries,
        private _projectTaskQueries: ProjectTaskQueries,
        private _relationQueries: RelationQueries) {
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public get TasksPreviewModeEnum() {
        return TasksPreviewModeEnum;
    }

    private _createTasksPreviewModel(task: Task): TasksPreviewModel {
        return {
            constraints: task.constraints,
            color: CRAFT_COLORS.find(color => color.solid === task.projectCraft.color),
            description: TASK_CARD_DESCRIPTION_BY_TYPE[this._taskCardDescriptionType](task),
            selected: this.isTaskSelected(task.id),
            focused: this.isTaskFocused(task.id),
            dimmed: this.isTaskDimmedOut(task.id),
            statistics: task.statistics,
            status: task.status,
            title: task.name,
        };
    }

    private _setCardPreview(taskIds: string[]): void {
        const taskId = taskIds[0];

        this.tasksPreviewMode = TasksPreviewModeEnum.Simple;

        this._setTasksSubscriptions([taskId]);
        this._setDependenciesSubscriptions(taskId);
    }

    private _setShowUnreadNews(showUnreadNews: boolean): void {
        this.showUnreadNews = showUnreadNews;
    }

    private _setStackedPreview(taskIds: string[]): void {
        const topTaskIndex = taskIds.length - 1;
        const backgroundTaskIndex = topTaskIndex - 1;
        const topTaskId = taskIds[topTaskIndex];
        const backgroundTaskId = taskIds[backgroundTaskIndex];

        this.tasksCount = taskIds.length;
        this.tasksPreviewMode = TasksPreviewModeEnum.Stacked;

        this._setTasksSubscriptions([topTaskId, backgroundTaskId]);
    }

    private _setDependenciesSubscriptions(taskId: string): void {
        this._disposableSubscriptions.add(
            this._relationQueries.observeFinishToStartPredecessorRelationsByTaskId(taskId)
                .subscribe(relations => {
                    this.predecessorRelations = relations;

                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._relationQueries.observeFinishToStartSuccessorRelationsByTaskId(taskId)
                .subscribe(relations => {
                    this.successorRelations = relations;

                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._newsQueries.observeItemsByIdentifierPair([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)])
                .subscribe(news => this._setNews(news))
        );
    }

    private _setNews(news: NewsResource[]): void {
        this.news = news;
    }

    private _setTasksSubscriptions(taskIds: string[]): void {
        this._disposableSubscriptions.add(
            combineLatest(taskIds.map(taskId => this._projectTaskQueries.observeTaskById(taskId)))
                .pipe(withLatestFrom(this._calendarQueries.observeCalendarUserSettings()))
                .subscribe(([[mainTask, backgroundTask], calendarUserSettings]) => {
                    this._taskCardDescriptionType = calendarUserSettings.taskCardDescriptionType;
                    this._setShowUnreadNews(calendarUserSettings.showUnreadNews);

                    this.mainTask = this._createTasksPreviewModel(mainTask);
                    this.backgroundTask = backgroundTask ? this._createTasksPreviewModel(backgroundTask) : null;

                    this.showPreview = true;
                    this._changeDetectorRef.detectChanges();
                })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

}

export enum TasksPreviewModeEnum {
    Simple,
    Stacked
}

export class TasksPreviewModel {
    constraints: TaskConstraintsResource;
    color: CraftColor;
    description: string;
    focused: boolean;
    selected: boolean;
    dimmed: boolean;
    statistics: TaskStatistics;
    status: TaskStatusEnum;
    title: string;
}
