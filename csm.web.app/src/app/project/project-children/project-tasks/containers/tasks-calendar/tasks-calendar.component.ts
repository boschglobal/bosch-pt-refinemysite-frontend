/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    unionBy,
    uniq,
    uniqBy
} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    fromEvent,
    Observable,
    Subject,
    Subscription
} from 'rxjs';
import {
    delay,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../../shared/misc/enums/weekDays.enum';
import {Point} from '../../../../../shared/misc/generic-types/point.type';
import {
    BackdropClickEventTypeEnum,
    BackdropClickHelper,
} from '../../../../../shared/misc/helpers/backdrop-click.helper';
import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {
    KeyboardHelper,
    KeyboardShortcutEnum
} from '../../../../../shared/misc/helpers/keyboard.helper';
import {ResizeHelper} from '../../../../../shared/misc/helpers/resize.helper';
import {MonitoringHelper} from '../../../../../shared/monitoring/helpers/monitoring.helper';
import {
    CalendarComponent,
    CalendarDependency,
    CalendarDependencyAnchorPointByObjectType,
    CalendarDependencyAnchorPointYBaseByStrategyAndObjectType,
    CalendarDrawingStrategy,
    CalendarMilestones,
    CalendarNavigateToElement,
    CalendarRecordGridUnit,
    CalendarRow,
    CreateRecordPayload,
    MoveRecordPayload,
    RowId,
} from '../../../../../shared/ui/calendar/calendar/calendar.component';
import {MoveMilestonePayload} from '../../../../../shared/ui/calendar/milestone-slots/milestone-slots.component';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {DrawerService} from '../../../../../shared/ui/drawer/api/drawer.service';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {CalendarUserSettings} from '../../../../project-common/api/calendar/resources/calendar-user-settings';
import {SaveMilestoneResource} from '../../../../project-common/api/milestones/resources/save-milestone.resource';
import {RelationResource} from '../../../../project-common/api/relations/resources/relation.resource';
import {SaveCopyTaskResource} from '../../../../project-common/api/tasks/resources/save-copy-task.resource';
import {WorkDaysHoliday} from '../../../../project-common/api/work-days/resources/work-days.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {WORKAREA_UUID_EMPTY} from '../../../../project-common/constants/workarea.constant';
import {MilestoneDetailDrawerComponent} from '../../../../project-common/containers/milestone-detail-drawer/milestone-detail-drawer.component';
import {ProjectFiltersCaptureContextEnum} from '../../../../project-common/containers/project-filter-capture/project-filter-capture.component';
import {
    ProjectFilterDrawerComponent,
    ProjectFilterDrawerContext,
} from '../../../../project-common/containers/project-filter-drawer/project-filter-drawer.component';
import {ProjectRescheduleDrawerComponent} from '../../../../project-common/containers/project-reschedule-drawer/project-reschedule-drawer.component';
import {QuickFilterDrawerComponent} from '../../../../project-common/containers/quick-filter-drawer/quick-filter-drawer.component';
import {TASK_CARD_WEEK_DIMENSIONS} from '../../../../project-common/containers/task-card-week/task-card-week.constant';
import {CalendarSelectionActionEnum} from '../../../../project-common/enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../../project-common/enums/calendar-selection-context.enum';
import {TaskCalendarSortingModeEnum} from '../../../../project-common/enums/task-calendar-sorting-mode.enum';
import {TaskCalendarTaskViewModeEnum} from '../../../../project-common/enums/task-calendar-task-view-mode.enum';
import {TasksCalendarModeEnum} from '../../../../project-common/enums/tasks-calendar-mode.enum';
import {CalendarSelectionHelper} from '../../../../project-common/helpers/calendar-selection.helper';
import {DayCardDragHelper} from '../../../../project-common/helpers/day-card-drag.helper';
import {MilestoneAnchor} from '../../../../project-common/helpers/milestone-anchor.helper';
import {TaskCardWeekAnchor} from '../../../../project-common/helpers/task-card-week-anchor.helper';
import {TaskCardWeekPlaceholderAnchor} from '../../../../project-common/helpers/task-card-week-placeholder-anchor.helper';
import {TaskFiltersHelper} from '../../../../project-common/helpers/task-filters.helper';
import {TasksCalendarUrlQueryParamsHelper} from '../../../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {Milestone} from '../../../../project-common/models/milestones/milestone';
import {Task} from '../../../../project-common/models/tasks/task';
import {
    TaskShiftAmountMode,
    TaskShiftAmountUnit
} from '../../../../project-common/pipes/task-shift-amount/task-shift-amount.pipe';
import {CalendarActions} from '../../../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {CalendarScopeActions} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarScopeParameters} from '../../../../project-common/store/calendar/slice/calendar.scope-parameters';
import {DayCardQueries} from '../../../../project-common/store/day-cards/day-card.queries';
import {MilestoneActions} from '../../../../project-common/store/milestones/milestone.actions';
import {MilestoneQueries} from '../../../../project-common/store/milestones/milestone.queries';
import {MilestoneFilters} from '../../../../project-common/store/milestones/slice/milestone-filters';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {QuickFilterContext} from '../../../../project-common/store/quick-filters/quick-filter.slice';
import {RelationQueries} from '../../../../project-common/store/relations/relation.queries';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {
    MoveTaskPayload,
    ProjectTaskActions,
} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkDaysQueries} from '../../../../project-common/store/work-days/work-days.queries';
import {WorkareaActions} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {CalendarWorkareaRowHeaderModel} from '../../presentationals/calendar-workarea-row-header/calendar-workarea-row-header.component';
import {ProjectTasksCreateContext} from '../tasks-create/project-tasks-create.component';
import {TasksDetailDrawerComponent} from '../tasks-detail-drawer/tasks-detail-drawer.component';

@Component({
    templateUrl: './tasks-calendar.component.html',
    styleUrls: ['./tasks-calendar.component.scss'],
    providers: [
        CalendarSelectionHelper,
        TasksCalendarUrlQueryParamsHelper,
    ],
})
export class TasksCalendarComponent implements OnInit, OnDestroy {

    public get focusedElementId(): string {
        return this.focusedTaskId ? this.focusedTaskId : this.focusedMilestoneId;
    }

    @ViewChild('calendar', {static: true})
    public calendar: CalendarComponent;

    @ViewChild('drawer', {static: true, read: ViewContainerRef})
    public drawerViewContainerRef: ViewContainerRef;

    public expandedWeeks: moment.Moment[] = [];

    public addRecordPermission = true;

    public rows: CalendarRow[] = [];

    public projectId: string;

    public hideScroll = false;

    public isLoading = false;

    public isResizingTaskCard = false;

    public drawingStrategy: CalendarDrawingStrategy = 'default';

    public shiftMode: TaskShiftAmountMode = 'move';

