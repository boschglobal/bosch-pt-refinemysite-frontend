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
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {MonitoringHelper} from '../../../../../shared/monitoring/helpers/monitoring.helper';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {CalendarUserSettings} from '../../../../project-common/api/calendar/resources/calendar-user-settings';
import {CalendarSelectionContextEnum} from '../../../../project-common/enums/calendar-selection-context.enum';
import {
    TaskCalendarSortingModeEnum,
    TaskCalendarSortingModeEnumHelper
} from '../../../../project-common/enums/task-calendar-sorting-mode.enum';
import {
    TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER,
    TaskCalendarTaskViewModeEnum
} from '../../../../project-common/enums/task-calendar-task-view-mode.enum';
import {
    TaskCardDescriptionTypeEnum,
    TaskCardDescriptionTypeEnumHelper
} from '../../../../project-common/enums/task-card-description-type.enum';
import {CalendarActions} from '../../../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {NewsActions} from '../../../../project-common/store/news/news.actions';
import {CurrentProjectPermissions} from '../../../../project-common/store/projects/project.slice';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';

export const CREATE_MILESTONE_ITEM_ID = 'milestone';
export const CREATE_TASK_ITEM_ID = 'task';
export const SHOW_DAYCARD_INDICATORS_ITEM_ID = 'showDayCardIndicators';
export const SHOW_DEPENDENCY_LINES_ITEM_ID = 'showDependencyLines';
export const RESCHEDULE_MENU_ITEM_ID = 'rescheduleMenuItem';
export const SORT_MODE_MENU_ITEM_GROUP_ID = 'sortModeItemGroup';
export const SHOW_UNREAD_NEWS_ITEM_ID = 'showUnreadNews';
export const MARK_ALL_NEWS_AS_READ_ITEM_ID = 'markAllNewsAsRead';
export const TASK_CARD_DESCRIPTION_TYPE_MENU_ITEM_GROUP_ID = 'taskCardDescriptionTypeItemGroup';
export const TASK_VIEW_MODE_MENU_ITEM_ID = 'taskViewModeItemGroup';

