/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDragEnd,
    CdkDragMove
} from '@angular/cdk/drag-drop';
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2
} from '@angular/core';
import {Store} from '@ngrx/store';
import {sum} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    fromEvent,
    Subscription
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {CursorClassEnum} from '../../../../shared/misc/enums/cursor-class.enum';
import {KeyEnum} from '../../../../shared/misc/enums/key.enum';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {SystemHelper} from '../../../../shared/misc/helpers/system.helper';
import {CALENDAR_CONSTANTS} from '../../../../shared/ui/calendar/contants/calendar.contants';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {NewsResource} from '../../api/news/resources/news.resource';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {TaskCalendarTaskViewModeEnum} from '../../enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../enums/task-card-description-type.enum';
import {DayCard} from '../../models/day-cards/day-card';
import {Task} from '../../models/tasks/task';
import {CalendarQueries} from '../../store/calendar/calendar/calendar.queries';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';
import {NewsQueries} from '../../store/news/news.queries';
import {RelationQueries} from '../../store/relations/relation.queries';
import {
    ProjectTaskActions,
    ResizeTaskPayload
} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkDaysQueries} from '../../store/work-days/work-days.queries';
import {DayCardMove} from '../task-daycards/task-daycards.component';
import {
    TaskCardWeekModel,
    TaskCardWeekModelHelper,
} from './task-card-week.model.helper';

export const CSS_CLASS_CARD_RELEVANT = 'ss-task-card-week--relevant';
export const CSS_CLASS_CARD_FOCUSED = 'ss-task-card-week--focused';
export const CSS_CLASS_CARD_SELECTED = 'ss-task-card-week--selected';
export const CSS_CLASS_CARD_DIMMED_OUT = 'ss-task-card-week--dimmed-out';
export const CSS_CLASS_CARD_COPYING = 'ss-task-card-week--copying';
export const CSS_CLASS_CARD_MOVABLE = 'ss-task-card-week--movable';
export const CSS_CLASS_CARD_NOT_SELECTABLE = 'ss-task-card-week--not-selectable';
export const CSS_CLASS_CARD_IS_EXPANDED = 'ss-task-card-week--expanded';
export const CSS_CLASS_CARD_IS_RESIZING = 'ss-task-card-week--resizing';
export const CSS_CLASS_CARD_IS_LOADING = 'ss-task-card-week--loading';
export const CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED = 'ss-task-card-week--css-has-supported';
export const NUMBER_OF_DAYS_PER_WEEK = 7;
export const RESIZE_SNAP_THRESHOLD = 20;
export const TASK_CARD_WEEK_ID_PREFIX = 'ss-task-card-week-';

interface ResizeTaskEvent {
    distance: number;
    amount: number;
}

@Component({
    selector: 'ss-task-card-week',
    templateUrl: './task-card-week.component.html',
    styleUrls: ['./task-card-week.component.scss'],
})
export class TaskCardWeekComponent implements OnInit, OnDestroy {
    @Input()
    public showDayCardIndicators = false;

    @Input()
    public set calendarScope(scope: TimeScope) {
        const {start, end} = scope;
        this._calendarScope = scope;
        this._calendarStart = start;
        this._calendarEnd = end;
        this._setCardTaskModel();
        this._setCardTaskWeek();
        this._canShowTaskCardWeek();
    }

    @Input()
    public canDragTask = true;

    @Input()
    public set canSelectTask(canSelectTask: boolean) {
        this._canSelectTask = canSelectTask;
        this._setCardClasses();
    }

    @Input()
    public set expandedWeeks(dates: moment.Moment[]) {
        this._expandedWeeks = dates;
        this._canShowDescription();
        this._canShowDailyCards();
        this._setCardClasses();
        this._setTaskDurationStyles();
    }

    public get expandedWeeks(): moment.Moment[] {
        return this._expandedWeeks;
    }

    @Input()
    public taskId = '';

    @Input()
    public focusedDaycardId: string;

    @Input()
    public set isCopying(isCopying: boolean) {
        this._isCopying = isCopying;

        this._setCardClasses();
    }

    @Input()
    public set isMultiSelecting(isMultiSelecting: boolean) {
        this._isMultiSelecting = isMultiSelecting;
        this._setCardClasses();
    }