    public shiftUnit: TaskShiftAmountUnit = 'week';

    public defaultValues = false;

    public cancelDayCardReasonsModalId = ModalIdEnum.ConfirmDayCardStatusChangeWithReasons;

    public cancelMultipleDayCardReasonsModalId = ModalIdEnum.ConfirmMultipleDayCardStatusChangeWithReasons;

    public calendarCreateDayCardModalId = ModalIdEnum.CreateDayCard;

    public calendarCreateTaskModalId = ModalIdEnum.CreateTask;

    public calendarCreateTopicModalId = ModalIdEnum.CreateTopic;

    public calendarDependencies: CalendarDependency[] = [];

    public calendarEditDayCardModalId = ModalIdEnum.UpdateDayCard;

    public calendarEditMilestoneModalId = ModalIdEnum.UpdateMilestone;

    public calendarEditTaskModalId = ModalIdEnum.UpdateTask;

    public calendarMilestones: CalendarMilestones<Milestone> = {};

    public calendarNavigateToElement: CalendarNavigateToElement;

    public calendarScope: TimeScope;

    public calendarUpdateConstraintsModalId = ModalIdEnum.UpdateConstraints;

    public canShowMultiSelectCommandBar = false;

    public focusedDaycardId: string;

    public selectedMode: TasksCalendarModeEnum = TasksCalendarModeEnum.SixWeeks;

    public taskStyles: { [key: string]: any } = {};

    public isCopying: boolean;

    public isFilterDrawerOpen = false;

    public isQuickFilterDrawerOpen = false;

    public isRescheduleDrawerOpen = false;

    public focusedTaskId: string;

    public focusedMilestoneId: string;

    public selectedMilestoneIds: string[] = [];

    public selectedTaskIds: string[] = [];

    public showUnreadNews = false;

    public weekWidth: number;

    public enableMilestoneCreation: boolean;

    public hasFiltersApplied = false;

    public highlightMilestones = false;

    public highlightTasks = false;

    public calendarUserSettings: CalendarUserSettings = new CalendarUserSettings();

    public calendarSelectionEnabled = false;

    public holidays: WorkDaysHoliday[] = [];

    public recordGridUnit: CalendarRecordGridUnit;

    public taskViewMode: TaskCalendarTaskViewModeEnum;

    public workingDays: WeekDaysEnum[] = [];

    public targetAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType = {
        [ObjectTypeEnum.Milestone]: (id: string): Point => this._milestoneAnchor.target(id),
        [ObjectTypeEnum.Task]: (id: string): Point =>
            this._taskCardWeekAnchor.target(id, TASK_ANCHOR_POINT_CONTEXT_SELECTOR) || this._taskCardWeekPlaceholderAnchor.target(id),
    };

    public sourceAnchorPointByObjectType: CalendarDependencyAnchorPointByObjectType = {
        [ObjectTypeEnum.Milestone]: (id: string): Point => this._milestoneAnchor.source(id),
        [ObjectTypeEnum.Task]: (id: string): Point =>
            this._taskCardWeekAnchor.source(id, TASK_ANCHOR_POINT_CONTEXT_SELECTOR) || this._taskCardWeekPlaceholderAnchor.source(id),
    };

    public anchorPointYBaseByStrategyAndObjectType: CalendarDependencyAnchorPointYBaseByStrategyAndObjectType = {
        ['grid']: {
            [ObjectTypeEnum.Milestone]: this._milestoneAnchor.getYBaseByCalendarLineStrategy('grid'),
            [ObjectTypeEnum.Task]: this._taskCardWeekAnchor.getYBaseByCalendarLineStrategy('grid'),
        },
    };

    public readonly projectTasksCreateContext: ProjectTasksCreateContext = 'calendar';

    private _calendarSelectionResetEvents$ = new Subject<null>();

    private _calendarScopeParameters: CalendarScopeParameters;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _calendarSelectionContext: CalendarSelectionContextEnum;

    private _calendarSelectionAction: CalendarSelectionActionEnum;

    private _cancelMilestoneCreationSubscription: Subscription;

    private _focusedElementDependencies: RelationResource[] = [];

    private _focusedElementDependenciesIdsByType: { [key in ObjectTypeEnum]?: string[] } = {};

    private _focusedMilestoneSubtasksIds: string[] = [];

    private _focusedMilestoneSubscriptions: Subscription = new Subscription();

    private _focusedTaskSubscriptions: Subscription = new Subscription();

    private _generalDependencies: RelationResource[] = [];

    private _hasSelectedItems: boolean;

    private _highlightedMilestoneIds: string[];

    private _highlightedTaskIds: string[];

    private _milestoneFilters = new MilestoneFilters();

    private _milestones: Milestone[] = [];

    private _navigateToElementEndChange: Subject<CalendarNavigateToElement> = new Subject<CalendarNavigateToElement>();

    private _selectedWorkareaIds: string[];

    private _taskFilters = new ProjectTaskFilters();

    private _tasks: Task[] = [];

    private _workAreas: WorkareaResource[];

    private _willOpenAnotherDrawer = false;

    constructor(private _backdropClickHelper: BackdropClickHelper,
                private _calendarQueries: CalendarQueries,
                private _calendarSelectionHelper: CalendarSelectionHelper,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _calendarScopeHelper: CalendarScopeHelper,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _dateParser: DateParserStrategy,
                private _dayCardDragHelper: DayCardDragHelper,
                private _drawerService: DrawerService,
                private _dayCardQueries: DayCardQueries,
                private _flyoutService: FlyoutService,
                private _keyboardHelper: KeyboardHelper,
                private _milestoneAnchor: MilestoneAnchor,
                private _milestoneQueries: MilestoneQueries,
                private _modalService: ModalService,
                private _monitoringHelper: MonitoringHelper,
                private _projectQueries: ProjectSliceService,
                private _taskFiltersHelper: TaskFiltersHelper,
                private _projectTaskQueries: ProjectTaskQueries,
                private _relationQueries: RelationQueries,
                private _resizeHelper: ResizeHelper,
                private _store: Store<State>,
                private _tasksCalendarUrlQueryParamsHelper: TasksCalendarUrlQueryParamsHelper, // Do not remove this dependency
                private _taskCardWeekAnchor: TaskCardWeekAnchor,
                private _taskCardWeekPlaceholderAnchor: TaskCardWeekPlaceholderAnchor,
                private _translateService: TranslateService,
                private _workareaQueries: WorkareaQueries,
                private _workDaysQueries: WorkDaysQueries) {
    }

    ngOnInit() {
        this._drawerService.setViewContainerRef(this.drawerViewContainerRef);
        this._requestUserSettings();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
        this._unsetFocusedMilestoneSubscriptions();
        this._unsetFocusedTaskSubscriptions();
        this._resetCalendarSelection();
        this._closeDrawer();
    }

