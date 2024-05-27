/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {flatten} from 'lodash';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {ProjectSliceServiceMock} from '../../../../../../test/mocks/project-slice.service.mock';
import {MockStore} from '../../../../../../test/mocks/store';
import {MonitoringHelper} from '../../../../../shared/monitoring/helpers/monitoring.helper';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {CalendarUserSettings} from '../../../../project-common/api/calendar/resources/calendar-user-settings';
import {CalendarSelectionContextEnum} from '../../../../project-common/enums/calendar-selection-context.enum';
import {TaskCalendarSortingModeEnum} from '../../../../project-common/enums/task-calendar-sorting-mode.enum';
import {
    TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER,
    TaskCalendarTaskViewModeEnum,
} from '../../../../project-common/enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../../../project-common/enums/task-card-description-type.enum';
import {CalendarActions} from '../../../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../../../project-common/store/calendar/calendar/calendar.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CALENDAR_SELECTION_SLICE_INITIAL_STATE} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.initial-state';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarSelectionSlice} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.slice';
import {NewsActions} from '../../../../project-common/store/news/news.actions';
import {CurrentProjectPermissions} from '../../../../project-common/store/projects/project.slice';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {
    CREATE_MILESTONE_ITEM_ID,
    CREATE_TASK_ITEM_ID,
    MARK_ALL_NEWS_AS_READ_ITEM_ID,
    RESCHEDULE_MENU_ITEM_ID,
    SHOW_DAYCARD_INDICATORS_ITEM_ID,
    SHOW_DEPENDENCY_LINES_ITEM_ID,
    SHOW_UNREAD_NEWS_ITEM_ID,
    SORT_MODE_MENU_ITEM_GROUP_ID,
    TASK_CARD_DESCRIPTION_TYPE_MENU_ITEM_GROUP_ID,
    TASK_VIEW_MODE_MENU_ITEM_ID,
    TasksCalendarActionsComponent
} from './tasks-calendar-actions.component';

export const SORT_MODE_DEFAULT_ITEM_ID = 'Default';
export const SORT_MODE_CRAFTS_NEXT_LINE_ITEM_ID = 'CraftsNextLine';
export const SORT_MODE_CRAFTS_SAME_LINE_ITEM_ID = 'CraftsSameLine';