    @Input()
    public set isTaskDimmedOut(isTaskDimmedOut: boolean) {
        this._isTaskDimmedOut = isTaskDimmedOut;
        this._setCardClasses();
    }

    public get isTaskDimmedOut(): boolean {
        return this._isTaskDimmedOut;
    }

    @Input()
    public set weekWidth(weekWidth: number) {
        this._weekWidth = weekWidth;
        this._setTaskDurationStyles();
    }

    @Input()
    public set selectedTasksIds(selectedTasksIds: string[]) {
        this.isSelected = selectedTasksIds.some(id => id === this.taskId);
        this._hasSelectedTasks = !!selectedTasksIds.length;
        this._setCardClasses();
    }

    @Input()
    public set focusedTaskId(focusedTaskId: string) {
        this.isFocused = this.taskId === focusedTaskId;
        this._setCardClasses();
    }

    @Input()
    public set taskViewMode(mode: TaskCalendarTaskViewModeEnum) {
        this._taskViewMode = mode;

        this._setTaskDurationStyles();
    }

    public get taskViewMode(): TaskCalendarTaskViewModeEnum {
        return this._taskViewMode;
    }

    @Input()
    public showUnreadNews = false;

    @Output()
    public selectTask: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    public isResizing: EventEmitter<boolean> = new EventEmitter<boolean>();

    public get weekWidth(): number {
        return this._weekWidth;
    }

    public isLoading = false;

    public isSelected: boolean;

    public isFocused: boolean;

    public cardTaskModel: TaskCardWeekModel;

    public canCreateDayCard: boolean;

    public canEditTaskSchedule: boolean;

    public taskContinuesToLeft: boolean;

    public taskContinuesToRight: boolean;

    public taskDurationStyles: { [key: string]: string | number };

    public taskPredecessorRelations: RelationResource[] = [];

    public taskSuccessorRelations: RelationResource[] = [];

    public canShowTaskCardWeek: boolean;

    public canShowDescription: boolean;

    public canShowDailyCards: boolean;

    public dayCards: DayCard[];

    public cardClasses: { [key: string]: boolean };

    public cardStyles: { [key: string]: string };

    public footerStyles: { [key: string]: string };

    public resizeAmount = 0;

    public resizeAtEnd: boolean;

    public selectedCheckColor = COLORS.light_blue;

    public taskCardWeekId: string;

    public workDays: WorkDaysResource;

    private _task: Task;

    private _calendarScope: TimeScope;

    private _calendarStart: moment.Moment;

    private _calendarEnd: moment.Moment;

    private _canSelectTask = false;