@Component({
    selector: 'ss-tasks-calendar-actions',
    templateUrl: './tasks-calendar-actions.component.html',
    styleUrls: ['./tasks-calendar-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksCalendarActionsComponent implements OnInit, OnDestroy {

    @Input()
    public set filterDrawerOpenState(isFilterDrawerOpen: boolean) {
        this.isFilterDrawerOpen = isFilterDrawerOpen;

        this.filterIconBadgeStrokeColor = isFilterDrawerOpen
            ? COLORS.light_grey_25
            : COLORS.white;
    }

    @Input()
    public hasFilters = false;

    @Input()
    public set quickFilterDrawerOpenState(isQuickFilterDrawerOpen: boolean) {
        this.isQuickFilterDrawerOpen = isQuickFilterDrawerOpen;
    }

    @Output()
    public addMilestone: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public addTask: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public toggleFilterDrawer: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public toggleQuickFilterDrawer: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public toggleRescheduleDrawer = new EventEmitter();

    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    public calendarExportModalId = ModalIdEnum.CalendarExport;

    public createDropdownItems: MenuItemsList[] = [];

    public isCherryPicking = false;

    public isFilterDrawerOpen = false;

    public isQuickFilterDrawerOpen = false;

    public filterIconBadgeFillColor = COLORS.light_blue;

    public filterIconBadgeStrokeColor = COLORS.white;

    public settingsDropdownItems: MenuItemsList[] = [];

    private _calendarSelectionContext: CalendarSelectionContextEnum = null;

    private _calendarUserSettings: CalendarUserSettings;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _exportModalData: ModalInterface = {
        id: ModalIdEnum.CalendarExport,
        data: {},
    };

    constructor(private _calendarQueries: CalendarQueries,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _monitoringHelper: MonitoringHelper,
                private _projectQueries: ProjectSliceService,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    /**
     * @description Triggers calendar export modal
     */
    public openCalendarExportModal(): void {
        this._modalService.open(this._exportModalData);
    }

    public handleCreateDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case CREATE_MILESTONE_ITEM_ID:
                this._handleAddMilestone();
                break;
            case CREATE_TASK_ITEM_ID:
                this._handleAddTask();
                break;
        }
    }

    public handleMultiSelectButtonClicked(): void {
        if (this._calendarSelectionContext == null) {
            if (!this.isCherryPicking) {
                this._store.dispatch(new CalendarSelectionActions.Set.Selection(true, null));
            } else {
                this._store.dispatch(new CalendarSelectionActions.Initialize.All());
            }
        }
    }

    public handleSettingsDropdownItemClicked({id, value, groupId}: MenuItem): void {
        if (id === RESCHEDULE_MENU_ITEM_ID) {
            this.toggleRescheduleDrawer.emit();
        } else if (id === MARK_ALL_NEWS_AS_READ_ITEM_ID) {
            this._markAllNewsAsRead();
        } else if (groupId === SORT_MODE_MENU_ITEM_GROUP_ID) {
            this._changeCalendarUserSettings('sortingMode', value);
        } else if (groupId === TASK_CARD_DESCRIPTION_TYPE_MENU_ITEM_GROUP_ID) {
            this._monitoringHelper
                .addUserAction('Calendar actions - click on Task Card Description Type', {taskCardDescriptionType: value});
            this._changeCalendarUserSettings('taskCardDescriptionType', value);
        } else if (groupId === TASK_VIEW_MODE_MENU_ITEM_ID) {
            this._changeCalendarUserSettings('taskViewMode', value);
        } else {
            this._toggleCalendarUserSetting(id);
        }
    }

    /**
     * @description Emits an event to toggle the Filter drawer
     */
    public handleToggleFilterDrawer(): void {
        this.toggleFilterDrawer.emit();
    }

    /**
     * @description Emits an event to toggle the QuickFilter drawer
     */
    public handleToggleQuickFilterDrawer(): void {
        this.toggleQuickFilterDrawer.emit();
    }

    /**
     * @description Closes modal
     */
    public closeModal(): void {
        this._modalService.close();
    }

    private _changeCalendarUserSettings(key: keyof CalendarUserSettings, value: ChangeCalendarSettingsType): void {
        const newSettings: CalendarUserSettings = {
            ...this._calendarUserSettings,
            [key]: value,
        };
        this._handleCalendarUserSettingsChange(newSettings);
    }

    private _handleAddMilestone(): void {
        this.addMilestone.emit();
    }

    private _handleAddTask(): void {
        this.addTask.emit();
    }

    private _handleCalendarUserSettingsChange(settings: CalendarUserSettings): void {
        this._store.dispatch(new CalendarActions.Set.UserSettings(settings));
    }

    private _markAllNewsAsRead(): void {
        this._store.dispatch(new NewsActions.Delete.AllNews());
    }

    private _setCreateDropdownItems(permissions: CurrentProjectPermissions): void {
        const addMilestoneItem: MenuItemsList = {
            customFigureTemplate: this.iconTemplate,
            items: [{
                id: CREATE_MILESTONE_ITEM_ID,
                type: 'button',
                label: 'Generic_Milestone',
                customData: 'milestone',
            }],
        };
        const {canCreateCraftMilestone, canCreateInvestorMilestone, canCreateProjectMilestone} = permissions;
        const hasCreateMilestonePermissions = canCreateCraftMilestone || canCreateInvestorMilestone || canCreateProjectMilestone;

        const addTaskItem: MenuItemsList = {
            customFigureTemplate: this.iconTemplate,
            items: [{
                id: CREATE_TASK_ITEM_ID,
                type: 'button',
                label: 'Generic_Task',
                customData: 'task',
            }],
        };

        this.createDropdownItems = hasCreateMilestonePermissions ? [addTaskItem, addMilestoneItem] : [addTaskItem];
    }

    private _setIsCherryPicking(isMultiSelecting: boolean, context: CalendarSelectionContextEnum): void {
        this.isCherryPicking = isMultiSelecting && context == null;
        this._changeDetectorRef.detectChanges();
    }

    private _setSettingsDropdownItems(permissions: CurrentProjectPermissions): void {
        this.settingsDropdownItems = [];

        const taskViewModeGroup: MenuItem<TaskCalendarTaskViewModeEnum>[] = TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER
            .getMenuItems('radio', TASK_VIEW_MODE_MENU_ITEM_ID)
            .map(item => ({...item, selected: item.value === this._calendarUserSettings.taskViewMode}));

        this.settingsDropdownItems.push(
            {items: taskViewModeGroup, title: 'Generic_View', separator: true}
        );

        if (permissions.canChangeSortingMode) {
            const sortingModeGroup: MenuItem<TaskCalendarSortingModeEnum>[] = TaskCalendarSortingModeEnumHelper
                .getMenuItems('radio', SORT_MODE_MENU_ITEM_GROUP_ID)
                .map(item => ({...item, selected: item.value === this._calendarUserSettings.sortingMode}));

            this.settingsDropdownItems.push(
                {items: sortingModeGroup, title: 'TaskCalendarSortingMode_Title', separator: true}
            );
        }

        const taskCardDescriptionTypeGroup: MenuItem<TaskCardDescriptionTypeEnum>[] = TaskCardDescriptionTypeEnumHelper
            .getMenuItems('radio', TASK_CARD_DESCRIPTION_TYPE_MENU_ITEM_GROUP_ID)
            .map(item => ({...item, selected: item.value === this._calendarUserSettings.taskCardDescriptionType}));

        this.settingsDropdownItems.push(
            {items: taskCardDescriptionTypeGroup, title: 'TaskCardDescriptionType_Title', separator: true}
        );

        const showDayCardIndicatorsItem: MenuItem<CalendarUserSettings> = {
            id: SHOW_DAYCARD_INDICATORS_ITEM_ID,
            label: 'Calendar_DayCardStatus_ShowLabel',
            type: 'select-icon',
            selected: this._calendarUserSettings.showDayCardIndicators,
        };
        const items = [showDayCardIndicatorsItem];

        const showAllDependencyLinesItem: MenuItem<CalendarUserSettings> = {
            id: SHOW_DEPENDENCY_LINES_ITEM_ID,
            label: 'Calendar_DependencyLines_ShowLabel',
            type: 'select-icon',
            selected: this._calendarUserSettings.showDependencyLines,
        };

        items.push(showAllDependencyLinesItem);

        const showUnreadNewsItem: MenuItem<CalendarUserSettings> = {
            id: SHOW_UNREAD_NEWS_ITEM_ID,
            label: 'Calendar_ShowUnreadNews_ShowLabel',
            type: 'select-icon',
            selected: this._calendarUserSettings.showUnreadNews,
        };

        items.push(showUnreadNewsItem);

        this.settingsDropdownItems.push(
            {items, title: 'Generic_Options', separator: true},
        );

        const markAllNewsAsRead: Array<MenuItem<CalendarUserSettings>> = [{
            id: MARK_ALL_NEWS_AS_READ_ITEM_ID,
            label: 'Calendar_MarkAllNewsAsRead_ShowLabel',
            type: 'button',
            customData: 'eye-check',
        }];

        this.settingsDropdownItems.push(
            {items: markAllNewsAsRead, customFigureTemplate: this.iconTemplate, separator: true}
        );

        if (permissions.canRescheduleProject) {
            const rescheduleGroup: Array<MenuItem<CalendarUserSettings>> = [{
                id: RESCHEDULE_MENU_ITEM_ID,
                label: 'Generic_Reschedule',
                type: 'button',
                customData: 'calendar-sheet',
            }];

            this.settingsDropdownItems.push(
                {items: rescheduleGroup, customFigureTemplate: this.iconTemplate}
            );
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._projectQueries.observeCurrentProjectPermissions(),
                this._calendarQueries.observeCalendarUserSettings(),
            ]).subscribe(([permissions, settings]) => {
                this._setCreateDropdownItems(permissions);
                this._calendarUserSettings = settings;
                this._setSettingsDropdownItems(permissions);
                this._changeDetectorRef.detectChanges();
            })
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionSlice()
                .subscribe(({isMultiSelecting, context}) => {
                    this._calendarSelectionContext = context;

                    this._setIsCherryPicking(isMultiSelecting, context);
                })
        );
    }

    private _toggleCalendarUserSetting(key: string): void {
        this._handleCalendarUserSettingsChange({
            ...this._calendarUserSettings,
            [key]: !this._calendarUserSettings[key],
        });
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

type ChangeCalendarSettingsType = TaskCalendarSortingModeEnum | TaskCardDescriptionTypeEnum | TaskCalendarTaskViewModeEnum;
