/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType,
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    flatten,
    isEqual,
} from 'lodash';
import {
    combineLatest,
    Observable,
    of,
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import {QuickFilterService} from '../../api/quick-filters/quick-filter.service';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {
    QuickFilter,
    QuickFilterId,
} from '../../models/quick-filters/quick-filter';
import {MilestoneActions} from '../milestones/milestone.actions';
import {MilestoneQueries} from '../milestones/milestone.queries';
import {MilestoneFilters} from '../milestones/slice/milestone-filters';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectTaskFilters} from '../tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../tasks/task.actions';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {
    QuickFilterActionEnum,
    QuickFilterActions,
} from './quick-filter.actions';
import {QuickFilterQueries} from './quick-filter.queries';
import {
    QuickFilterAppliedFilters,
    QuickFilterContext,
} from './quick-filter.slice';

type ActionsByContext = {
    [key in QuickFilterContext]: (taskFilters: ProjectTaskFilters,
                                  milestoneFilters: MilestoneFilters,
                                  filterId: QuickFilterId) => Action[]
};

@Injectable()
export class QuickFilterEffects {

    private readonly _actionsByContext: ActionsByContext = {
        list: (taskFilters, milestoneFilters, filterId) => [
            new ProjectTaskActions.Set.Filters(taskFilters),
            new QuickFilterActions.Set.AppliedFilter(filterId, 'list'),
        ],
        calendar: (taskFilters, milestoneFilters, filterId) => [
            new ProjectTaskActions.Set.CalendarFilters(taskFilters),
            new MilestoneActions.Set.Filters(milestoneFilters),
            new QuickFilterActions.Set.AppliedFilter(filterId, 'calendar'),
        ],
    };

    constructor(private _actions$: Actions,
                private _milestoneQueries: MilestoneQueries,
                private _projectSliceService: ProjectSliceService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _quickFilterQueries: QuickFilterQueries,
                private _quickFilterService: QuickFilterService) {
    }

    /**
     * @description Request all quick filters interceptor
     * @type {Observable<Action>}
     */
    public requestAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(QuickFilterActionEnum.RequestAll),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            switchMap(([, projectId]) =>
                this._quickFilterService
                    .findAll(projectId)
                    .pipe(
                        map(quickFilterList => new QuickFilterActions.Request.AllFulfilled(quickFilterList)),
                        catchError(() => of(new QuickFilterActions.Request.AllRejected())))
            )));

    /**
     * @description Create quick filter interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(QuickFilterActionEnum.CreateOne),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([{item, context}, projectId]: [QuickFilterActions.Create.One, string]) =>
                this._quickFilterService
                    .create(projectId, item)
                    .pipe(
                        switchMap((quickFilterResource: QuickFilterResource) => {
                            const quickFilter = QuickFilter.fromQuickFilterResource(quickFilterResource);
                            const taskFilters = this._getProjectTaskFiltersFromQuickFilter(quickFilter);
                            const milestoneFilters = this._getMilestoneFiltersFromQuickFilter(quickFilter);

                            return [
                                new QuickFilterActions.Create.OneFulfilled(quickFilterResource),
                                ...this._actionsByContext[context](taskFilters, milestoneFilters, quickFilter.id),
                            ];
                        }),
                        catchError(() => of(new QuickFilterActions.Create.OneRejected())))
            )));

    /**
     * @description Delete quick filter interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(QuickFilterActionEnum.DeleteOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
                this._quickFilterQueries.observeAppliedFilters(),
            ),
            mergeMap(([{itemId, version}, projectId, appliedFilters]:
                          [QuickFilterActions.Delete.One, string, QuickFilterAppliedFilters]) => {
                const contexts: QuickFilterId[] = Object.keys(appliedFilters).filter(key => appliedFilters[key] === itemId);

                return this._quickFilterService
                    .delete(projectId, itemId, version)
                    .pipe(
                        switchMap(() => {
                            const taskFilters = new ProjectTaskFilters();
                            const milestoneFilters = new MilestoneFilters();

                            return [
                                new QuickFilterActions.Delete.OneFulfilled(itemId),
                                ...flatten(contexts.map(context =>
                                    this._actionsByContext[context](taskFilters, milestoneFilters, 'all'))),
                            ];
                        }),
                        catchError(() => of(new QuickFilterActions.Delete.OneRejected())));
            })));

    /**
     * @description Update quick filter interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(QuickFilterActionEnum.UpdateOne),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
                this._quickFilterQueries.observeAppliedFilters(),
            ),
            mergeMap(([{itemId, item, version}, projectId, appliedFilters]:
                          [QuickFilterActions.Update.One, string, QuickFilterAppliedFilters]) => {
                const contexts: QuickFilterId[] = Object.keys(appliedFilters).filter(key => appliedFilters[key] === itemId);

                return this._quickFilterService
                    .update(projectId, itemId, item, version)
                    .pipe(
                        switchMap((quickFilterResource: QuickFilterResource) => {
                            const quickFilter = QuickFilter.fromQuickFilterResource(quickFilterResource);
                            const taskFilters = this._getProjectTaskFiltersFromQuickFilter(quickFilter);
                            const milestoneFilters = this._getMilestoneFiltersFromQuickFilter(quickFilter);

                            return [
                                new QuickFilterActions.Update.OneFulfilled(quickFilterResource),
                                ...flatten(contexts.map(context =>
                                    this._actionsByContext[context](taskFilters, milestoneFilters, quickFilter.id))),
                            ];
                        }),
                        catchError(() => of(new QuickFilterActions.Update.OneRejected())));
            })));

    /**
     * @description Reset the current applied filter id for calendar context when the filters change
     * @type {Observable<Action>}
     */
    public resetCalendarAppliedFilterId$: Observable<Action> = createEffect(() =>
        combineLatest([
            this._projectTaskQueries.observeCalendarFilters(),
            this._milestoneQueries.observeFilters(),
        ]).pipe(
            switchMap(([taskFilters, milestoneFilters]: [ProjectTaskFilters, MilestoneFilters]) => {
                const isTaskFilterEmpty = isEqual(taskFilters, new ProjectTaskFilters());
                const isMilestoneFilterEmpty = isEqual(milestoneFilters, new MilestoneFilters());
                const isFilterEmpty = isTaskFilterEmpty && isMilestoneFilterEmpty;

                return of(new QuickFilterActions.Set.AppliedFilter(isFilterEmpty ? 'all' : null, 'calendar'));
            }),
        )
    );

    /**
     * @description Reset the current applied filter id for task list context when the filters change
     * @type {Observable<Action>}
     */
    public resetListAppliedFilterId$: Observable<Action> = createEffect(() =>
        this._projectTaskQueries.observeTaskListFilters()
            .pipe(
                switchMap((taskFilters: ProjectTaskFilters) => {
                    const isTaskFilterEmpty = isEqual(taskFilters, new ProjectTaskFilters());

                    return of(new QuickFilterActions.Set.AppliedFilter(isTaskFilterEmpty ? 'all' : null, 'list'));
                }),
            )
    );

    private _getProjectTaskFiltersFromQuickFilter(quickFilter: QuickFilter): ProjectTaskFilters {
        const {highlight, useTaskCriteria, criteria: {tasks}} = quickFilter;

        return new ProjectTaskFilters(tasks, useTaskCriteria, highlight);
    }

    private _getMilestoneFiltersFromQuickFilter(quickFilter: QuickFilter): MilestoneFilters {
        const {highlight, useMilestoneCriteria, criteria: {milestones}} = quickFilter;

        return new MilestoneFilters(milestones, useMilestoneCriteria, highlight);
    }
}