    private _expandedWeeks: moment.Moment[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _hasSelectedTasks: boolean;

    private _isCopying: boolean;

    private _isMultiSelecting: boolean;

    private _initialResizeIndex: number;

    private _isResizing: boolean;

    private _isResizeCanceled: boolean;

    private _isTaskDimmedOut: boolean;

    private _keyupSubscription: Subscription;

    private _news: NewsResource[] = [];

    private _rightSteps: number[];

    private _leftSteps: number[];

    private _weekWidth: number;

    private _taskViewMode: TaskCalendarTaskViewModeEnum = TaskCalendarTaskViewModeEnum.Week;

    private _taskCardDescriptionType: TaskCardDescriptionTypeEnum;

    constructor(private _calendarQueries: CalendarQueries,
                private _dateParser: DateParserStrategy,
                private _dayCardQueries: DayCardQueries,
                private _flyoutService: FlyoutService,
                private _modalService: ModalService,
                private _newsQueries: NewsQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _relationQueries: RelationQueries,
                private _renderer: Renderer2,
                private _store: Store<State>,
                private _systemHelper: SystemHelper,
                private _taskCardWeekModelHelper: TaskCardWeekModelHelper,
                private _workDaysQueries: WorkDaysQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCreateDayCard(cardSlotDate: moment.Moment): void {
        this._modalService.open({
            id: ModalIdEnum.CreateDayCard,
            data: {
                taskId: this.taskId,
                date: cardSlotDate,
            },
        });
    }

    public handleMoveDayCard(event: DayCardMove): void {
        const {currentDate, item: {id: dayCardId, task: {id: taskId}}} = event;

        this._store.dispatch(new DayCardActions.Update.Slots({
            taskId,
            dayCardId,
            currentDate,
        }));
    }

    public handleCopyDayCard(event: DayCardMove): void {
        const {currentDate, item: {title, manpower, notes}} = event;
        const saveDayCard = new SaveDayCardResource(title, currentDate, manpower, notes);
        const taskId = this.taskId;

        this._store.dispatch(new DayCardActions.Create.One({taskId, saveDayCard}));
    }

    public handleSelect(): void {
        if (!this._isResizing) {
            this.selectTask.emit(this._task.id);
        }
    }

    public handleResizeStarted(resizeAtEnd: boolean): void {
        const date: moment.Moment = resizeAtEnd ? this._getEndByViewMode() : this._getStartByViewMode();

        this.resizeAtEnd = resizeAtEnd;
        this._initialResizeIndex = date.diff(this._calendarStart, 'd');
        this._setSnapStepsDistances();
        this._isResizing = true;
        this._setCardClasses();
        this._renderer.addClass(document.body, CursorClassEnum.EWResize);

        this._isResizeCanceled = false;
        this._setKeyupSubscription();

        this.isResizing.emit(true);
        this._flyoutService.open(this.taskCardWeekId);
    }

    public handleResizeEnded(event: CdkDragEnd): void {
        event.source.reset();
        this.cardStyles = {};
        this.footerStyles = {};
        this._isResizing = false;
        this._setCardClasses();
        this._renderer.removeClass(document.body, CursorClassEnum.EWResize);

        this._resizeTask(this.resizeAmount, this.resizeAtEnd);
        this.resizeAmount = 0;

        this._unsetKeyupSubscription();

        this.isResizing.emit(false);
        this._flyoutService.close(this.taskCardWeekId);
    }

    public handleResizeRight(event: CdkDragMove): void {
        const {distance, amount} = this._getResizeTaskEvent(event);

        this.resizeAmount = amount;

        this.cardStyles = {
            width: `calc(100% + ${distance}px)`,
        };
    }

    public handleResizeLeft(event: CdkDragMove): void {
        const {distance, amount} = this._getResizeTaskEvent(event);

        this.resizeAmount = amount;

        this.cardStyles = {
            width: `calc(100% - ${distance}px)`,
            transform: `translate3d(${distance}px, 0, 0)`,
        };

        this.footerStyles = {
            transform: `translate3d(${distance * -1}px, 0, 0)`,
        };
    }

    private _setCardTaskWeek(): void {
        if (!this.cardTaskModel) {
            return;
        }

        this._setTaskBoundaries();
        this._setCardClasses();
        this._canShowDescription();
        this._canShowDailyCards();
        this._setTaskScheduleEditPermission();
        this._setTaskDurationStyles();
        this._setTaskCardWeekId();
    }

    private _hasExpandedWeeks(): boolean {
        return this.expandedWeeks && this.expandedWeeks.length > 0;
    }

    private _canShowDescription(): void {
        this.canShowDescription = !this._hasExpandedWeeks();
    }

    private _canShowDailyCards(): void {
        this.canShowDailyCards = this._hasExpandedWeeks();
    }

    private _setNews(news: NewsResource[]): void {
        this._news = news;

        this._setCardTaskModel();
    }

    private _cancelResize(): void {
        this._isResizeCanceled = true;
        document.dispatchEvent(new Event('mouseup'));
    }

    private _setKeyupSubscription(): void {
        this._keyupSubscription = fromEvent(window, 'keyup')
            .pipe(filter(({key}: KeyboardEvent) => key === KeyEnum.Escape))
            .subscribe(() => this._cancelResize());
    }

    private _setSubscriptions() {
        this._disposableSubscriptions.add(
            combineLatest([
                this._projectTaskQueries
                    .observeTaskById(this.taskId)
                    .pipe(
                        filter(task => !!task.schedule),
                    ),
                this._newsQueries.observeItemsByIdentifierPair([new ObjectIdentifierPair(ObjectTypeEnum.Task, this.taskId)]),
                this._calendarQueries.observeCalendarUserSettings(),
            ])
                .subscribe(([task, news, {taskCardDescriptionType}]) => {
                    this._taskCardDescriptionType = taskCardDescriptionType;

                    this._setNews(news);
                    this._setTask(task);
                    this._setCardTaskWeek();
                })
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries
                .observeDayCardsByTask(this.taskId)
                .subscribe((dayCards: DayCard[]) => this._setDayCards(dayCards))
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries
                .observeDayCardRequestStatusByTask(this.taskId)
                .subscribe(status => this._handleRequestStatus(status))
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries
                .observeAddDayCardPermissionByTask(this.taskId)
                .subscribe((carCreateDayCard: boolean) => {
                    this._setCreatePermission(carCreateDayCard);
                })
        );

        this._disposableSubscriptions.add(
            this._relationQueries.observeFinishToStartPredecessorRelationsByTaskId(this.taskId)
                .subscribe(relations => this.taskPredecessorRelations = relations)
        );

        this._disposableSubscriptions.add(
            this._relationQueries.observeFinishToStartSuccessorRelationsByTaskId(this.taskId)
                .subscribe(relations => this.taskSuccessorRelations = relations)
        );

        this._disposableSubscriptions.add(
            this._workDaysQueries
                .observeWorkDays()
                .subscribe(workDays => this.workDays = workDays));
    }

    private _setTask(task: Task): void {
        this._task = task;

        this._setCardTaskModel();
        this._canShowTaskCardWeek();
    }

    private _setTaskCardWeekId(): void {
        const id = this.cardTaskModel.id;

        this.taskCardWeekId = TASK_CARD_WEEK_ID_PREFIX + id;
    }

    private _setTaskDurationStyles(): void {
        if (this.cardTaskModel == null) {
            return;
        }

        const {weekSpacer} = CALENDAR_CONSTANTS;
        const {start, end, cardStart, cardEnd, solidColor} = this.cardTaskModel;
        const weeksWidth = this._getWeeksWidths();

        const truncatedStart = moment.max(this._calendarStart, start);
        const truncatedEnd = moment.min(this._calendarEnd, end);

        const shiftedStart = truncatedStart.diff(cardStart, 'd');
        const shiftedEnd = cardEnd.diff(truncatedEnd, 'd');

        const startTaskIndex = truncatedStart.diff(this._calendarStart, 'w');
        const endTaskIndex = truncatedEnd.diff(this._calendarStart, 'w');

        const firstWeekWidth = weeksWidth[startTaskIndex] - weekSpacer;
        const lastWeekWidth = weeksWidth[endTaskIndex] - weekSpacer;

        const leftSpace = (firstWeekWidth / NUMBER_OF_DAYS_PER_WEEK) * shiftedStart;
        const rightSpace = (lastWeekWidth / NUMBER_OF_DAYS_PER_WEEK) * shiftedEnd;
        const marginLeft = this._taskViewMode === TaskCalendarTaskViewModeEnum.Week ? leftSpace : 0;

        const taskDurationWith = sum(weeksWidth.slice(startTaskIndex, endTaskIndex + 1));

        this.taskDurationStyles = {
            ['background-color']: solidColor,
            ['margin-left.px']: marginLeft,
            ['width.px']: taskDurationWith - (leftSpace + weekSpacer) - rightSpace,
        };

    }

    private _setCardTaskModel(): void {
        if (this._task == null) {
            return;
        }

        this.cardTaskModel = this._taskCardWeekModelHelper
            .fromTaskWithScopeNewsAndDescriptionType(this._task, this._calendarScope, this._taskCardDescriptionType, this._news);
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
        this._setCardClasses();
    }

    private _unsetKeyupSubscription(): void {
        this._keyupSubscription.unsubscribe();
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setDayCards(dayCards: DayCard[]): void {
        this.dayCards = dayCards;
    }

    private _setCreatePermission(carCreateDayCard: boolean): void {
        this.canCreateDayCard = carCreateDayCard;
    }

    private _setTaskScheduleEditPermission(): void {
        this.canEditTaskSchedule = this.cardTaskModel.permissions.canUpdate;
    }

    private _setTaskBoundaries(): void {
        const {start, end} = this.cardTaskModel;

        this.taskContinuesToLeft = start.isBefore(this._calendarStart);
        this.taskContinuesToRight = end.isAfter(this._calendarEnd);
    }

    private _setCardClasses(): void {
        if (this._task == null) {
            return;
        }

        const {permissions: {canUpdate, canAssign}} = this._task;
        const isRelevantForSelect = this._canSelectTask || (!this._hasSelectedTasks && !this._isMultiSelecting);
        const isRelevant = (canUpdate || canAssign || (this._isCopying && !this._hasExpandedWeeks())) && isRelevantForSelect;

        this.cardClasses = {
            [CSS_CLASS_CARD_DIMMED_OUT]: this._isTaskDimmedOut,
            [CSS_CLASS_CARD_FOCUSED]: this.isFocused,
            [CSS_CLASS_CARD_SELECTED]: this.isSelected,
            [CSS_CLASS_CARD_RELEVANT]: isRelevant,
            [CSS_CLASS_CARD_COPYING]: this._isCopying && !this._hasExpandedWeeks() && this.canDragTask,
            [CSS_CLASS_CARD_MOVABLE]: canUpdate && !this._isCopying && !this._hasExpandedWeeks() && this.canDragTask,
            [CSS_CLASS_CARD_NOT_SELECTABLE]: !this._canSelectTask && this._isMultiSelecting,
            [CSS_CLASS_CARD_IS_EXPANDED]: this._hasExpandedWeeks(),
            [CSS_CLASS_CARD_IS_RESIZING]: this._isResizing,
            [CSS_CLASS_CARD_IS_LOADING]: this.isLoading,
            [CSS_CLASS_CARD_IS_CSS_HAS_SUPPORTED]: this._systemHelper.isCssHasSupported(),
        };
    }

    private _canShowTaskCardWeek(): void {
        if (!this._task) {
            return;
        }

        const {start, end} = this._task.schedule;
        const calendarStartWithinTaskSchedule = this._calendarStart.isBetween(start, end, 'd', '[]');
        const calendarEndWithinTaskSchedule = this._calendarEnd.isBetween(start, end, 'd', '[]');
        const taskScheduleStartWithinCalendar = moment(start).isBetween(this._calendarStart, this._calendarEnd, 'd', '[]');
        const taskScheduleEndWithinCalendar = moment(end).isBetween(this._calendarStart, this._calendarEnd, 'd', '[]');

        this.canShowTaskCardWeek = calendarStartWithinTaskSchedule
            || calendarEndWithinTaskSchedule
            || taskScheduleStartWithinCalendar
            || taskScheduleEndWithinCalendar;
    }

    private _resizeTask(resizeAmount: number, resizeAtEnd: boolean): void {
        if (resizeAmount !== 0 && !this._isResizeCanceled) {
            let start = moment(this._task.schedule.start);
            let end = moment(this._task.schedule.end);
            const taskId = this._task.id;

            if (resizeAtEnd) {
                end = end.add(this.resizeAmount, 'd');
            } else {
                start = start.add(this.resizeAmount, 'd');
            }

            const payload: ResizeTaskPayload = {
                taskId,
                start,
                end,
            };

            this._store.dispatch(new ProjectTaskActions.Resize.One(payload));
        }
    }

    private _getAmountOffset(): number {
        if (this.resizeAtEnd) {
            const end = this.cardTaskModel.end;
            const truncatedEnd = this._getEndByViewMode();

            return truncatedEnd.diff(end, 'd');
        } else {
            const start = this.cardTaskModel.start;
            const truncatedStart = this._getStartByViewMode();

            return truncatedStart.diff(start, 'd');
        }
    }

    private _getResizeTaskEvent(event: CdkDragMove): ResizeTaskEvent {
        const distance = event.distance.x;
        const steps = this._getStepsForDistance(distance);
        const {index: currentIndex, isFallbackIndex} = this._getHoverIndex(distance, steps);
        const {amount: snapAmount, distance: snapDistance} = this._getNearestSnap(distance, steps, currentIndex);
        const shouldSnap = isFallbackIndex || Math.abs(snapDistance - distance) <= RESIZE_SNAP_THRESHOLD;
        const amount = snapAmount + this._getAmountOffset();

        return {
            amount,
            distance: shouldSnap ? snapDistance : distance,
        };
    }

    private _getStepsForDistance(distance: number): number[] {
        const isResizingToRight = distance > 0;
        return isResizingToRight ? this._rightSteps : this._leftSteps;
    }

    private _getHoverIndex(distance: number, steps: number[]): { index: number; isFallbackIndex: boolean } {
        const absDistance = Math.abs(distance);
        const hoverIndex = steps.findIndex(step => absDistance < step);
        const foundIndex = hoverIndex > -1;

        return {
            index: foundIndex ? hoverIndex : steps.length - 1,
            isFallbackIndex: !foundIndex,
        };
    }

    private _getNearestSnap(distance: number, steps: number[], currentIndex: number): ResizeTaskEvent {
        const cardinality = Math.sign(distance);
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prev = {
            amount: prevIndex * cardinality,
            distance: steps[prevIndex] * cardinality,
        };
        const next = {
            amount: currentIndex * cardinality,
            distance: steps[currentIndex] * cardinality,
        };
        const absDistanceToNextSnap = Math.abs(next.distance - distance);
        const absDistanceToPrevSnap = Math.abs(prev.distance - distance);
        const nextIsCloser = absDistanceToNextSnap < absDistanceToPrevSnap;

        return nextIsCloser ? next : prev;
    }

    private _setSnapStepsDistances(): void {
        let leftDaysWidth: number[];
        let rightDaysWidth: number[];
        const daysWidth = this._getDaysWidths();
        const start = this.cardTaskModel.start;
        const end = this.cardTaskModel.end;

        if (this.resizeAtEnd) {
            const trunkedTaskStartIndex = moment.max(this._calendarStart, start);
            const startTaskIndex = trunkedTaskStartIndex.diff(this._calendarStart, 'd');

            leftDaysWidth = daysWidth.slice(startTaskIndex + 1, this._initialResizeIndex + 1);
            rightDaysWidth = daysWidth.slice(this._initialResizeIndex + 1);
        } else {
            const trunkedTaskEndIndex = moment.min(this._calendarEnd, end);
            const endTaskIndex = trunkedTaskEndIndex.diff(this._calendarStart, 'd');

            leftDaysWidth = daysWidth.slice(0, this._initialResizeIndex);
            rightDaysWidth = daysWidth.slice(this._initialResizeIndex, endTaskIndex);
        }

        leftDaysWidth.reverse();
        this._leftSteps = this._getSnapSteps(leftDaysWidth);
        this._rightSteps = this._getSnapSteps(rightDaysWidth);
    }

    private _getDaysWidths(): number[] {
        const size = this._calendarEnd.diff(this._calendarStart, 'd') + 1;
        const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
        const expandedDayWidth = expandedWeekWidth / NUMBER_OF_DAYS_PER_WEEK;
        const collapsedDayWidth = this._weekWidth / NUMBER_OF_DAYS_PER_WEEK;

        return new Array(size)
            .fill(this._calendarStart)
            .map((date, index) => date.clone().add(index, 'd'))
            .map(date => this._isWeekExpanded(date))
            .map((isExpanded, index) => {
                const hasSpacer = this.resizeAtEnd
                    ? index % NUMBER_OF_DAYS_PER_WEEK === 0
                    : (index + 1) % NUMBER_OF_DAYS_PER_WEEK === 0;

                const spacerWidth = hasSpacer ? weekSpacer : 0;
                const dayWidth = isExpanded ? expandedDayWidth : collapsedDayWidth;

                return dayWidth + spacerWidth;
            });
    }

    private _getWeeksWidths(): number[] {
        const size = this._calendarEnd.diff(this._calendarStart, 'w') + 1;
        const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
        const expandedWeekWidthWithSpacer = expandedWeekWidth + weekSpacer;
        const collapsedWeekWidthWithSpacer = this._weekWidth + weekSpacer;

        return new Array(size)
            .fill(this._calendarStart)
            .map((date, index) => date.clone().add(index, 'w'))
            .map(date => this._isWeekExpanded(date))
            .map(isExpanded => isExpanded ? expandedWeekWidthWithSpacer : collapsedWeekWidthWithSpacer);
    }

    private _isWeekExpanded(date: moment.Moment): boolean {
        return this._expandedWeeks.some(expandedWeek => this._dateParser.isSame(expandedWeek, date, 'w'));
    }

    private _getSnapSteps(widths: number[]): number[] {
        let widthSum = 0;
        return [widthSum, ...widths].map(width => widthSum += width);
    }

    private _getStartByViewMode(): moment.Moment {
        const {start, cardStart} = this.cardTaskModel;

        return this._taskViewMode === TaskCalendarTaskViewModeEnum.Week ? cardStart : start;
    }

    private _getEndByViewMode(): moment.Moment {
        const {end, cardEnd} = this.cardTaskModel;

        return this._taskViewMode === TaskCalendarTaskViewModeEnum.Week ? cardEnd : end;
    }
}
