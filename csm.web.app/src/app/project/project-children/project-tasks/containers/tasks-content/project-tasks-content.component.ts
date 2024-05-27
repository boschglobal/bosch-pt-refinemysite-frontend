/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {NewsResource} from '../../../../project-common/api/news/resources/news.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {Task} from '../../../../project-common/models/tasks/task';
import {NewsQueries} from '../../../../project-common/store/news/news.queries';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkareaActions} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ProjectTaskContentModel} from './project-tasks-content.model';

@Component({
    selector: 'ss-project-tasks-content',
    templateUrl: './project-tasks-content.component.html',
    styleUrls: ['./project-tasks-content.component.scss'],
})
export class ProjectTasksContentComponent implements OnInit, OnDestroy {
    /**
     * @description Property injected to table component to allow selection of tasks
     * @type {boolean}
     */
    @Input()
    public isSelecting: boolean;

    /**
     * @description Property injected to table component as records
     * @type {ProjectTaskContentModel[]}
     */
    public tasks: ProjectTaskContentModel[] = [];

    /**
     * @description Sets type of selectable task
     * @type {boolean}
     */
    public isRowSelectable: Function = (): boolean => true;

    /**
     * @description Property that holds selected rows
     */
    public selectedRows: string[];

    /**
     * @description Property injected to table component as current sort
     * @type {SorterData}
     */
    public sort: SorterData;

    /**
     * @description Property injected to loader, table and collapsible list component to handle loadings
     * @type {boolean}
     */
    public isLoading = false;

    private _pageInitialized: boolean;

    /**
     * @description Property that is true if there are filters applied to the list
     * @type {boolean}
     */
    private _hasFiltersApplied = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _newsSubscription: Subscription;

    private _selectingType: 'assign' | 'send';

    private _workareas: WorkareaResource[] = [];

    constructor(private _newsQueries: NewsQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>,
                private _router: Router,
                private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._requestTasks();
        this._requestWorkAreas();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Event triggered when child component changes sort status
     * @description Dispatch action with sort information
     * @param {SorterData} sorterData
     */
    public onSortTable(sorterData: SorterData): void {
        this._store.dispatch(new ProjectTaskActions.Set.Sort(sorterData));
    }

    /**
     * @description Event triggered when child component changes sort status
     * @description Route to task detail
     * @param {Task} task
     */
    public onClickTask(task: Task): void {
        if (this.isSelecting) {
            return;
        }
        this._router.navigate([`${ProjectUrlRetriever.getProjectTaskDetailUrl(task.project.id, task.id)}/`, {
            outlets: {
                'task-detail': 'information',
                'task-workflow': 'topics',
            },
        }]);
    }

    /**
     * @description Triggered when selected tasks change in table or list
     * @param {string[]} taskIds
     */
    public onSelectionChange(taskIds: string[]): void {
        switch (this._selectingType) {
            case 'assign':
                this._store.dispatch(new ProjectTaskActions.Set.AssignIds(taskIds));
                break;
            case 'send':
                this._store.dispatch(new ProjectTaskActions.Set.SendIds(taskIds));
                break;
            default:
                break;
        }
    }

    /**
     * @description Getter to has no tasks
     * @returns {boolean}
     */
    public get hasNoTasks(): boolean {
        return !this.isLoading && !this.tasks.length && this._pageInitialized;
    }

    public get showFilterAlert(): boolean {
        return !this.hasNoTasks && (this._hasFiltersApplied && this.tasks.length > 0);
    }

    /**
     * @description Getter to no items title
     * @returns {string}
     */
    public get noItemsTitle(): string {
        return this._hasFiltersApplied ? 'Project_Filter_NoTasksTitle' : 'Tasks_NoRecords_Title';
    }

    /**
     * @description Getter to no items description
     * @returns {string}
     */
    public get noItemsDescription(): string {
        return this._hasFiltersApplied ? null : 'Tasks_NoRecords_Description';
    }

    /**
     * @description Getter to no items button message
     * @returns {string}
     */
    public get noItemsButton(): string {
        return this._hasFiltersApplied ? 'Generic_ClearFilters' : null;
    }

    /**
     * @description Getter to enable/disable no items button
     * @returns {boolean}
     */
    public get noItemsShowButton(): boolean {
        return this._hasFiltersApplied;
    }

    /**
     * @description Clear filter when button is clicked
     */
    public handleResetFilters(): void {
        const filters = new ProjectTaskFilters();
        this._store.dispatch(new ProjectTaskActions.Set.Filters(filters));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(combineLatest([
            this._projectTaskQueries.observeCurrentTaskPage(),
            this._workareaQueries.observeWorkareas()]
        ).subscribe(([tasks, workAreas]: [Task[], WorkareaResource[]]) => {
            this._setWorkareas(workAreas);
            this._parseTasks(tasks);
            this._subscribeToNews(tasks);
        })
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCurrentTaskPageInitialized()
                .subscribe(this._handlePageInitialized.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeTaskListRequestStatus()
                .subscribe(this._handleLoading.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeTaskListSort()
                .subscribe(this._handleSortStateChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeTaskAssignList()
                .subscribe(this._handleTaskAssignListChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeTaskSendList()
                .subscribe(this._handleTaskSendListChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.hasTaskListFiltersApplied()
                .subscribe(this._handleHasFilters.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handlePageInitialized(pageInitialized: boolean): void {
        this._pageInitialized = pageInitialized;
    }

    private _parseTasks(tasks: Task[]): void {
        this.tasks = tasks.map(task => ({
            ...ProjectTaskContentModel.fromTaskAndWorkAreaResource(task, this._getWorkAreaResource(task.workArea)),
        }));
    }

    private _subscribeToNews(tasks: Task[]): void {
        if (typeof this._newsSubscription !== 'undefined') {
            this._newsSubscription.unsubscribe();
        }

        const identifiers: ObjectIdentifierPair[] = tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));

        this._newsSubscription = this._newsQueries
            .observeItemsByIdentifierPair(identifiers)
            .subscribe((news) => {
                this.tasks = this.tasks.map(task => ({
                    ...task,
                    isNew: news.some((item: NewsResource) => item.context.id === task.id),
                }));
            });
    }

    private _handleLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _handleSortStateChange(sorterData: SorterData): void {
        this.sort = sorterData;
    }

    private _handleTaskAssignListChange(selectionList: AbstractSelectionList): void {
        this._updateSelectionList(selectionList);
        if (selectionList.isSelecting) {
            this._selectingType = 'assign';
            this.isRowSelectable = (row: any) => row.assignPermission;
        }
    }

    private _handleTaskSendListChange(selectionList: AbstractSelectionList): void {
        this._updateSelectionList(selectionList);
        if (selectionList.isSelecting) {
            this._selectingType = 'send';
            this.isRowSelectable = (row: any) => row.sendPermission && row.company.assigned;
        }
    }

    private _updateSelectionList(selectionList: AbstractSelectionList): void {
        const {isSelecting, ids} = selectionList;
        this.isSelecting = isSelecting;
        this.selectedRows = ids;
    }

    private _requestTasks(): void {
        this._store.dispatch(new ProjectTaskActions.Request.All());
    }

    private _handleHasFilters(visible: boolean): void {
        this._hasFiltersApplied = visible;
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _getWorkAreaResource(workArea: ResourceReference): WorkareaResource {
        return this._workareas.find(eaWorkArea => eaWorkArea.id === workArea?.id);
    }

    private _setWorkareas(workareas: WorkareaResource[]): void {
        this._workareas = workareas;
    }
}
