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
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {sum} from 'lodash';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {
    filter,
    map,
    pairwise
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../../../shared/ui/constants/breakpoints.constant';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {MultipleSelectionToolbarData} from '../../../../shared/ui/group-list-selection/group-list-selection.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {MultipleSelectionToolbarConfirmationModeEnum} from '../../../../shared/ui/multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {SaveRelationResource} from '../../api/relations/resources/save-relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {TaskSortHelper} from '../../helpers/task-sort.helper';
import {Milestone} from '../../models/milestones/milestone';
import {RelationWithResource} from '../../models/relation-with-resource/relation-with-resource';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';
import {RelationActions} from '../../store/relations/relation.actions';
import {RelationQueries} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export interface MilestoneTask {
    id: string;
    task: Task;
    actions: MenuItemsList[];
}

export const DELETE_TASK_RELATION_ITEM_ID = 'delete-task-relation';

@Component({
    selector: 'ss-milestone-task-relation-list',
    templateUrl: './milestone-task-relation-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneTaskRelationListComponent implements OnInit, OnDestroy {

    @Input()
    public set milestone(milestone: Milestone) {
        this._milestone = milestone;

        this._setCanUpdateMilestoneTasks(milestone);
        this._setCanShowAddButton();
        this._setCanShowMilestoneTaskRelationList();
    }

    public canShowAddButton: boolean;

    public canShowMilestoneTaskRelationList: boolean;

    public groups: GroupItem<MilestoneTask>[] = [];

    public isLoading: boolean;

    public itemsPerGroupItem = 3;

    public multipleSelectionToolbarData: MultipleSelectionToolbarData = null;

    private _canUpdateMilestoneTasks: boolean;

    private _disposableSubscriptions = new Subscription();

    private _isSubmitting: boolean;

    private _isXsScreen: boolean;

    private _milestone: Milestone;

    private _milestoneSubTaskRelationGroupId = 'ss-milestone-subTask-relation-groupId';

    private _multipleSelectionEnabled = false;

    private _selectedTaskIds: string[] = [];

    constructor(private _breakpointHelper: BreakpointHelper,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _relationQueries: RelationQueries,
                private _store: Store,
                private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestMilestoneSubtaskRelations();
        this._handleBreakpointChange();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleActionClicked({value: {id, version}}: MenuItem<RelationWithResource<Task>>): void {
        this._store.dispatch(new RelationActions.Delete.One(id, version, 'MilestoneTaskRelation_DeleteOne_SuccessMessage'));
    }

    public handleAddTask(): void {
        this._store.dispatch(new CalendarSelectionActions.Set.Selection(true, CalendarSelectionContextEnum.TasksOfMilestones, []));
        this._setMultipleSelectionToolbarData();
    }

    public handleTaskCardClicked(task: Task): void {
        this._store.dispatch(
            new CalendarScopeActions.Resolve.NavigateToElement(
                new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)
            )
        );
    }

    private _requestMilestoneSubtaskRelations(): void {
        const payload = SaveRelationFilters.forMilestoneSubtasksByMilestoneId(this._milestone.id);
        this._store.dispatch(new RelationActions.Request.All(payload, true));
    }

    private _handleDismissSelection(): void {
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
        this._unsetMultipleSelectionToolbarData();
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting && requestStatus !== RequestStatusEnum.progress) {
            this._isSubmitting = false;
        }

        this._setLoading(requestStatus);
        this._changeDetectorRef.detectChanges();
    }

    private _handleSubmitSelection(): void {
        const payload = this._selectedTaskIds.map(taskId => SaveRelationResource.forMilestoneSubtask(this._milestone.id, taskId));

        this._store.dispatch(new RelationActions.Create.All(payload, 'MilestoneTaskRelation_CreateAll_SuccessMessage'));
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());

        this._isSubmitting = true;
        this._unsetMultipleSelectionToolbarData();
    }

    private _handleTasks(taskRelations: RelationWithResource<Task>[]): void {
        this._setGroupsFromTasks(taskRelations);

        this._changeDetectorRef.detectChanges();
    }

    private _handleRelations(relations: RelationResource[]): void {
        this._setGroupsFromRelations(relations);
        this._setCanShowMilestoneTaskRelationList();

        this._changeDetectorRef.detectChanges();
    }

    private _handleBreakpointChange(): void {
        this._setIsXsScreen();
        this._setCanShowAddButton();

        this._changeDetectorRef.detectChanges();
    }

    private _handleTaskSelectionList(taskIds: string[]): void {
        this._selectedTaskIds = taskIds;
        this._setMultipleSelectionToolbarData(this._selectedTaskIds.length);
    }

    private _setCanShowAddButton(): void {
        this.canShowAddButton = this._canUpdateMilestoneTasks && !this._isXsScreen;
    }

    private _setCanShowMilestoneTaskRelationList(): void {
        const numberOfTasks = sum(this.groups.map(group => group.items.length));

        this.canShowMilestoneTaskRelationList = this._canUpdateMilestoneTasks || numberOfTasks > 0;
    }

    private _setCanUpdateMilestoneTasks(milestone: Milestone): void {
        this._canUpdateMilestoneTasks = milestone?.permissions.canUpdate;
    }

    private _setGroupsFromTasks(taskRelations: RelationWithResource<Task>[]): void {
        this.groups = [{
            id: this._milestoneSubTaskRelationGroupId,
            items: taskRelations.map(relation => {
                const {permissions, resource} = relation;
                const actions: MenuItemsList[] = permissions.canDelete ? [{
                    items: [{
                        id: DELETE_TASK_RELATION_ITEM_ID,
                        type: 'button',
                        label: 'MilestoneTaskRelation_Delete_Label',
                        value: relation,
                    }],
                }] : [];

                return {
                    actions,
                    id: resource.id,
                    task: resource,
                };
            }),
        }];
    }

    private _setGroupsFromRelations(relations: RelationResource[]): void {
        this.groups = [{
            id: this._milestoneSubTaskRelationGroupId,
            items: relations.map(relation => ({
                id: relation.id,
                task: null,
                actions: [],
            })),
        }];
    }

    private _setIsXsScreen(): void {
        this._isXsScreen = this._breakpointHelper.isCurrentBreakpoint(breakpointsRange.xs);
    }

    private _setLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = this._isSubmitting && requestStatus === RequestStatusEnum.progress;
    }

    private _setMultipleSelectionToolbarData(itemsCount = 0): void {
        this.multipleSelectionToolbarData = {
            itemsCount,
            emptyItemsLabel: 'MilestoneTaskRelation_MultipleSelectionToolbar_EmptyItemsLabel',
            selectedItemLabel: 'MilestoneTaskRelation_MultipleSelectionToolbar_SelectedItemLabel',
            selectedItemsLabel: 'MilestoneTaskRelation_MultipleSelectionToolbar_SelectedItemsLabel',
            mode: MultipleSelectionToolbarConfirmationModeEnum.Add,
            submitSelection: () => this._handleSubmitSelection(),
            dismissSelection: () => this._handleDismissSelection(),
        };

        this._multipleSelectionEnabled = true;

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this._handleBreakpointChange()));

        this._disposableSubscriptions.add(
            this._relationQueries.observePartOfRelationsByMilestoneId(this._milestone.id)
                .subscribe(relations => this._handleRelations(relations)));

        this._disposableSubscriptions.add(
            combineLatest([
                this._workareaQueries.observeWorkareas(),
                this._relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(this._milestone.id),
            ])
                .pipe(
                    map(([workAreas, tasks]) => this._sortTaskCards(tasks, workAreas)))
                .subscribe((tasks: RelationWithResource<Task>[]) => this._handleTasks(tasks)));

        this._disposableSubscriptions.add(
            this._relationQueries.observePartOfRelationsRequestStatus()
                .subscribe(status => this._handleRequestStatus(status)));

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task)
                .pipe(
                    filter(() => this._multipleSelectionEnabled),
                )
                .subscribe(taskIds => this._handleTaskSelectionList(taskIds)));

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.TasksOfMilestones)
                .pipe(
                    pairwise(),
                    filter(([prev, curr]) => prev && !curr)
                )
                .subscribe(() => this._unsetMultipleSelectionToolbarData()));
    }

    private _sortTaskCards(tasksRelation: RelationWithResource<Task>[], workareas: WorkareaResource[]): RelationWithResource<Task>[] {
        const tasks = tasksRelation.map(taskRelation => taskRelation.resource);
        const sortedTasks = TaskSortHelper.sortForRelationList(tasks, workareas);

        return sortedTasks.map(task => tasksRelation.find(taskRelation => taskRelation.resource.id === task.id));
    }

    private _unsetMultipleSelectionToolbarData(): void {
        this.multipleSelectionToolbarData = null;
        this._multipleSelectionEnabled = false;

        this._changeDetectorRef.detectChanges();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