    public getWorkareaHeader(row: CalendarRow): CalendarWorkareaRowHeaderModel {
        const {name, position, id} = row;

        return {
            id,
            name,
            position,
        };
    }

    public get isExpanded(): boolean {
        return this.expandedWeeks && this.expandedWeeks.length > 0;
    }

    public handleExpandedWeeks(expandedWeeks: moment.Moment[]): void {
        this._store.dispatch(new CalendarScopeActions.Set.ExpandedWeeks(expandedWeeks));
    }

    public handleModeChange(mode: TasksCalendarModeEnum): void {
        this._store.dispatch(new CalendarScopeActions.Set.Mode(mode));
    }

    public handleScopeStartChange(start: moment.Moment): void {
        this._storeCalendarScopeParameters({...this._calendarScopeParameters, start});
    }

    public handleTodayButtonClicked(): void {
        const scrollLeftPoint: Point = {x: 0, y: undefined};

        this.calendar.scrollTo(scrollLeftPoint);
    }

    public openModal(createRecordPayload: CreateRecordPayload): void {
        this.defaultValues = true;
        this._modalService.open(this._parseModalData(createRecordPayload));
        this._monitoringHelper.addUserAction('Tasks Calendar - click on create task', {createTask: 'by calendar'});
    }

    public get moveTaskPermissionFunction(): (recordId: string) => boolean {
        return (recordId: string) => {
            const task = this._findTaskById(recordId);
            return task && task.permissions.canUpdate && !this.isExpanded && !!this.calendarScope.end.diff(this.calendarScope.start, 'w');
        };
    }

    public get canMoveMilestoneFunction(): (milestoneId: string) => boolean {
        return (milestoneId: string) => {
            const milestone = this._findMilestoneById(milestoneId);
            return milestone && milestone.permissions.canUpdate;
        };
    }

    public get canDragTaskFunction(): (recordId: string) => boolean {
        return (recordId: string) => {
            const hasSelectedTasks = !!this.selectedTaskIds.length;
            const isSelected = this.selectedTaskIds.includes(recordId);
            const currentCherryPicking = this._isSelectingViaCherryPicking();
            const isNotSelectionOrIsCherryPicking = !this.calendarSelectionEnabled || currentCherryPicking;
            const allSelectedTasksInSameWorkarea = this._selectedWorkareaIds.length <= 1;

            return isNotSelectionOrIsCherryPicking
                && (!hasSelectedTasks || isSelected)
                && allSelectedTasksInSameWorkarea;
        };
    }

    public get canHideTaskFunction(): (recordId: string) => boolean {
        return (recordId: string) => this._dayCardDragHelper.getRecordBeingDragged()?.task?.id !== recordId;
    }

    public canSelectTask(taskId: string): boolean {
        if (!this.calendarSelectionEnabled) {
            return !!this._findTaskById(taskId);
        }

        switch (this._calendarSelectionContext) {
            case CalendarSelectionContextEnum.TasksOfMilestones:
                return this._canSelectTaskForTasksOfMilestone(taskId);
            case CalendarSelectionContextEnum.Dependencies:
                return this._canSelectTaskForDependencies(taskId);
            case CalendarSelectionContextEnum.Reschedule:
                return false;
            default:
                return this._canSelectTaskForCherryPicking(taskId);
        }
    }

    public canSelectMilestone(milestoneId: string): boolean {
        return this._isCalendarSelectionModeActive(CalendarSelectionContextEnum.Dependencies)
            ? this._canSelectMilestoneForDependencies(milestoneId)
            : !this._isCalendarSelectionModeActive(CalendarSelectionContextEnum.Reschedule);
    }

    public isMilestoneDimmedOut(milestoneId: string): boolean {
        return (this.highlightMilestones && !this._highlightedMilestoneIds.includes(milestoneId))
            || this._isCalendarSelectionModeActive(CalendarSelectionContextEnum.Reschedule);
    }

    public isTaskDimmedOut(taskId: string): boolean {
        return this._focusedMilestoneSubtasksIds.length
            ? !this._focusedMilestoneSubtasksIds.includes(taskId)
            : this.highlightTasks && !this._highlightedTaskIds.includes(taskId);
    }

    public get isTaskSelectedFunction(): (recordId: string) => boolean {
        return (recordId: string) => this.selectedTaskIds.some(id => id === recordId);
    }

    public get isTaskFocusedFunction(): (recordId: string) => boolean {
        return (recordId: string) => this.focusedTaskId === recordId;
    }

    public get isTaskDimmedOutFunction(): (recordId: string) => boolean {
        return (recordId: string) => this.isTaskDimmedOut(recordId);
    }

    public handleEnableAddMilestone(): void {
        this.enableMilestoneCreation = true;
        this._cancelMilestoneCreationSubscription = new Subscription();
        this._cancelMilestoneCreationSubscription.add(fromEvent(window, 'keyup')
            .pipe(filter((event: KeyboardEvent) => event.key === KeyEnum.Escape))
            .subscribe(() => this.handleDisableAddMilestone()));

        this._cancelMilestoneCreationSubscription.add(
            this._backdropClickHelper.observe([BackdropClickEventTypeEnum.MouseUp, BackdropClickEventTypeEnum.TouchEnd], (event: Event) => {
                const blacklistFunctions: ((clickedNode: Node) => boolean)[] = [
                    this._isElementOutsideMilestoneCreationSlots,
                    this._isElementOutsideFlyout,
                ];

                return blacklistFunctions.every(callback => callback(event.target as Node));
            }).subscribe(() => this.handleDisableAddMilestone()));
    }

    public handleAddTask(): void {
        this.defaultValues = false;
        this._modalService.open({
            id: ModalIdEnum.CreateTask,
            data: {},
        });
        this._monitoringHelper.addUserAction('Tasks Calendar - click on create task', {createTask: 'by actions'});
    }

    public handleDisableAddMilestone(): void {
        this.enableMilestoneCreation = false;
        this._cancelMilestoneCreationSubscription.unsubscribe();
    }

    public handleAddMilestone(saveMilestone: SaveMilestoneResource): void {
        this._store.dispatch(new MilestoneActions.Create.One(saveMilestone));
    }

    public handleMoveMilestone({id, date, rowId, position}: MoveMilestonePayload): void {
        const milestone = this._findMilestoneById(id);
        const saveMilestoneResource = SaveMilestoneResource.fromMilestone(milestone)
            .withDate(date)
            .withLocation(rowId)
            .withPosition(position);

        this._store.dispatch(new MilestoneActions.Update.One(id, saveMilestoneResource, milestone.version));
    }

