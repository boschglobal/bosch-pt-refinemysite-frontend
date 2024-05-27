/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {BreakpointHelper} from '../../../../../shared/misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE} from '../../../../../shared/ui/constants/breakpoints.constant';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {DrawerService} from '../../../../../shared/ui/drawer/api/drawer.service';
import {FlyoutModel} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectFiltersCaptureContextEnum} from '../../../../project-common/containers/project-filter-capture/project-filter-capture.component';
import {
    ProjectFilterDrawerComponent,
    ProjectFilterDrawerContext
} from '../../../../project-common/containers/project-filter-drawer/project-filter-drawer.component';
import {QuickFilterDrawerComponent} from '../../../../project-common/containers/quick-filter-drawer/quick-filter-drawer.component';
import {QuickFilterContext} from '../../../../project-common/store/quick-filters/quick-filter.slice';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {ProjectTasksSortingComponent} from '../../presentationals/tasks-sorting/project-tasks-sorting.component';

export const ASSIGN_TASK_ITEM_ID = 'assign-task';
export const SEND_TASK_ITEM_ID = 'send-task';

@Component({
    selector: 'ss-tasks-toolbar',
    templateUrl: './tasks-toolbar.component.html',
    styleUrls: ['tasks-toolbar.component.scss'],
})
export class TasksToolbarComponent implements OnInit, OnDestroy {

    /**
     * @description Variable with drawer container reference for filters
     */
    @Input()
    public drawerRef: ViewContainerRef;

    /**
     * @description Template reference for the icon
     * @type {TemplateRef<any>}
     */
    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    /**
     * @description the color of the icon badge to be shown when there are filters applied
     * @type {string} filterIconBadgeFillColor
     */
    public filterIconBadgeFillColor = COLORS.light_blue;

    /**
     * @description the color of the icon badge stroke
     * @type {string} filterIconBadgeStrokeColor
     */
    public filterIconBadgeStrokeColor = COLORS.white;

    /**
     * @description Flag indicating if user has permission to create tasks
     */
    public hasCreatePermission: boolean;

    /**
     * @description Flag indicating if user has permission to assign tasks
     */
    public hasAssignPermission: boolean;

    /**
     * @description Flag indicating if there are any filters applied
     */
    public hasFilters: boolean;

    /**
     * @description Flag indicating if user has permission to send drafts
     */
    public hasSendPermission: boolean;

    /**
     * @description Flag indicating if the filter drawer is opened
     */
    public isFilterDrawerOpened = false;

    /**
     * @description Flag indicating if the quick filter drawer is opened
     */
    public isQuickFilterDrawerOpened = false;

    /**
     * @description Flag indicating if the sorting flyout is open
     */
    public isSortingFlyoutOpen: boolean;

    /**
     * @description Flag indicating if screen is in xs or sm resolution
     */
    public isXsOrSmResolution = false;

    /**
     * @description Flag indicating if assign task panel is visible
     */
    public showAssignTask = false;

    /**
     * @description Flag indicating if create task panel is visible
     */
    public showCreateTask = false;

    /**
     * @description Flag indicating if send task panel is visible
     */
    public showSendTask = false;

    /**
     * @description FlyoutModel for the sorting flyout
     * @type {FlyoutModel} sortFlyout
     */
    public sortFlyout: FlyoutModel = {
        component: ProjectTasksSortingComponent,
        properties: {},
        id: 'TasksSorting',
        trigger: [],
        triggerElement: null,
        closeKeyTriggers: [KeyEnum.Escape],
        position: 'below',
        alignment: 'end',
        mobileDrawer: false,
    };