describe('Tasks Calendar Actions Component', () => {
    let fixture: ComponentFixture<TasksCalendarActionsComponent>;
    let comp: TasksCalendarActionsComponent;
    let de: DebugElement;
    let store: Store;
    let projectQueries: ProjectSliceService;
    let modalService: ModalService;

    const mockCalendarQueries: CalendarQueries = mock(CalendarQueries);
    const mockCalendarSelectionQueries: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const monitoringHelperMock: MonitoringHelper = mock(MonitoringHelper);

    const currentProjectPermissions: CurrentProjectPermissions = {
        canChangeSortingMode: true,
        canCopyProject: true,
        canCreateCraftMilestone: true,
        canCreateInvestorMilestone: true,
        canCreateProjectMilestone: true,
        canEditProject: true,
        canEditProjectSettings: true,
        canExportProject: true,
        canImportProject: true,
        canRescheduleProject: true,
        canSeeProjectCrafts: true,
        canSeeProjectParticipants: true,
        canSeeProjectTasks: true,
        canSeeWorkareas: true,
    };
    const projectPermissionsObservable: Subject<CurrentProjectPermissions> = new Subject<CurrentProjectPermissions>();
    const addMilestoneItem: MenuItem = {
        id: CREATE_MILESTONE_ITEM_ID,
        type: 'button',
        label: 'Generic_Milestone',
        customData: 'milestone',
    };
    const addTaskItem: MenuItem = {
        id: CREATE_TASK_ITEM_ID,
        type: 'button',
        label: 'Generic_Task',
        customData: 'task',
    };

    const taskViewModeWeekItemId = TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER.getKeyByValue(TaskCalendarTaskViewModeEnum.Week) as string;
    const taskViewModeDayItemId = TASK_CALENDAR_TASK_VIEW_MODE_ENUM_HELPER.getKeyByValue(TaskCalendarTaskViewModeEnum.Day) as string;

    const dataAutomationExportButtonSelector = '[data-automation="export-button"]';

    const calendarUserSettingsDisabled: CalendarUserSettings = {
        taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        showDayCardIndicators: false,
        showDependencyLines: false,
        sortingMode: TaskCalendarSortingModeEnum.Default,
        showUnreadNews: false,
        taskViewMode: TaskCalendarTaskViewModeEnum.Week,
    };

    const changeSortModeItem: MenuItem<TaskCalendarSortingModeEnum> = {
        id: SORT_MODE_CRAFTS_NEXT_LINE_ITEM_ID,
        label: 'Start on the next line',
        type: 'radio',
        groupId: SORT_MODE_MENU_ITEM_GROUP_ID,
        value: TaskCalendarSortingModeEnum.CraftsNextLine,
        selected: calendarUserSettingsDisabled.sortingMode === TaskCalendarSortingModeEnum.CraftsNextLine,
    };

    const changeTaskCardDescriptionTypeItem: MenuItem<TaskCardDescriptionTypeEnum> = {
        id: 'Assignee',
        label: 'Assignee',
        type: 'radio',
        groupId: TASK_CARD_DESCRIPTION_TYPE_MENU_ITEM_GROUP_ID,
        value: TaskCardDescriptionTypeEnum.Assignee,
        selected: calendarUserSettingsDisabled.taskCardDescriptionType === TaskCardDescriptionTypeEnum.Assignee,
    };

    const changeTaskViewModeItem: MenuItem<TaskCalendarTaskViewModeEnum> = {
        id: taskViewModeDayItemId,
        label: 'day',
        type: 'radio',
        groupId: TASK_VIEW_MODE_MENU_ITEM_ID,
        value: TaskCalendarTaskViewModeEnum.Day,
        selected: calendarUserSettingsDisabled.taskViewMode === TaskCalendarTaskViewModeEnum.Day,
    };

    const calendarSettingsObservable: Subject<CalendarUserSettings> = new Subject<CalendarUserSettings>();
    const observeCalendarSelectionSliceSubject: Subject<CalendarSelectionSlice> = new Subject<CalendarSelectionSlice>();
    const indicatorsSettingsItem: MenuItem = {
        id: SHOW_DAYCARD_INDICATORS_ITEM_ID,
        label: 'Calendar_DayCardStatus_ShowLabel',
        type: 'select-icon',
    };

    const calendarUserSettingsEnabled: CalendarUserSettings = {
        taskCardDescriptionType: TaskCardDescriptionTypeEnum.Company,
        showDayCardIndicators: true,
        showDependencyLines: true,
        sortingMode: TaskCalendarSortingModeEnum.Default,
        showUnreadNews: true,
        taskViewMode: TaskCalendarTaskViewModeEnum.Week,
    };

    const defaultCalendarSelectionSlice: CalendarSelectionSlice = CALENDAR_SELECTION_SLICE_INITIAL_STATE;

    const getCreateDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.createDropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const getSettingsDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.settingsDropdownItems.map(({items}) => items)).find(item => item.id === itemId);

    const getDebugElement = (selector: string): DebugElement => de.query(By.css(selector)) || null;
    const getElement = (selector: string): HTMLElement => getDebugElement(selector)?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [
            TasksCalendarActionsComponent,
        ],
        providers: [
            {
                provide: CalendarQueries,
                useValue: instance(mockCalendarQueries),
            },
            {
                provide: CalendarSelectionQueries,
                useValue: instance(mockCalendarSelectionQueries),
            },
            {
                provide: ProjectSliceService,
                useClass: ProjectSliceServiceMock,
            },
            {
                provide: MonitoringHelper,
                useValue: instance(monitoringHelperMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksCalendarActionsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        projectQueries = TestBed.inject(ProjectSliceService);
        modalService = TestBed.inject(ModalService);
        store = TestBed.inject(Store);

        when(mockCalendarQueries.observeCalendarUserSettings()).thenReturn(calendarSettingsObservable);
        when(mockCalendarSelectionQueries.observeCalendarSelectionSlice()).thenReturn(observeCalendarSelectionSliceSubject);

        spyOn(projectQueries, 'observeCurrentProjectPermissions').and.returnValue(projectPermissionsObservable);

        fixture.detectChanges();
    });

    it('should call openCalendarExportModal when export button is clicked', () => {
        spyOn(comp, 'openCalendarExportModal');

        getElement(dataAutomationExportButtonSelector).click();
        expect(comp.openCalendarExportModal).toHaveBeenCalled();
    });

    it('should open a modal when export button is clicked', () => {
        spyOn(modalService, 'open');

        getElement(dataAutomationExportButtonSelector).click();
        expect(modalService.open).toHaveBeenCalled();
    });

    it('should close the modal when modal is closed', () => {
        spyOn(modalService, 'close');

        getElement(dataAutomationExportButtonSelector).click();
        fixture.detectChanges();

        comp.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should show milestone create button', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getCreateDropdownItem(CREATE_MILESTONE_ITEM_ID)).toEqual(addMilestoneItem);
    });

    it('should show task create button', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getCreateDropdownItem(CREATE_TASK_ITEM_ID)).toEqual(addTaskItem);
    });

    it('should show milestone create button when user has permissions to create milestones of at least one type', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next({
            ...currentProjectPermissions,
            canCreateCraftMilestone: true,
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: false,
        });

        expect(getCreateDropdownItem(CREATE_MILESTONE_ITEM_ID)).toEqual(addMilestoneItem);
    });

    it('should not add milestone create button and add task create button when user has no permissions to create ' +
        'milestones of any type', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next({
            ...currentProjectPermissions,
            canCreateCraftMilestone: false,
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: false,
        });

        expect(getCreateDropdownItem(CREATE_MILESTONE_ITEM_ID)).not.toEqual(addMilestoneItem);
        expect(getCreateDropdownItem(CREATE_TASK_ITEM_ID)).toEqual(addTaskItem);
    });

    it('should emit addMilestone event when "Milestone" option callback is called', () => {
        spyOn(comp.addMilestone, 'emit');

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleCreateDropdownItemClicked(addMilestoneItem);

        expect(comp.addMilestone.emit).toHaveBeenCalled();
    });

    it('should emit addTask event when "Task" option callback is called', () => {
        spyOn(comp.addTask, 'emit');

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleCreateDropdownItemClicked(addTaskItem);

        expect(comp.addTask.emit).toHaveBeenCalled();
    });

    it('should emit toggleFilterDrawer event when handleToggleFilterDrawer is called', () => {
        spyOn(comp.toggleFilterDrawer, 'emit');

        comp.handleToggleFilterDrawer();

        expect(comp.toggleFilterDrawer.emit).toHaveBeenCalled();
    });

    it('should emit toggleQuickFilterDrawer event when handleToggleQuickFilterDrawer is called', () => {
        spyOn(comp.toggleQuickFilterDrawer, 'emit');

        comp.handleToggleQuickFilterDrawer();

        expect(comp.toggleQuickFilterDrawer.emit).toHaveBeenCalled();
    });

    it('should update filterIconBadgeStrokeColor on input filterDrawerOpenState change', () => {
        comp.filterDrawerOpenState = true;
        expect(comp.filterIconBadgeStrokeColor).toBe(COLORS.light_grey_25);

        comp.filterDrawerOpenState = false;
        expect(comp.filterIconBadgeStrokeColor).toBe(COLORS.white);
    });

    it('should update isFilterDrawerOpen on input filterDrawerOpenState change', () => {
        comp.filterDrawerOpenState = true;
        expect(comp.isFilterDrawerOpen).toBeTruthy();

        comp.filterDrawerOpenState = false;
        expect(comp.isFilterDrawerOpen).toBeFalsy();
    });

    it('should update isQuickFilterDrawerOpen on filterDrawerOpenState change', () => {
        comp.quickFilterDrawerOpenState = true;
        expect(comp.isQuickFilterDrawerOpen).toBeTruthy();

        comp.quickFilterDrawerOpenState = false;
        expect(comp.isQuickFilterDrawerOpen).toBeFalsy();
    });

    it('should dispatch CalendarActions.Set.UserSettings action with toggled option', () => {
        const newSettings = {
            ...calendarUserSettingsEnabled,
            showDayCardIndicators: false,
        };
        const action = new CalendarActions.Set.UserSettings(newSettings);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleSettingsDropdownItemClicked(indicatorsSettingsItem);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should mark the show daycard indicators item as selected when setting is enable', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_DAYCARD_INDICATORS_ITEM_ID).selected).toBeTruthy();
    });

    it('should dispatch CalendarActions.Set.UserSettings with new settings on sort mode radio button click', () => {
        const newSettings: CalendarUserSettings = {
            ...calendarUserSettingsEnabled,
            sortingMode: TaskCalendarSortingModeEnum.CraftsNextLine,
        };
        const action = new CalendarActions.Set.UserSettings(newSettings);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleSettingsDropdownItemClicked(changeSortModeItem);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch CalendarActions.Set.UserSettings with new settings on task view mode radio button click', () => {
        const newSettings: CalendarUserSettings = {
            ...calendarUserSettingsEnabled,
            taskViewMode: TaskCalendarTaskViewModeEnum.Day,
        };
        const action = new CalendarActions.Set.UserSettings(newSettings);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleSettingsDropdownItemClicked(changeTaskViewModeItem);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should not mark the show daycard indicators item as selected when setting is disable', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_DAYCARD_INDICATORS_ITEM_ID).selected).toBeFalsy();
    });

    it('should mark the show dependency lines item as selected when setting is enable', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_DEPENDENCY_LINES_ITEM_ID).selected).toBeTruthy();
    });

    it('should not mark the show dependency lines item as selected when setting is disable', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_DEPENDENCY_LINES_ITEM_ID).selected).toBeFalsy();
    });

    it('should have a separator and a title on the settings dropdown menu for generic options', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(comp.settingsDropdownItems[3].title).toEqual('Generic_Options');
        expect(comp.settingsDropdownItems[3].separator).toBeTruthy();
    });

    it('should have a separator and a title on the settings dropdown menu for the sorting mode', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(comp.settingsDropdownItems[1].title).toEqual('TaskCalendarSortingMode_Title');
        expect(comp.settingsDropdownItems[1].separator).toBeTruthy();
    });

    it('should have a separator and a title on the settings dropdown menu for the task card description type', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(comp.settingsDropdownItems[2].title).toEqual('TaskCardDescriptionType_Title');
        expect(comp.settingsDropdownItems[2].separator).toBeTruthy();
    });

    it('should have the sort mode menu items in the settings dropdown menu when the user has sorting permissions', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SORT_MODE_DEFAULT_ITEM_ID)).toBeTruthy();
        expect(getSettingsDropdownItem(SORT_MODE_CRAFTS_NEXT_LINE_ITEM_ID)).toBeTruthy();
        expect(getSettingsDropdownItem(SORT_MODE_CRAFTS_SAME_LINE_ITEM_ID)).toBeTruthy();
    });

    it('should not have the sort mode menu items in the settings dropdown menu when the user '
        + 'does not have sorting permissions', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next({
            ...currentProjectPermissions,
            canChangeSortingMode: false,
        });

        expect(getSettingsDropdownItem(SORT_MODE_DEFAULT_ITEM_ID)).toBeFalsy();
        expect(getSettingsDropdownItem(SORT_MODE_CRAFTS_NEXT_LINE_ITEM_ID)).toBeFalsy();
        expect(getSettingsDropdownItem(SORT_MODE_CRAFTS_SAME_LINE_ITEM_ID)).toBeFalsy();
    });

    it('should have the Reschedule menu item in the settings dropdown menu when the user has reschedule permissions', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(RESCHEDULE_MENU_ITEM_ID)).toBeTruthy();
    });

    it('should not have the Reschedule menu item in the settings dropdown menu when the user '
        + 'does not have reschedule permissions', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next({
            ...currentProjectPermissions,
            canRescheduleProject: false,
        });

        expect(getSettingsDropdownItem(RESCHEDULE_MENU_ITEM_ID)).toBeFalsy();
    });

    it('should have the task view mode in the settings dropdown menu', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(comp.settingsDropdownItems[0].title).toEqual('Generic_View');
        expect(comp.settingsDropdownItems[0].separator).toBeTruthy();
        expect(getSettingsDropdownItem(taskViewModeWeekItemId)).toBeTruthy();
        expect(getSettingsDropdownItem(taskViewModeDayItemId)).toBeTruthy();
    });

    it('should emit the toggleRescheduleDrawer output when the Reschedule Button is clicked', () => {
        spyOn(comp.toggleRescheduleDrawer, 'emit').and.callThrough();

        comp.handleSettingsDropdownItemClicked({id: RESCHEDULE_MENU_ITEM_ID, value: undefined} as MenuItem<CalendarUserSettings>);

        expect(comp.toggleRescheduleDrawer.emit).toHaveBeenCalled();
    });

    it('should add show dependency lines setting for Dependency Arrows', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_DEPENDENCY_LINES_ITEM_ID)).toBeTruthy();
    });

    it('should add option to show/hide news as selected to the settings dropdown actions on initialization', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_UNREAD_NEWS_ITEM_ID).selected).toBeTruthy();
    });

    it('should not add option to show/hide news as unselected to the settings dropdown actions on initialization', () => {
        calendarSettingsObservable.next(calendarUserSettingsDisabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(SHOW_UNREAD_NEWS_ITEM_ID).selected).toBeFalsy();
    });

    it('should dispatch action NewsActions.Delete.AllNews when the Mark All News As Read Button is clicked', () => {
        spyOn(store, 'dispatch');
        const expectResult: NewsActions.Delete.AllNews = new NewsActions.Delete.AllNews();

        comp.handleSettingsDropdownItemClicked({id: MARK_ALL_NEWS_AS_READ_ITEM_ID, value: undefined} as MenuItem<CalendarUserSettings>);

        expect(store.dispatch).toHaveBeenCalledWith(expectResult);
    });

    it('should add option to mark all news as read to the settings dropdown actions on initialization', () => {
        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        expect(getSettingsDropdownItem(MARK_ALL_NEWS_AS_READ_ITEM_ID)).toBeTruthy();
    });

    it('should set isCherryPicking to true when observeCalendarSelectionSlice emits with isMultiSelecting to true ' +
        'and context to null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
            context: null,
        };

        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        expect(comp.isCherryPicking).toBe(true);
    });

    it('should set isCherryPicking to false when observeCalendarSelectionSlice emits with isMultiSelecting to true ' +
        'and context to not null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
            context: CalendarSelectionContextEnum.Dependencies,
        };

        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        expect(comp.isCherryPicking).toBe(false);
    });

    it('should set isCherryPicking to false when observeCalendarSelectionSlice emits with isMultiSelecting to false ' +
        'and context to null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: false,
            context: null,
        };

        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        expect(comp.isCherryPicking).toBe(false);
    });

    it('should set isCherryPicking to false when observeCalendarSelectionSlice emits with isMultiSelecting to false ' +
        'and context to not null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: false,
            context: CalendarSelectionContextEnum.Dependencies,
        };

        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        expect(comp.isCherryPicking).toBe(false);
    });

    it('should dispatch a CalendarSelectionActions.Set.Selection action with isMultiSelecting to true when ' +
        'handleMultiSelectButtonClicked is called with isMultiSelecting as false and context as null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = defaultCalendarSelectionSlice;
        const expectedPayload = new CalendarSelectionActions.Set.Selection(true, null);

        spyOn(store, 'dispatch').and.callThrough();
        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        comp.handleMultiSelectButtonClicked();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should dispatch a CalendarSelectionActions.Initialize.All action when handleMultiSelectButtonClicked is called with ' +
        'isMultiSelecting as true and context as null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
        };
        const expectedPayload = new CalendarSelectionActions.Initialize.All();

        spyOn(store, 'dispatch').and.callThrough();
        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        comp.handleMultiSelectButtonClicked();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedPayload);
    });

    it('should not dispatch a CalendarSelectionActions.Set.Selection action when handleMultiSelectButtonClicked is called ' +
        'and the calendar selection context is not null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
            context: CalendarSelectionContextEnum.Dependencies,
        };

        spyOn(store, 'dispatch').and.callThrough();
        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        comp.handleMultiSelectButtonClicked();

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch a CalendarSelectionActions.Initialize.All action when handleMultiSelectButtonClicked is called ' +
        'and the calendar selection context is not null', () => {
        const calendarSelectionSlice: CalendarSelectionSlice = {
            ...defaultCalendarSelectionSlice,
            isMultiSelecting: true,
            context: CalendarSelectionContextEnum.Dependencies,
        };

        spyOn(store, 'dispatch').and.callThrough();
        observeCalendarSelectionSliceSubject.next(calendarSelectionSlice);

        comp.handleMultiSelectButtonClicked();

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch CalendarActions.Set.UserSettings with new settings on task description when handleSettingsDropdownItemClicked' +
        'is call', () => {
        const newSettings: CalendarUserSettings = {
            ...calendarUserSettingsEnabled,
            taskCardDescriptionType: TaskCardDescriptionTypeEnum.Assignee,
        };
        const action = new CalendarActions.Set.UserSettings(newSettings);

        spyOn(store, 'dispatch').and.callThrough();

        calendarSettingsObservable.next(calendarUserSettingsEnabled);
        projectPermissionsObservable.next(currentProjectPermissions);

        comp.handleSettingsDropdownItemClicked(changeTaskCardDescriptionTypeItem);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });
});
