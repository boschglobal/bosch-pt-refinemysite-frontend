/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {
    BehaviorSubject,
    ReplaySubject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_WORK_DAYS} from '../../../../test/mocks/workdays';
import {ActivatedRouteStub} from '../../../../test/stubs/activated-route.stub';
import {NOT_AUTHORISED_ROUTE} from '../../../app.routes';
import {WeekDaysEnum} from '../../../shared/misc/enums/weekDays.enum';
import {CalendarActions} from '../../project-common/store/calendar/calendar/calendar.actions';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarSelectionActions} from '../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {ProjectCraftActions} from '../../project-common/store/crafts/project-craft.actions';
import {DayCardActions} from '../../project-common/store/day-cards/day-card.actions';
import {MetricsActions} from '../../project-common/store/metrics/metrics.actions';
import {MilestoneActions} from '../../project-common/store/milestones/milestone.actions';
import {ProjectParticipantActions} from '../../project-common/store/participants/project-participant.actions';
import {ProjectImportActions} from '../../project-common/store/project-import/project-import.actions';
import {ProjectActions} from '../../project-common/store/projects/project.actions';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';
import {QuickFilterActions} from '../../project-common/store/quick-filters/quick-filter.actions';
import {RelationActions} from '../../project-common/store/relations/relation.actions';
import {TaskScheduleActions} from '../../project-common/store/task-schedules/task-schedule.actions';
import {ProjectTaskActions} from '../../project-common/store/tasks/task.actions';
import {WorkDaysActions} from '../../project-common/store/work-days/work-days.actions';
import {WorkDaysQueries} from '../../project-common/store/work-days/work-days.queries';
import {WorkareaActions} from '../../project-common/store/workareas/workarea.actions';
import {CurrentProjectResolverGuard} from './project-resolver.guard';

describe('CurrentProjectResolverGuard', () => {
    let guard: CurrentProjectResolverGuard;
    let actions: ReplaySubject<any>;
    let router: Router;
    let store: jasmine.SpyObj<Store>;

    const projectId = '123';
    const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();
    activatedRoute.testParamMap = {projectId};
    const activatedRouteSnapshotMock: ActivatedRouteSnapshot = activatedRoute.snapshot as ActivatedRouteSnapshot;

    const mockProjectSliceService: ProjectSliceService = mock(ProjectSliceService);
    const mockRouter: Router = mock(Router);
    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);

    const workDaysStartOfWeekBehaviourSubject = new BehaviorSubject<WeekDaysEnum>(MOCK_WORK_DAYS.startOfWeek);
    const resetActions: { actionDescription: string; expectedResult: Action }[] = [
        {
            actionDescription: 'project slice',
            expectedResult: new ProjectActions.Initialize.Project(),
        },
        {
            actionDescription: 'participants slice',
            expectedResult: new ProjectParticipantActions.Initialize.All(),
        },
        {
            actionDescription: 'tasks slice',
            expectedResult: new ProjectTaskActions.Initialize.All(),
        },
        {
            actionDescription: 'crafts slice',
            expectedResult: new ProjectCraftActions.Initialize.List(),
        },
        {
            actionDescription: 'workareas slice',
            expectedResult: new WorkareaActions.Initialize.All(),
        },
        {
            actionDescription: 'metrics slice',
            expectedResult: new MetricsActions.Initialize.Metrics(),
        },
        {
            actionDescription: 'task schedule slice',
            expectedResult: new TaskScheduleActions.Initialize.All(),
        },
        {
            actionDescription: 'day cards slice',
            expectedResult: new DayCardActions.Initialize.All(),
        },
        {
            actionDescription: 'milestone slice',
            expectedResult: new MilestoneActions.Initialize.All(),
        },
        {
            actionDescription: 'relation slice',
            expectedResult: new RelationActions.Initialize.All(),
        },
        {
            actionDescription: 'project import slice',
            expectedResult: new ProjectImportActions.Initialize.All(),
        },
        {
            actionDescription: 'work days slice',
            expectedResult: new WorkDaysActions.Initialize.All(),
        },
        {
            actionDescription: 'quick filter slice',
            expectedResult: new QuickFilterActions.Initialize.All(),
        },
        {
            actionDescription: 'calendar slice',
            expectedResult: new CalendarActions.Initialize.All(),
        },
        {
            actionDescription: 'calendar selection slice',
            expectedResult: new CalendarSelectionActions.Initialize.All(),
        },
        {
            actionDescription: 'calendar scope slice',
            expectedResult: new CalendarScopeActions.Initialize.All(),
        },
    ];

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useFactory: () => instance(mockProjectSliceService),
            },
            {
                provide: Router,
                useFactory: () => instance(mockRouter),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: WorkDaysQueries,
                useValue: instance(workDaysQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(CurrentProjectResolverGuard);
        router = TestBed.inject(Router);
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        actions = new ReplaySubject(1);

        when(workDaysQueriesMock.observeStartOfWeek()).thenReturn(workDaysStartOfWeekBehaviourSubject);
    });

    it('should allow navigation when project is in cache', waitForAsync(() => {
        when(mockProjectSliceService.hasProjectById(projectId)).thenReturn(true);

        guard.canActivate(activatedRouteSnapshotMock)
            .subscribe(result => {
                expect(result).toBeTruthy();
            });
    }));

    it('should wait for request of current project and allow navigation if project was fetched successfully', waitForAsync(() => {
        when(mockProjectSliceService.hasProjectById(projectId)).thenReturn(false);

        actions.next(new ProjectActions.Request.CurrentProjectFulfilled(null));

        guard.canActivate(activatedRouteSnapshotMock)
            .subscribe(result => {
                expect(result).toBeTruthy();
            });
    }));

    it('should wait for request of current project and not allow navigation if project was not fetched successfully', waitForAsync(() => {
        when(mockProjectSliceService.hasProjectById(projectId)).thenReturn(false);

        actions.next(new ProjectActions.Request.CurrentProjectRejected());

        guard.canActivate(activatedRouteSnapshotMock)
            .subscribe(result => {
                expect(result).toBeFalsy();
            });
    }));

    it('should redirect to Unauthorized Page when navigation is not allowed', waitForAsync(() => {
        spyOn(router, 'navigate');

        when(mockProjectSliceService.hasProjectById(projectId)).thenReturn(false);

        actions.next(new ProjectActions.Request.CurrentProjectRejected());

        guard.canActivate(activatedRouteSnapshotMock)
            .subscribe(() => {
                expect(router.navigate).toHaveBeenCalledWith([`/${NOT_AUTHORISED_ROUTE}`]);
            });

    }));

    it('should dispatch action to request project working days on canActivate call', () => {
        const expectedAction = new WorkDaysActions.Request.One();

        when(mockProjectSliceService.hasProjectById(projectId)).thenReturn(true);

        guard.canActivate(activatedRouteSnapshotMock).subscribe(() => expect(store.dispatch).toHaveBeenCalledWith(expectedAction));
    });

    describe('Initialize/reset all store actions', () => {

        resetActions.forEach(({actionDescription, expectedResult}) =>
            it(`should initialize/reset ${actionDescription}`, () => {
                expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
            })
        );

    });

});