    /**
     * @description Variable containing all open subscriptions to be dropped when component is destroyed
     */
    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private readonly _breakpointHelper: BreakpointHelper,
                private readonly _drawerService: DrawerService,
                private readonly _flyoutService: FlyoutService,
                private readonly _projectTaskQueries: ProjectTaskQueries,
                private readonly _store: Store<State>) {
    }

    ngOnInit(): void {
        this._drawerService.setViewContainerRef(this.drawerRef);
        this._setSubscriptions();
        this._setDropdownOptionsVisibility();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case ASSIGN_TASK_ITEM_ID:
                this.toggleAssignTask(!this.showAssignTask);
                break;
            case SEND_TASK_ITEM_ID:
                this.toggleSendTask(!this.showSendTask);
                break;
        }
    }

    public toggleCreateTask(state: boolean): void {
        if (state) {
            this._handleCloseAll();
            this._scrollToTop();
        }
        this.showCreateTask = state;
    }

    public toggleAssignTask(state: boolean): void {
        if (state) {
            this._handleCloseAll();
            this._scrollToTop();
            this.showAssignTask = state;
        } else {
            this._closeAssignTask();
        }
    }

    public toggleSendTask(state: boolean): void {
        if (state) {
            this._handleCloseAll();
            this._scrollToTop();
            this.showSendTask = state;
        } else {
            this._closeSendTask();
        }
    }

    public toggleSortFlyout() {
        if (this.isSortingFlyoutOpen) {
            this._flyoutService.close(this.sortFlyout.id);
        } else {
            this._flyoutService.open(this.sortFlyout.id);
            this._handleCloseAll();
            this.isSortingFlyoutOpen = true;
        }
    }

    public toggleFilterDrawer(): void {
        if (this.isFilterDrawerOpened) {
            this._drawerService.close();
            this._resetFilterDrawerStatus();
        } else {
            this._handleCloseAll();
            this._drawerService
                .open<ProjectFilterDrawerComponent, ProjectFilterDrawerContext>(
                    ProjectFilterDrawerComponent,
                    ProjectFiltersCaptureContextEnum.TaskList)
                .afterClosed().subscribe(() => this._resetFilterDrawerStatus());
            this.isFilterDrawerOpened = true;
            this.filterIconBadgeStrokeColor = COLORS.light_grey_25;
            this._resetQuickFilterDrawerStatus();
        }
    }

    public toggleQuickFilterDrawer(): void {
        if (this.isQuickFilterDrawerOpened) {
            this._drawerService.close();
            this._resetQuickFilterDrawerStatus();
        } else {
            this._handleCloseAll();
            this._drawerService
                .open<QuickFilterDrawerComponent, QuickFilterContext>(QuickFilterDrawerComponent, 'list')
                .afterClosed().subscribe(() => this._resetQuickFilterDrawerStatus());
            this.isQuickFilterDrawerOpened = true;
            this._resetFilterDrawerStatus();
        }
    }

    public getDropdownItems(): MenuItemsList[] {
        const items: MenuItem[] = [];

        if (this.hasAssignPermission) {
            items.push({
                id: ASSIGN_TASK_ITEM_ID,
                type: 'button',
                label: 'Task_AssignAndSend_Label',
                customData: 'card-user',
            });
        }

        if (this.hasSendPermission) {
            items.push({
                id: SEND_TASK_ITEM_ID,
                type: 'button',
                label: 'Generic_Send',
                customData: 'letter',
            });
        }

        return items.length ? [{
            items,
            customFigureTemplate: this.iconTemplate,
        }] : [];
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCreateTaskPermission()
                .subscribe(this._setCreatePermission.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeAssignTaskPermission()
                .subscribe(this._setAssignPermission.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeSendTaskPermission()
                .subscribe(this._setSendPermission.bind(this))
        );

        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents.pipe(
                filter(flyoutId => flyoutId === this.sortFlyout.id)
            ).subscribe(() => this.isSortingFlyoutOpen = false)
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.hasTaskListFiltersApplied()
                .subscribe(hasFilters => this._setBadgeVisibility(hasFilters))
        );

        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this._setDropdownOptionsVisibility()));

        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeTaskAssignList()
                .pipe(
                    filter((selectionList: AbstractSelectionList) => selectionList.isSelecting && !this.showAssignTask)
                )
                .subscribe(() => this._handleExternalTaskAssignmentIsSelecting()));
    }

    private _closeSendTask(): void {
        this.showSendTask = false;
        this._store.dispatch(new ProjectTaskActions.Initialize.Sending());
    }

    private _closeAssignTask(): void {
        this.showAssignTask = false;
        this._store.dispatch(new ProjectTaskActions.Initialize.Assignment());
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setCreatePermission(permission: boolean): void {
        this.hasCreatePermission = permission;
    }

    private _setAssignPermission(permission: boolean): void {
        this.hasAssignPermission = permission;
    }

    private _setSendPermission(permission: boolean): void {
        this.hasSendPermission = permission;
    }

    private _handleCloseAll(): void {
        this._closeAllCaptures();
        this._closeAllDrawers();
    }

    private _closeAllCaptures(): void {
        this._closeSendTask();
        this._closeAssignTask();
        this.showCreateTask = false;
    }

    private _closeAllDrawers(): void {
        this._drawerService.close();
        this._resetQuickFilterDrawerStatus();
        this._resetFilterDrawerStatus();
    }

    private _setBadgeVisibility(hasFilters: boolean): void {
        this.hasFilters = hasFilters;
    }

    private _resetFilterDrawerStatus(): void {
        this.isFilterDrawerOpened = false;
        this.filterIconBadgeStrokeColor = COLORS.white;
    }

    private _resetQuickFilterDrawerStatus(): void {
        this.isQuickFilterDrawerOpened = false;
    }

    private _setDropdownOptionsVisibility(): void {
        this.isXsOrSmResolution = this._breakpointHelper.isCurrentBreakpoint(BREAKPOINTS_RANGE.xs) ||
            this._breakpointHelper.isCurrentBreakpoint(BREAKPOINTS_RANGE.sm);
    }

    private _handleExternalTaskAssignmentIsSelecting(): void {
        this.showAssignTask = true;
        this.showCreateTask = false;
        this._closeSendTask();
        this._closeAllDrawers();
    }

    private _scrollToTop(): void {
        window.scroll({
            top: 0,
            behavior: 'smooth',
        });
    }

}
