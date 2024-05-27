/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router
} from '@angular/router';
import {
    Actions,
    ofType
} from '@ngrx/effects';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    combineLatest,
    Observable,
    of
} from 'rxjs';
import {
    map,
    take,
    tap
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {ProtectAccessGuard} from '../../../shared/misc/guard/protect-access.guard';
import {CalendarActions} from '../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarSelectionActions} from '../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {ProjectCraftActions} from '../../project-common/store/crafts/project-craft.actions';
import {DayCardActions} from '../../project-common/store/day-cards/day-card.actions';
import {MetricsActions} from '../../project-common/store/metrics/metrics.actions';
import {MilestoneActions} from '../../project-common/store/milestones/milestone.actions';
import {ProjectParticipantActions} from '../../project-common/store/participants/project-participant.actions';
import {ProjectImportActions} from '../../project-common/store/project-import/project-import.actions';
import {
    ProjectActions,
    REQUEST_CURRENT_PROJECT_FULFILLED,
    REQUEST_CURRENT_PROJECT_REJECTED
} from '../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';
import {QuickFilterActions} from '../../project-common/store/quick-filters/quick-filter.actions';
import {RelationActions} from '../../project-common/store/relations/relation.actions';
import {TaskScheduleActions} from '../../project-common/store/task-schedules/task-schedule.actions';
import {ProjectTaskActions} from '../../project-common/store/tasks/task.actions';
import {WorkDaysActions} from '../../project-common/store/work-days/work-days.actions';
import {WorkDaysQueries} from '../../project-common/store/work-days/work-days.queries';
import {WorkareaActions} from '../../project-common/store/workareas/workarea.actions';
import {ROUTE_PARAM_PROJECT_ID} from '../project-route.paths';

@Injectable({
    providedIn: 'root',
})
export class CurrentProjectResolverGuard extends ProtectAccessGuard implements CanActivate {

    constructor(private _actions: Actions,
                private _projectSliceService: ProjectSliceService,
                private _router: Router,
                private _store: Store<State>,
                private _workingDaysQueries: WorkDaysQueries) {
        super(_router);
    }

    public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const currentProjectId: string = route.paramMap.get(ROUTE_PARAM_PROJECT_ID);

        this._store.dispatch(new ProjectActions.Initialize.Project());
        this._store.dispatch(new QuickFilterActions.Initialize.All());
        this._store.dispatch(new CalendarActions.Initialize.All());
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
        this._store.dispatch(new CalendarScopeActions.Initialize.All());
        this._store.dispatch(new ProjectParticipantActions.Initialize.All());
        this._store.dispatch(new ProjectTaskActions.Initialize.All());
        this._store.dispatch(new TaskScheduleActions.Initialize.All());
        this._store.dispatch(new DayCardActions.Initialize.All());
        this._store.dispatch(new ProjectCraftActions.Initialize.List());
        this._store.dispatch(new WorkareaActions.Initialize.All());
        this._store.dispatch(new MetricsActions.Initialize.Metrics());
        this._store.dispatch(new MilestoneActions.Initialize.All());
        this._store.dispatch(new RelationActions.Initialize.All());
        this._store.dispatch(new ProjectImportActions.Initialize.All());
        this._store.dispatch(new WorkDaysActions.Initialize.All());

        this._store.dispatch(new ProjectActions.SetCurrentProject(currentProjectId));
        this._store.dispatch(new WorkDaysActions.Request.One());

        return combineLatest([
            this._observeProject(currentProjectId),
            this._workingDaysQueries.observeStartOfWeek(),
        ]).pipe(
            map(([hasProject]) => hasProject),
            tap(hasProject => {
                if (!hasProject) {
                    this._handleUnauthorized();
                }
            })
        );
    }

    private _observeProject(projectId: string): Observable<boolean> {
        return this._projectSliceService.hasProjectById(projectId)
            ? of(true)
            : this._actions.pipe(
                ofType(REQUEST_CURRENT_PROJECT_FULFILLED, REQUEST_CURRENT_PROJECT_REJECTED),
                take(1),
                map((action: Action) => action.type === REQUEST_CURRENT_PROJECT_FULFILLED)
            );
    }
}