    public handleMoveRecords(moveRecordPayload: MoveRecordPayload[]): void {
        const moveTaskPayload: MoveTaskPayload[] = moveRecordPayload.map(record => this._parseMoveRecordPayloadForMove(record));

        if (moveTaskPayload.length === 1) {
            this._store.dispatch(new ProjectTaskActions.Move.One(moveTaskPayload[0]));
        } else {
            this._store.dispatch(new ProjectTaskActions.Move.All(moveTaskPayload));
        }
    }

    public handleCopyRecords(copyRecordPayload: MoveRecordPayload[]): void {
        const saveCopyTaskResources: SaveCopyTaskResource[] = copyRecordPayload.map(record =>
            this._parseMoveRecordPayloadForCopy(record));

        this._store.dispatch(new ProjectTaskActions.Copy.All(saveCopyTaskResources));
    }

    public closeModal(): void {
        this._modalService.close();
    }

    public handleWeekWidthChange(width: number): void {
        this.weekWidth = width;
    }

    public handleNavigateToElementEnd(navigateToElement: CalendarNavigateToElement): void {
        this._navigateToElementEndChange.next(navigateToElement);
    }

    public handleSelectMilestone(milestoneId: string): void {
        const isSelectingDependencies = this._isCalendarSelectionModeActive(CalendarSelectionContextEnum.Dependencies);

        if (isSelectingDependencies && this.canSelectMilestone(milestoneId)) {
            const milestoneObjectIdentifier = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);

            this._store.dispatch(new CalendarSelectionActions.Toggle.SelectionItem(milestoneObjectIdentifier));
        }

