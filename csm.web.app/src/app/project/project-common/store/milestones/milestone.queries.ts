/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {
    isEqual,
    orderBy,
} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    withLatestFrom,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListLinks} from '../../api/milestones/resources/milestone-list.resource';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneSlice} from './milestone.slice';
import {MilestoneFilters} from './slice/milestone-filters';
import {MilestoneFiltersCriteria} from './slice/milestone-filters-criteria';

@Injectable({
    providedIn: 'root',
})
export class MilestoneQueries extends BaseQueries<MilestoneResource, MilestoneSlice, MilestoneListLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'milestoneSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeFilters(): Observable<MilestoneFilters> {
        return this._store
            .pipe(
                select(this._getFilters()),
                distinctUntilChanged(MilestoneFilters.isEqual));
    }

    public observeHasFiltersApplied(): Observable<boolean> {
        return this._store.pipe(
            select(this._getFilters()),
            map(filters => this._hasFiltersApplied(filters.criteria) || !filters.useCriteria),
        );
    }

    public observeMilestoneById(itemId: string): Observable<Milestone> {
        return this._store
            .pipe(
                select(this.getItemById(itemId)),
                distinctUntilChanged(isEqual),
                map(milestone => Milestone.fromMilestoneResource(milestone)),
            );
    }

    public observeMilestoneListByMilestoneFilters(): Observable<Milestone[]> {
        return this._store
            .pipe(
                select(this.getList()),
                distinctUntilChanged(isEqual),
                map((milestones: MilestoneResource[]) => milestones.map(milestone => Milestone.fromMilestoneResource(milestone))),
                withLatestFrom(
                    this.observeFilters()),
                map(([milestones, milestoneFilters]: [Milestone[], MilestoneFilters]) =>
                    this._filterMilestonesByMilestoneFilters(milestones, milestoneFilters)),
                map(milestones => orderBy(milestones, 'position', 'asc')));
    }

    public observeMilestoneListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged(),
            );
    }

    public observeCurrentMilestoneRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged(),
            );
    }

    private _getFilters(): (state: State) => MilestoneFilters {
        return (state: State) => this._getSlice(state).filters;
    }

    private _hasFiltersApplied(filters: MilestoneFiltersCriteria): boolean {
        return !isEqual(filters, new MilestoneFiltersCriteria());
    }

    private _filterMilestonesByMilestoneFilters(milestones: Milestone[], milestoneFilters: MilestoneFilters): Milestone[] {
        const {highlight, useCriteria} = milestoneFilters;
        const noResults = !useCriteria && !highlight;
        const filterApplied = !isEqual(milestoneFilters, new MilestoneFilters());
        const shouldFilterResults = filterApplied && !highlight;

        if (noResults) {
            return [];
        } else if (shouldFilterResults) {
            return milestones.filter(milestone => milestoneFilters.matchMilestone(milestone));
        } else {
            return milestones;
        }
    }
}
