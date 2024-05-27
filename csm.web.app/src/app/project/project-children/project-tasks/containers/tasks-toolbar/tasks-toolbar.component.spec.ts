/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {updateWindowInnerWidth} from '../../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../../shared/misc/helpers/breakpoint.helper';
import {ToolbarModule} from '../../../../../shared/toolbar/toolbar.module';
import {
    BREAKPOINTS_RANGE,
    BreakpointsEnum
} from '../../../../../shared/ui/constants/breakpoints.constant';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {DrawerService} from '../../../../../shared/ui/drawer/api/drawer.service';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectFiltersCaptureContextEnum} from '../../../../project-common/containers/project-filter-capture/project-filter-capture.component';
import {ProjectFilterDrawerComponent} from '../../../../project-common/containers/project-filter-drawer/project-filter-drawer.component';
import {QuickFilterDrawerComponent} from '../../../../project-common/containers/quick-filter-drawer/quick-filter-drawer.component';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {
    ASSIGN_TASK_ITEM_ID,
    SEND_TASK_ITEM_ID,
    TasksToolbarComponent,
} from './tasks-toolbar.component';

describe('Tasks Toolbar Component', () => {
    let component: TasksToolbarComponent;
    let fixture: ComponentFixture<TasksToolbarComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;
    let store: any;
    let drawerService: any;

    let flyoutId = '';
    const clickEvent: Event = new Event('click');
    const initialInnerWidth = BREAKPOINTS_RANGE.lg.max;
    const mockProjectTaskQueries: ProjectTaskQueries = mock(ProjectTaskQueries);
    const breakpointChange$: Subject<string> = new Subject();
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const taskAssignListSubject: Subject<AbstractSelectionList> = new Subject();
    const windowAutoScrollSettings: ScrollToOptions = {top: 0, behavior: 'smooth'};

    const sortFlyoutButtonSelector = '[data-automation="sort-flyout-button"]';
    const sendTaskButtonSelector = '[data-automation="send-task-button"]';
    const assignTaskButtonSelector = '[data-automation="assign-task-button"]';
    const optionsDropdownButtonSelector = '[data-automation="dropdown-button"]';

    const getElementBySelector = (selector): HTMLElement => de.query(By.css(selector))?.nativeElement;
    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(component.getDropdownItems().map(({items}) => items)).find(item => item.id === itemId);

    const clearFlyout = () => {
        if (flyoutService.isFlyoutOpen(flyoutId)) {
            flyoutService.close(flyoutId);
        }
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslateModule,
            ToolbarModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            StoreModule.forRoot({}),
        ],
        declarations: [
            TasksToolbarComponent,
        ],
        providers: [
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(mockProjectTaskQueries),
            },
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            ProjectCraftQueries,
            WorkareaQueries,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(mockProjectTaskQueries.observeTaskListFilters()).thenReturn(of(new ProjectTaskFilters()));
        when(mockProjectTaskQueries.observeCreateTaskPermission()).thenReturn(of(true));
        when(mockProjectTaskQueries.observeSendTaskPermission()).thenReturn(of(true));
        when(mockProjectTaskQueries.observeAssignTaskPermission()).thenReturn(of(true));
        when(mockProjectTaskQueries.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(mockProjectTaskQueries.observeTaskAssignList()).thenReturn(taskAssignListSubject);
        when(mockProjectTaskQueries.observeTaskSendList()).thenReturn(of(new AbstractSelectionList()));
        when(mockProjectTaskQueries.observeTaskAssignListRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(mockProjectTaskQueries.observeTaskSendListRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(mockProjectTaskQueries.hasTaskListFiltersApplied()).thenReturn(of(false));
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('xl');
        when(breakpointHelperMock.breakpointChange()).thenReturn(breakpointChange$);
        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.xl)).thenReturn(true);
        fixture = TestBed.createComponent(TasksToolbarComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        flyoutId = component.sortFlyout.id;
        drawerService = TestBed.inject(DrawerService);
        flyoutService = TestBed.inject(FlyoutService);
        store = TestBed.inject(Store);

        component.ngOnInit();
        fixture.detectChanges();
    });

    afterEach(() => {
        clearFlyout();
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should handle toggleCreateTask', () => {
        expect(component.showCreateTask).toBe(false);
        component.toggleCreateTask(true);
        expect(component.showCreateTask).toBeTruthy();
        component.toggleCreateTask(false);
        expect(component.showCreateTask).toBeFalsy();
    });

    it('should handle toggleAssignTask', () => {
        const initializeAssignAction = new ProjectTaskActions.Initialize.Assignment();
        const initializeSendAction = new ProjectTaskActions.Initialize.Sending();

        spyOn(store, 'dispatch').and.callThrough();
        fixture.detectChanges();

        component.toggleAssignTask(true);
        expect(store.dispatch).toHaveBeenCalledWith(initializeAssignAction);
        expect(store.dispatch).toHaveBeenCalledWith(initializeSendAction);
        expect(component.showAssignTask).toBeTruthy();

        component.toggleAssignTask(false);
        expect(store.dispatch).toHaveBeenCalledWith(initializeAssignAction);
        expect(component.showAssignTask).toBeFalsy();
    });

    it('should handle toggleSendTask', () => {
        const initializeAssignAction = new ProjectTaskActions.Initialize.Assignment();
        const initializeSendAction = new ProjectTaskActions.Initialize.Sending();

        spyOn(store, 'dispatch').and.callThrough();

        component.toggleSendTask(true);
        expect(store.dispatch).toHaveBeenCalledWith(initializeAssignAction);
        expect(store.dispatch).toHaveBeenCalledWith(initializeSendAction);
        expect(component.showSendTask).toBeTruthy();

        component.toggleSendTask(false);
        expect(store.dispatch).toHaveBeenCalledWith(initializeSendAction);
        expect(component.showSendTask).toBeFalsy();
    });

    it('should open the flyout when when the sort button is clicked', () => {
        spyOn(flyoutService, 'open').and.callThrough();
        updateWindowInnerWidth(BreakpointsEnum.lg);
        fixture.detectChanges();
        getElementBySelector(sortFlyoutButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(flyoutService.open).toHaveBeenCalledWith(flyoutId);
        expect(component.isSortingFlyoutOpen).toBeTruthy();
    });

    it('should close the flyout when we click the sort button while the flyout is open', () => {
        spyOn(flyoutService, 'close').and.callThrough();
        updateWindowInnerWidth(BreakpointsEnum.lg);
        fixture.detectChanges();

        getElementBySelector(sortFlyoutButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        getElementBySelector(sortFlyoutButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(flyoutService.close).toHaveBeenCalledWith(flyoutId);
        expect(component.isSortingFlyoutOpen).toBeFalsy();
    });

    it('should close any open panels if the sorting button is clicked', () => {
        const initializeAssignAction = new ProjectTaskActions.Initialize.Assignment();
        const initializeSendAction = new ProjectTaskActions.Initialize.Sending();

        spyOn(store, 'dispatch').and.callThrough();
        spyOn(component, 'toggleAssignTask').and.callThrough();
        spyOn(component, 'toggleCreateTask').and.callThrough();
        spyOn(component, 'toggleSendTask').and.callThrough();
        spyOn(drawerService, 'close').and.callThrough();
        updateWindowInnerWidth(BreakpointsEnum.lg);
        fixture.detectChanges();

        getElementBySelector(sortFlyoutButtonSelector).dispatchEvent(clickEvent);
        expect(store.dispatch).toHaveBeenCalledWith(initializeAssignAction);
        expect(store.dispatch).toHaveBeenCalledWith(initializeSendAction);
        expect(component.showCreateTask).toBeFalsy();
        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should close filter drawer if it is already opened', () => {
        spyOn(drawerService, 'close');
        component.isFilterDrawerOpened = true;
        component.filterIconBadgeStrokeColor = COLORS.light_grey_25;

        fixture.detectChanges();
        component.toggleFilterDrawer();

        expect(drawerService.close).toHaveBeenCalled();
        expect(component.isFilterDrawerOpened).toBeFalsy();
        expect(component.filterIconBadgeStrokeColor).toEqual(COLORS.white);
    });

    it('should open filter drawer if it is closed', () => {
        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});
        component.isFilterDrawerOpened = false;
        component.filterIconBadgeStrokeColor = COLORS.white;

        fixture.detectChanges();
        component.toggleFilterDrawer();

        expect(drawerService.open).toHaveBeenCalledWith(
            ProjectFilterDrawerComponent,
            ProjectFiltersCaptureContextEnum.TaskList,
        );
        expect(component.isFilterDrawerOpened).toBeTruthy();
        expect(component.filterIconBadgeStrokeColor).toEqual(COLORS.light_grey_25);
    });

    it('should close quick filter drawer if it is already opened', () => {
        spyOn(drawerService, 'close');
        component.isQuickFilterDrawerOpened = true;

        fixture.detectChanges();
        component.toggleQuickFilterDrawer();

        expect(drawerService.close).toHaveBeenCalled();
        expect(component.isQuickFilterDrawerOpened).toBeFalsy();
    });

    it('should open quick filter drawer if it is closed', () => {
        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});
        component.isQuickFilterDrawerOpened = false;

        fixture.detectChanges();
        component.toggleQuickFilterDrawer();

        expect(drawerService.open).toHaveBeenCalledWith(
            QuickFilterDrawerComponent,
            'list',
        );
        expect(component.isQuickFilterDrawerOpened).toBeTruthy();
    });

    it('should toggle between filter drawer and quick filter drawer', () => {
        spyOn(drawerService, 'close');
        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});

        component.isFilterDrawerOpened = true;
        component.isQuickFilterDrawerOpened = false;

        fixture.detectChanges();
        component.toggleQuickFilterDrawer();

        expect(drawerService.open).toHaveBeenCalledWith(
            QuickFilterDrawerComponent,
            'list',
        );
        expect(component.isQuickFilterDrawerOpened).toBeTruthy();
        expect(component.isFilterDrawerOpened).toBeFalsy();
        expect(component.filterIconBadgeStrokeColor).toEqual(COLORS.white);
    });

    it('should toggle between quick filter drawer and filter drawer', () => {
        spyOn(drawerService, 'close');
        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});

        component.isFilterDrawerOpened = false;
        component.isQuickFilterDrawerOpened = true;

        fixture.detectChanges();
        component.toggleFilterDrawer();

        expect(drawerService.open).toHaveBeenCalledWith(
            ProjectFilterDrawerComponent,
            ProjectFiltersCaptureContextEnum.TaskList,
        );
        expect(component.isFilterDrawerOpened).toBeTruthy();
        expect(component.isQuickFilterDrawerOpened).toBeFalsy();
        expect(component.filterIconBadgeStrokeColor).toEqual(COLORS.light_grey_25);
    });

    it('should set hasFilters to false for the values given in beforeEach', () => {
        component.hasFilters = true;
        fixture.detectChanges();

        component.ngOnInit();

        expect(component.hasFilters).toBeFalsy();
    });

    it('should set hasFilters to true if a filter was applied to the store', () => {
        when(mockProjectTaskQueries.hasTaskListFiltersApplied()).thenReturn(of(true));
        component.hasFilters = false;

        fixture.detectChanges();
        component.ngOnInit();

        expect(component.hasFilters).toBeTruthy();
    });

    it('should show send task and assign task icons in toolbar in xl resolution, options dropdown must be hidden', () => {
        breakpointChange$.next('xl');
        fixture.detectChanges();

        expect(getElementBySelector(sendTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(assignTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(optionsDropdownButtonSelector)).toBe(undefined);
    });

    it('should show send task and assign task icons in toolbar in lg resolution, options dropdown must be hidden', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('lg');
        breakpointChange$.next('lg');
        fixture.detectChanges();

        expect(getElementBySelector(sendTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(assignTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(optionsDropdownButtonSelector)).toBe(undefined);
    });

    it('should show send task and assign task icons in toolbar in md resolution, options dropdown must be hidden', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('md');
        breakpointChange$.next('md');
        fixture.detectChanges();

        expect(getElementBySelector(sendTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(assignTaskButtonSelector)).not.toBeNull();
        expect(getElementBySelector(optionsDropdownButtonSelector)).toBe(undefined);
    });

    it('should hide send task and assign task icons in toolbar in xs resolution, options dropdown must be visible', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('xs');
        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.xs)).thenReturn(true);
        breakpointChange$.next('xs');
        fixture.detectChanges();

        expect(getElementBySelector(sendTaskButtonSelector)).toBe(undefined);
        expect(getElementBySelector(assignTaskButtonSelector)).toBe(undefined);
        expect(getElementBySelector(optionsDropdownButtonSelector)).not.toBeNull();
    });

    it('should hide send task and assign task icons in toolbar in sm resolution, options dropdown must be visible', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('sm');
        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.sm)).thenReturn(true);
        breakpointChange$.next('sm');
        fixture.detectChanges();

        expect(getElementBySelector(sendTaskButtonSelector)).toBe(undefined);
        expect(getElementBySelector(assignTaskButtonSelector)).toBe(undefined);
        expect(getElementBySelector(optionsDropdownButtonSelector)).not.toBeNull();
    });

    it('should have correct callback for dropdown option assign', () => {
        spyOn(component, 'toggleAssignTask').and.callThrough();
        expect(component.showAssignTask).toBeFalsy();

        component.handleDropdownItemClicked(getDropdownItem(ASSIGN_TASK_ITEM_ID));

        expect(component.toggleAssignTask).toHaveBeenCalledWith(true);
    });

    it('should have correct callback for dropdown option send', () => {
        spyOn(component, 'toggleSendTask').and.callThrough();
        expect(component.showSendTask).toBeFalsy();

        component.handleDropdownItemClicked(getDropdownItem(SEND_TASK_ITEM_ID));

        expect(component.toggleSendTask).toHaveBeenCalledWith(true);
    });

    it('should only show options if user has permission', () => {
        when(mockProjectTaskQueries.observeSendTaskPermission()).thenReturn(of(false));
        when(mockProjectTaskQueries.observeAssignTaskPermission()).thenReturn(of(false));

        component.ngOnInit();

        const options = component.getDropdownItems();

        expect(options.length).toBe(0);
    });

    it('should handle captures and drawers state when task assignment list is selecting is set to true and ' +
        'showAssignTask is currently set to false', () => {
        const newSelectionList = Object.assign(new AbstractSelectionList(), {isSelecting: true});

        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});

        component.toggleFilterDrawer();
        component.showSendTask = true;
        component.showAssignTask = false;

        spyOn(drawerService, 'close').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        taskAssignListSubject.next(newSelectionList);

        expect(component.showAssignTask).toBeTruthy();
        expect(component.showSendTask).toBeFalsy();
        expect(drawerService.close).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Initialize.Sending());
    });

    it('should not handle captures and drawers state when task assignment list is selecting is set to false and ' +
        'showAssignTask is currently set to false', () => {
        const newSelectionList = Object.assign(new AbstractSelectionList(), {isSelecting: false});

        spyOn(drawerService, 'open').and.returnValue({afterClosed: () => of(true)});

        component.toggleFilterDrawer();
        component.showAssignTask = false;
        component.showSendTask = true;

        spyOn(drawerService, 'close').and.callThrough();

        taskAssignListSubject.next(newSelectionList);

        expect(component.showAssignTask).toBeFalsy();
        expect(component.showSendTask).toBeTruthy();
        expect(drawerService.close).not.toHaveBeenCalled();
    });

    it('should call window scroll when calling toggleCreateTask with true argument', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleCreateTask(true);

        expect(window.scroll).toHaveBeenCalledWith(windowAutoScrollSettings);
    });

    it('should not call window scroll when calling toggleCreateTask with different arguments then true', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleCreateTask(null);
        component.toggleCreateTask(false);

        expect(window.scroll).not.toHaveBeenCalledWith(windowAutoScrollSettings);
    });

    it('should call window scroll when calling toggleAssignTask with true argument', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleAssignTask(true);

        expect(window.scroll).toHaveBeenCalledWith(windowAutoScrollSettings);
    });

    it('should not call window scroll when calling toggleAssignTask with different arguments then true', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleAssignTask(null);
        component.toggleAssignTask(false);

        expect(window.scroll).not.toHaveBeenCalledWith(windowAutoScrollSettings);
    });

    it('should call window scroll when calling toggleSendTask with true argument', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleSendTask(true);

        expect(window.scroll).toHaveBeenCalledWith(windowAutoScrollSettings);
    });

    it('should not call window scroll when calling toggleSendTask with different arguments then true', () => {
        spyOn(window, 'scroll').and.callThrough();

        component.toggleSendTask(null);
        component.toggleSendTask(false);

        expect(window.scroll).not.toHaveBeenCalledWith(windowAutoScrollSettings);
    });
});