        this._handleMilestoneDrawerByMilestoneSelection(milestoneId);
    }

    public handleIsResizingTaskCard(isResizing: boolean): void {
        this.isResizingTaskCard = isResizing;
    }

    public handleSelectTask(taskId: string): void {
        if (this.calendarSelectionEnabled && this.canSelectTask(taskId)) {
            const selectFocusedTask = this._isSelectingViaCherryPicking() && !!this.focusedTaskId && this.focusedTaskId !== taskId;
            if (selectFocusedTask) {
                this._calendarSelectionHelper.toggleSelectionItem(this.focusedTaskId, ObjectTypeEnum.Task);
            }
            this._calendarSelectionHelper.toggleSelectionItem(taskId, ObjectTypeEnum.Task);
        }

        this._handleTaskDrawerByTaskSelection(taskId);
    }

    public handleToggleFilterDrawer(): void {
        this.isFilterDrawerOpen = !this.isFilterDrawerOpen;

        if (this.isFilterDrawerOpen) {
            this._openTaskFilterDrawer();
        } else {
            this._closeDrawer();
        }
    }

    public handleToggleQuickFilterDrawer(): void {
        this.isQuickFilterDrawerOpen = !this.isQuickFilterDrawerOpen;

        if (this.isQuickFilterDrawerOpen) {
            this._openTaskQuickFilterDrawer();
        } else {
            this._closeDrawer();
        }
    }

    public handleRescheduleFilterDrawer(): void {
        this.isRescheduleDrawerOpen = !this.isRescheduleDrawerOpen;

        if (this.isRescheduleDrawerOpen) {
            this._openRescheduleDrawer();
        } else {
            this._closeDrawer();
        }
    }

    public handleMultiSelectToolbarClose(): void {
        this._resetCalendarSelection();
    }

    public handleResetFilters(): void {
        this._store.dispatch(new ProjectTaskActions.Set.CalendarFilters(new ProjectTaskFilters()));
        this._store.dispatch(new MilestoneActions.Set.Filters(new MilestoneFilters()));
    }

    public handleRecordDragStart(): void {
        if (!this._calendarSelectionAction) {
            this._store.dispatch(new CalendarSelectionActions.Set.SelectionAction(CalendarSelectionActionEnum.Move));
        }
    }

    private _getShiftedDate(date: string, amount: number): moment.Moment {
        return moment(date).add(amount, 'd');
    }

    private _setCalendarUserSettings(settings: CalendarUserSettings): void {
        this.calendarUserSettings = settings;

        this._setStyles();
        this.calendar.elementsDimensionsChanged();
    }

    private _closeDrawer(): void {
        this._drawerService.close();
    }

    private _openMilestoneDrawer(milestoneId: string): void {
        this._resetCalendarSelection();
        this._setWillOpenAnotherDrawer();
        this._drawerService
            .open(MilestoneDetailDrawerComponent, milestoneId)
            .afterClosed()
            .subscribe(() => {
                this._setDrawerFocusedMilestoneId(null);
                this._handleMilestoneSubtasks([]);
                this._handleFocusedElementDependencies([]);
                this._unsetFocusedMilestoneSubscriptions();
                this._calendarSelectionResetEvents$.next();

                if (!this._willOpenAnotherDrawer) {
                    this._unsetStoreFocusParam();
                    this._resizeHelper.triggerResize();
                }

                this._willOpenAnotherDrawer = false;
            });
        this._setDrawerFocusedMilestoneId(milestoneId);
        this._setFocusedMilestoneSubscriptions(milestoneId);
    }

    private _openTaskDrawer(taskId: string): void {
        this._resetCalendarSelection();
        this._setWillOpenAnotherDrawer();
        this._drawerService
            .open(TasksDetailDrawerComponent, taskId)
            .afterClosed()
            .subscribe(() => {
                this._setDrawerFocusedTaskId(null);
                this._handleFocusedElementDependencies([]);
                this._unsetFocusedTaskSubscriptions();
                this._calendarSelectionResetEvents$.next();

                if (!this._willOpenAnotherDrawer) {
                    this._unsetStoreFocusParam();
                    this._resizeHelper.triggerResize();
                }

                this._willOpenAnotherDrawer = false;
            });
        this._setDrawerFocusedTaskId(taskId);
        this._setFocusedTaskSubscriptions(taskId);
    }

    private _openTaskFilterDrawer(): void {
        this._setWillOpenAnotherDrawer();
        this._unsetStoreFocusParam();
        this._drawerService
            .open<ProjectFilterDrawerComponent, ProjectFilterDrawerContext>(
                ProjectFilterDrawerComponent,
                ProjectFiltersCaptureContextEnum.Calendar)
            .afterClosed()
            .subscribe(() => {
                if (!this._willOpenAnotherDrawer) {
                    this._resizeHelper.triggerResize();
                }

                this.isFilterDrawerOpen = false;
                this._willOpenAnotherDrawer = false;
            });
    }

    private _openTaskQuickFilterDrawer(): void {
        this._setWillOpenAnotherDrawer();
        this._unsetStoreFocusParam();
        this._drawerService
            .open<QuickFilterDrawerComponent, QuickFilterContext>(QuickFilterDrawerComponent, 'calendar')
            .afterClosed()
            .subscribe(() => {
                if (!this._willOpenAnotherDrawer) {
                    this._resizeHelper.triggerResize();
                }

                this.isQuickFilterDrawerOpen = false;
                this._willOpenAnotherDrawer = false;
            });
    }

    private _openRescheduleDrawer(): void {
        this._setWillOpenAnotherDrawer();
        this._unsetStoreFocusParam();
        this.handleResetFilters();
        this._resetCalendarSelection();
        this._drawerService
            .open<ProjectRescheduleDrawerComponent, void>(ProjectRescheduleDrawerComponent)
            .afterClosed()
            .subscribe(() => {
                if (!this._willOpenAnotherDrawer) {
                    this._resizeHelper.triggerResize();
                }

                this.isRescheduleDrawerOpen = false;
                this._willOpenAnotherDrawer = false;
            });
    }

    private _setWillOpenAnotherDrawer(): void {
        this._willOpenAnotherDrawer = !!this.focusedTaskId
            || !!this.focusedMilestoneId
            || this.isFilterDrawerOpen
            || this.isQuickFilterDrawerOpen
            || this.isRescheduleDrawerOpen;
    }

    private _setDrawerFocusedMilestoneId(milestoneId: string): void {
        this.focusedMilestoneId = milestoneId;
    }

    private _setDrawerFocusedTaskId(taskId: string): void {
        this.focusedTaskId = taskId;
    }

    private _setFocusedMilestoneSubscriptions(milestoneId: string): void {
        this._focusedMilestoneSubscriptions.add(
            this._relationQueries.observePartOfRelationsByMilestoneId(milestoneId)
                .subscribe(relations => this._handleMilestoneSubtasks(relations)));

        this._focusedMilestoneSubscriptions.add(
            combineLatest([
                this._relationQueries.observeFinishToStartPredecessorRelationsByMilestoneId(milestoneId),
                this._relationQueries.observeFinishToStartSuccessorRelationsByMilestoneId(milestoneId),
            ])
                .pipe(map(([predecessorRelations, successorRelations]) => [...predecessorRelations, ...successorRelations]))
                .subscribe(relations => this._handleFocusedElementDependencies(relations)));
    }

    private _setFocusedTaskSubscriptions(taskId: string): void {
        this._focusedTaskSubscriptions.add(
            combineLatest([
                this._relationQueries.observeFinishToStartPredecessorRelationsByTaskId(taskId),
                this._relationQueries.observeFinishToStartSuccessorRelationsByTaskId(taskId),
            ])
                .pipe(map(([predecessorRelations, successorRelations]) => [...predecessorRelations, ...successorRelations]))
                .subscribe(relations => this._handleFocusedElementDependencies(relations)));
    }

    private _setSelectedWorkareaIds(workareaIds: string[]): void {
        this._selectedWorkareaIds = uniq(workareaIds);
    }

    private _setSubscriptions(): void {
        const tasksObservable: Observable<Task[]> = combineLatest([
            this._projectTaskQueries.observeCalendarTasks(),
            this._calendarSelectionQueries.observeTaskCalendarSelectionItems(),
        ]).pipe(
            map(([tasks, selectedTasks]) => unionBy(tasks, selectedTasks, 'id')),
            distinctUntilChanged(Task.isEqualArray)
        );

        this._disposableSubscriptions.add(
            combineLatest([
                tasksObservable,
                this._workareaQueries.observeWorkareas(),
                this._calendarScopeQueries.observeCalendarScopeParameters(),
            ]).subscribe(([tasks, workAreas, scopeParameters]) => {
                this._setCalendarScopeParameters(scopeParameters);
                this._setWorkAreas(workAreas);
                this._setTasks(tasks);
                this._setStyles();
                this._handleHighlightedRecords(this._tasks, this._taskFilters);
            })
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeTaskCalendarSelectionItems()
                .subscribe(selectedTasks => {
                    const selectedWorkareaIds = selectedTasks
                        .map(task => task.workArea?.id || null);
                    this._setSelectedWorkareaIds(selectedWorkareaIds);
                })
        );

        this._disposableSubscriptions.add(
            this._milestoneQueries.observeMilestoneListByMilestoneFilters()
                .subscribe(milestones => {
                    this._handleMilestoneList(milestones);
                    this._handleHighlightedMilestones(this._milestones, this._milestoneFilters);
                })
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._projectTaskQueries.hasCalendarFiltersApplied(),
                this._milestoneQueries.observeHasFiltersApplied(),
            ]).subscribe(([hasTaskFilters, hasMilestoneFilters]) =>
                this._setHasFiltersApplied(hasTaskFilters, hasMilestoneFilters))
        );

        this._disposableSubscriptions.add(
            this._calendarQueries.observeCalendarUserSettings()
                .pipe(
                    distinctUntilChanged()
                )
                .subscribe(settings => {
                    this._setCalendarUserSettings(settings);
                    this._setDrawingStrategy(settings.sortingMode);
                    this._setTaskViewMode(settings.taskViewMode);
                    this._setShowUnreadNews(settings.showUnreadNews);
                })
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._projectTaskQueries.observeCalendarRequestStatus(),
                this._milestoneQueries.observeMilestoneListRequestStatus(),
                this._projectTaskQueries.observeCurrentTaskRequestStatus(),
                this._calendarScopeQueries.observeFocusResolveStatus(),
            ]).subscribe(statuses => this._handleRequestStatus(statuses)));

        this._disposableSubscriptions.add(
            this._projectQueries.observeCurrentProjectId()
                .subscribe(projectId => this._handleProjectChange(projectId))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task)
                .subscribe(this._handleTaskCalendarSelectionItemsChange.bind(this)));

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Milestone)
                .subscribe(this._handleMilestoneCalendarSelectionItemsChange.bind(this)));

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionAction()
                .subscribe((calendarSelectionAction) => {
                    this._handleCalendarSelectionActionChange(calendarSelectionAction);
                }));

        this._disposableSubscriptions.add(
            this._flyoutService.openEvents.pipe(
                map(this._getDayCardIdFromFlyoutId.bind(this)),
                filter(dayCardId => !!dayCardId),
                delay(0),
            ).subscribe((dayCardId: string) => {
                this.hideScroll = true;
                this.focusedDaycardId = dayCardId;
                this.focusedTaskId = null;

                this._closeDrawer();
                this._setStoreFocusParam(new ObjectIdentifierPair(ObjectTypeEnum.DayCard, dayCardId));
            })
        );

        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents.pipe(
                filter(flyoutId => flyoutId === this.focusedDaycardId),
                delay(0),
            ).subscribe(() => {
                this.hideScroll = false;
                this.focusedDaycardId = null;

                this._unsetStoreFocusParam();
            })
        );

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeExpandedWeeks()
                .subscribe(expandedWeeks => this._setCalendarExpandWeeks(expandedWeeks)));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeCalendarScopeParameters()
                .pipe(
                    map(scopeParams => scopeParams.mode))
                .subscribe(mode => this._setCalendarMode(mode)));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeNavigateToElement()
                .pipe(
                    delay(TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY),
                )
                .subscribe(({id, type}) => {
                    switch (type) {
                        case ObjectTypeEnum.Task: {
                            this.calendarNavigateToElement = {cardId: id};
                            break;
                        }
                        case ObjectTypeEnum.Milestone: {
                            this.calendarNavigateToElement = {milestoneId: id};
                            break;
                        }
                        case ObjectTypeEnum.DayCard: {
                            const day = this._dayCardQueries.getDayCardById(id).date;
                            const taskId = this._dayCardQueries.getDayCardById(id).task.id;
                            const week = this._dateParser.startOfWeek(moment(day));

                            this.calendarNavigateToElement = {week, cardId: taskId};
                            break;
                        }
                    }
                }));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeFocus()
                .pipe(
                    filter(object => !!object))
                .subscribe(({id, type}) => {
                    switch (type) {
                        case ObjectTypeEnum.Task: {
                            this._openTaskDrawer(id);
                            break;
                        }
                        case ObjectTypeEnum.Milestone: {
                            this._openMilestoneDrawer(id);
                            break;
                        }
                    }
                }));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeFocus()
                .pipe(
                    filter(object => !object))
                .subscribe(() => this._closeDrawer()));

        this._disposableSubscriptions.add(
            this._navigateToElementEndChange
                .pipe(
                    withLatestFrom(this._calendarScopeQueries.observeFocus()),
                    filter(([, item]) => item?.type === ObjectTypeEnum.DayCard),
                    delay(TASKS_CALENDAR_WAIT_FOR_CALENDAR_NAVIGATE_FINISH_DELAY))
                .subscribe(([, {id}]) => this.focusedDaycardId = id));

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCalendarFilters()
                .subscribe(filters => {
                    this._taskFilters = filters;
                    this._setRows();
                    this._handleHighlightedRecords(this._tasks, this._taskFilters);
                    this._setStyles();
                })
        );
        this._disposableSubscriptions.add(
            this._milestoneQueries.observeFilters()
                .subscribe(filters => {
                    this._milestoneFilters = filters;
                    this._handleHighlightedMilestones(this._milestones, filters);
                })
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionSlice()
                .subscribe(({items, isMultiSelecting, context}) => {
                    this._handleCalendarSelectionChange(items, context, isMultiSelecting);
                }));

        this._disposableSubscriptions.add(
            this._calendarSelectionResetEvents$
                .pipe(filter(() => this.calendarSelectionEnabled && !this._isSelectingViaCherryPicking()))
                .subscribe(() => this._resetCalendarSelection())
        );

        this._disposableSubscriptions.add(
            fromEvent(window, 'keyup')
                .pipe(filter((event: KeyboardEvent) => event.key === KeyEnum.Escape),
                    filter(() => this.calendarSelectionEnabled
                        && !this._isCalendarSelectionModeActive(CalendarSelectionContextEnum.Reschedule)))
                .subscribe(() => this._resetCalendarSelection()));

        this._disposableSubscriptions.add(
            this._calendarQueries.observeCalendarUserSettings()
                .pipe(
                    map(settings => settings.showDependencyLines),
                    distinctUntilChanged(),
                    switchMap(showDependencyLines => showDependencyLines
                        ? this._relationQueries.observeFinishToStartRelations()
                        : this._relationQueries.observeCriticalRelations())
                )
                .subscribe(relations => {
                    this._generalDependencies = relations;
                    this._handleDependencies();
                }));

        this._disposableSubscriptions.add(
            this._workDaysQueries.observeWorkingDays()
                .subscribe(workingDays => this.workingDays = workingDays));

        this._disposableSubscriptions.add(
            this._workDaysQueries.observeHolidays()
                .subscribe(holidays => this.holidays = holidays));

        this._disposableSubscriptions.add(
            this._keyboardHelper.getShortcutPressedState(KeyboardShortcutEnum.Copy)
                .subscribe((status) => {
                    const selectionAction: CalendarSelectionActionEnum = status ? CalendarSelectionActionEnum.Copy : null;

                    this._store.dispatch(new CalendarSelectionActions.Set.SelectionAction(selectionAction));
                })
        );
    }

    private _setCalendarExpandWeeks(weeks: moment.Moment[]): void {
        this.expandedWeeks = weeks;
        this._setStyles();
        this.calendar.elementsDimensionsChanged();
    }

    private _setCalendarMode(mode: TasksCalendarModeEnum): void {
        this.selectedMode = mode;
    }

    private _setDrawingStrategy(sortingMode: TaskCalendarSortingModeEnum): void {
        this.drawingStrategy = DRAWING_MODE_MAP[sortingMode];
    }

    private _setTaskViewMode(viewMode: TaskCalendarTaskViewModeEnum): void {
        this.taskViewMode = viewMode;
        this.recordGridUnit = TASK_VIEW_MODE_MAP[viewMode];
        this.shiftUnit = TASK_VIEW_MODE_SHIFT_UNIT_MAP[viewMode];
    }

    private _requestUserSettings(): void {
        this._store.dispatch(new CalendarActions.Request.UserSettings());
    }

    private _getDayCardIdFromFlyoutId(flyoutId: string): string {
        return this._dayCardQueries.dayCardExists(flyoutId) ? flyoutId : null;
    }

    private _handleProjectChange(projectId: string) {
        this.projectId = projectId;
        this._requestWorkAreas();
    }

    private _handleTaskCalendarSelectionItemsChange(taskIds: string[]): void {
        this.selectedTaskIds = taskIds;
    }

    private _handleMilestoneCalendarSelectionItemsChange(milestoneIds: string[]): void {
        this.selectedMilestoneIds = milestoneIds;
    }

    private _isElementOutsideFlyout(clickedNode: Node): boolean {
        const selector = 'flyout';
        const element = document.getElementById(selector);

        return !element || !element.contains(clickedNode);
    }

    private _isElementOutsideMilestoneCreationSlots(clickedNode: Node): boolean {
        const selector = 'ss-milestone-creation-slots';
        const elements = document.getElementsByTagName(selector);

        return !Array.from(elements).some(element => element.contains(clickedNode));
    }

    private _setShowUnreadNews(showUnreadNews: boolean): void {
        this.showUnreadNews = showUnreadNews;
    }

    private _unsetFocusedMilestoneSubscriptions(): void {
        this._focusedMilestoneSubscriptions.unsubscribe();
        this._focusedMilestoneSubscriptions = new Subscription();
    }

    private _unsetFocusedTaskSubscriptions(): void {
        this._focusedTaskSubscriptions.unsubscribe();
        this._focusedTaskSubscriptions = new Subscription();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setStoreFocusParam(object: ObjectIdentifierPair): void {
        this._store.dispatch(new CalendarScopeActions.Set.Focus(object));
    }

    private _unsetStoreFocusParam(): void {
        this._store.dispatch(new CalendarScopeActions.Set.Focus(null));
    }

    private _setCalendarScope(scope: CalendarScopeParameters): void {
        this.calendarScope = this._calendarScopeHelper.getCalendarScope(scope);
    }

    private _handleMilestoneList(milestones: Milestone[]): void {
        this._milestones = milestones;
        this.calendarMilestones = milestones.reduce((calendarMilestones: CalendarMilestones<Milestone>, milestone: Milestone) => {
            const rowId = this._getMilestoneRowId(milestone);
            const rowMilestones = calendarMilestones[rowId] || [];

            return {
                ...calendarMilestones,
                [rowId]: [...rowMilestones, milestone],
            };
        }, {} as CalendarMilestones<Milestone>);
    }

    private _handleMilestoneSubtasks(relations: RelationResource[]): void {
        this._focusedMilestoneSubtasksIds = relations.map(relation => relation.source.id);
    }

    private _handleDependencies(): void {
        this.calendarDependencies = uniqBy([...this._generalDependencies, ...this._focusedElementDependencies],
            (relation) => relation.id);
    }

    private _handleFocusedElementDependencies(relations: RelationResource[]): void {
        const focusedElementId = this.focusedTaskId ? this.focusedTaskId : this.focusedMilestoneId;
        const focusedElementDependenciesIdsByType = uniqBy([
            ...relations.map(relation => relation.source),
            ...relations.map(relation => relation.target),
        ], item => item.id)
            .filter(item => focusedElementId && item.id !== focusedElementId)
            .reduce((acc, {id, type}) => {
                acc[type] = acc[type] ? [...acc[type], id] : [id];

                return acc;
            }, {});

        this._focusedElementDependencies = relations;
        this._focusedElementDependenciesIdsByType = focusedElementDependenciesIdsByType;

        this._handleDependencies();
    }

    private _handleRequestStatus([calendarTasksStatus, milestoneRequestStatus, singleTaskStatus, focusResolveStatus]): void {
        this.isLoading =
            calendarTasksStatus === RequestStatusEnum.progress ||
            milestoneRequestStatus === RequestStatusEnum.progress ||
            focusResolveStatus === RequestStatusEnum.progress ||
            (singleTaskStatus === RequestStatusEnum.progress && !this.isExpanded);
    }

    private _storeCalendarScopeParameters(scopeParameters: CalendarScopeParameters): void {
        this._store.dispatch(new CalendarScopeActions.Set.ScopeParameters(scopeParameters));
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _resetCalendarSelection(): void {
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
    }

    private _setTasks(tasks: Task[] = []): void {
        this._tasks = tasks;

        this._setRows();
    }

    private _setWorkAreas(workAreas: WorkareaResource[]): void {
        this._workAreas = workAreas;
    }

    private _setCalendarScopeParameters(scopeParameters: CalendarScopeParameters): void {
        this._calendarScopeParameters = Object.assign({}, scopeParameters);

        this._setCalendarScope(this._calendarScopeParameters);
    }

    private _setRows(): void {
        let rows: CalendarRow[] = [];

        if (this._workAreas && this._tasks) {
            const {highlight, criteria: {workAreaIds}} = this._taskFilters;
            const workAreas = workAreaIds.length > 0 && !highlight
                ? this._workAreas.filter(workArea => workAreaIds.some(workAreaId => workAreaId === workArea.id))
                : this._workAreas;
            rows = workAreas.map((workArea: WorkareaResource) => {
                const {id, name, position} = workArea;
                return this._getProjectTasksCalendarRow(name, id, position, workArea.id);
            });

            if (!workAreaIds.length || highlight || workAreaIds.some(workAreaId => workAreaId === WORKAREA_UUID_EMPTY)) {
                rows.push(this._getProjectTasksCalendarRow(this._translateService.instant('Generic_WithoutArea')));
            }
        }
        this.rows = rows;
    }

    private _setStyles(): void {
        this.taskStyles = this._tasks.reduce((result, task) => {
            result[task.id] = {
                'height.px': this._getTaskHeight(),
                'margin-bottom.px': this._getTaskMarginBottom(task),
                'background-color': this.highlightTasks ? COLORS.light_grey_50 : task.projectCraft.color,
                opacity: 0.8,
            };

            return result;
        }, {});
    }

    private _getTaskHeight(): number {
        const {baseHeight, descriptionHeight} = TASK_CARD_WEEK_DIMENSIONS;
        return baseHeight + (this._hasExpandedWeeks() ? 0 : descriptionHeight);
    }

    private _getTaskMarginBottom(task: Task): number {
        const {daycardsHeight, indicatorsHeight, durationHeight, durationSpacer} = TASK_CARD_WEEK_DIMENSIONS;
        const {start, end} = task.schedule;
        const isTaskExpanded = this._hasExpandedWeeks() && this.expandedWeeks.some(week => week.isBetween(start, end, 'week', '[]'));
        const dayCardIndicatorsHeight = this.calendarUserSettings.showDayCardIndicators ? indicatorsHeight : 0;

        return (isTaskExpanded ? daycardsHeight : dayCardIndicatorsHeight) + durationSpacer + durationHeight;
    }

    private _hasExpandedWeeks(): boolean {
        return this.expandedWeeks && this.expandedWeeks.length > 0;
    }

    private _getMilestoneRowId(milestone: Milestone): RowId {
        const {header, workArea} = milestone;
        let rowId: RowId = 'no-row';

        if (header) {
            rowId = 'header';
        } else if (workArea) {
            rowId = workArea.id;
        }

        return rowId;
    }

    private _getRecordsByWorkArea(workAreaId: string): any[] {
        return this._tasks
            .filter((task: Task) => this._getWorkAreaId(task) === workAreaId)
            .map((task: Task) => {
                const {start, end} = task.schedule;

                return {
                    id: task.id,
                    start: moment(start),
                    end: moment(end),
                    groupId: task.projectCraft.id,
                    position: null,
                };
            });
    }

    private _getWorkAreaId(task: Task): string {
        return task.workArea ? task.workArea.id : null;
    }

    private _getProjectTasksCalendarRow(name: string, id: string = null, position: number = null, workAreaId: string = null): CalendarRow {
        return {
            id,
            name,
            position,
            records: this._getRecordsByWorkArea(workAreaId),
        };
    }

    private _parseMoveRecordPayloadForCopy(moveRecordPayload: MoveRecordPayload): SaveCopyTaskResource {
        const {id, rowId, shiftDays} = moveRecordPayload;

        return {
            id: id,
            shiftDays: shiftDays,
            includeDayCards: true,
            parametersOverride: {
                workAreaId: rowId ?? WORKAREA_UUID_EMPTY,
            },
        };
    }

    private _parseMoveRecordPayloadForMove(moveRecordPayload: MoveRecordPayload): MoveTaskPayload {
        const {id, rowId, shiftDays} = moveRecordPayload;
        const {schedule: {start, end}} = this._findTaskById(id);

        return {
            taskId: id,
            workAreaId: rowId,
            start: this._getShiftedDate(start, shiftDays),
            end: this._getShiftedDate(end, shiftDays),
        };
    }

    private _parseModalData(modalData: CreateRecordPayload): ModalInterface {
        return {
            id: ModalIdEnum.CreateTask,
            data: {
                start: modalData.start,
                end: modalData.end,
                workarea: modalData.rowId,
            },
        };
    }

    private _findMilestoneById(id: string): Milestone | undefined {
        return this._milestones.find(milestone => milestone.id === id);
    }

    private _findTaskById(id: string): Task | undefined {
        return this._tasks.find((task: Task) => task.id === id);
    }

    private _setHasFiltersApplied(hasTaskFilters: boolean, hasMilestoneFilters: boolean): void {
        this.hasFiltersApplied = hasTaskFilters || hasMilestoneFilters;
    }

    private _handleHighlightedMilestones(milestones: Milestone[], filters: MilestoneFilters): void {
        this.highlightMilestones = filters.highlight;
        this._highlightedMilestoneIds = filters.highlight && filters.useCriteria
            ? milestones.filter(milestone => filters.matchMilestone(milestone)).map(milestone => milestone.id)
            : [];
    }

    private _handleHighlightedRecords(tasks: Task[] = [], filters: ProjectTaskFilters = new ProjectTaskFilters()): void {
        this.highlightTasks = filters.highlight;
        this._highlightedTaskIds = filters.highlight && filters.useCriteria
            ? tasks.filter(task => this._taskFiltersHelper.matchTask(task, filters.criteria)).map(task => task.id)
            : [];
    }

    private _handleCalendarSelectionActionChange(action: CalendarSelectionActionEnum): void {
        this._calendarSelectionAction = action;
        this.isCopying = action === CalendarSelectionActionEnum.Copy;
        this.shiftMode = this.isCopying ? 'copy' : 'move';
    }

    private _handleCalendarSelectionChange(items: ObjectIdentifierPair[], context: CalendarSelectionContextEnum,
                                           isMultiSelecting: boolean): void {
        this._calendarSelectionContext = context;
        this.calendarSelectionEnabled = isMultiSelecting;
        this.selectedTaskIds = [...this.selectedTaskIds];
        this._hasSelectedItems = !!items.length;
        this._updateCanShowMultiSelectCommandBar();
    }

    private _isCalendarSelectionModeActive(mode: CalendarSelectionContextEnum): boolean {
        return this._calendarSelectionContext === mode;
    }

    private _isSelectingViaCherryPicking(): boolean {
        return this.calendarSelectionEnabled && this._calendarSelectionContext == null;
    }

    private _handleTaskDrawerByTaskSelection(taskId: string): void {
        const isCherryPicking = this._isSelectingViaCherryPicking();
        const isNotSelectingOrIsCherryPicking = !this.calendarSelectionEnabled || isCherryPicking;
        const shouldUnsetFocus = isNotSelectingOrIsCherryPicking && (isCherryPicking || taskId === this.focusedTaskId);

        if (shouldUnsetFocus) {
            this._unsetStoreFocusParam();
        } else if (isNotSelectingOrIsCherryPicking) {
            this._setStoreFocusParam(new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId));
        }
    }

    private _handleMilestoneDrawerByMilestoneSelection(milestoneId: string): void {
        const shouldUnsetFocus = !this.calendarSelectionEnabled && this.focusedMilestoneId === milestoneId;
        const shouldSetFocus = !this.calendarSelectionEnabled;

        if (shouldUnsetFocus) {
            this._unsetStoreFocusParam();
        } else if (shouldSetFocus) {
            this._setStoreFocusParam(new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId));
        }
    }

    private _canSelectTaskForCherryPicking(taskId: string): boolean {
        const task = this._findTaskById(taskId);

        return !!task && this._calendarSelectionHelper.canSelectItemType(ObjectTypeEnum.Task);
    }

    private _canSelectTaskForTasksOfMilestone(taskId: string): boolean {
        const task = this._findTaskById(taskId);
        return !!task && !this._focusedMilestoneSubtasksIds.includes(taskId);
    }

    private _canSelectTaskForDependencies(taskId: string): boolean {
        const task = this._findTaskById(taskId);
        const taskDependenciesIds = this._focusedElementDependenciesIdsByType[ObjectTypeEnum.Task];

        return !!task
            && taskId !== this.focusedTaskId
            && !taskDependenciesIds?.includes(taskId);
    }

    private _canSelectMilestoneForDependencies(milestoneId: string): boolean {
        const milestoneDependenciesIds = this._focusedElementDependenciesIdsByType[ObjectTypeEnum.Milestone];

        return milestoneId !== this.focusedMilestoneId
            && !milestoneDependenciesIds?.includes(milestoneId);
    }

    private _updateCanShowMultiSelectCommandBar(): void {
        const isSelectingOrHasItemsSelected = this.calendarSelectionEnabled || !!this._hasSelectedItems;

        this.canShowMultiSelectCommandBar = this._calendarSelectionContext == null && isSelectingOrHasItemsSelected;
    }
}

export const TASK_ANCHOR_POINT_CONTEXT_SELECTOR = '.ss-calendar-body-cell:not(.ss-calendar-body-cell--dragging)';
export const TASKS_CALENDAR_WAIT_FOR_CALENDAR_NAVIGATE_FINISH_DELAY = 1;
export const TASKS_CALENDAR_WAIT_FOR_CALENDAR_RENDERING_BEFORE_NAVIGATE_DELAY = 1;
export const DRAWING_MODE_MAP: { [key in TaskCalendarSortingModeEnum]: CalendarDrawingStrategy } = {
    [TaskCalendarSortingModeEnum.Default]: 'default',
    [TaskCalendarSortingModeEnum.CraftsSameLine]: 'group-same-line',
    [TaskCalendarSortingModeEnum.CraftsNextLine]: 'group-next-line',
};

export const TASK_VIEW_MODE_MAP: { [key in TaskCalendarTaskViewModeEnum]: CalendarRecordGridUnit } = {
    [TaskCalendarTaskViewModeEnum.Day]: 'day',
    [TaskCalendarTaskViewModeEnum.Week]: 'week',
};

export const TASK_VIEW_MODE_SHIFT_UNIT_MAP: { [key in TaskCalendarTaskViewModeEnum]: TaskShiftAmountUnit } = {
    [TaskCalendarTaskViewModeEnum.Day]: 'day',
    [TaskCalendarTaskViewModeEnum.Week]: 'week',
};
