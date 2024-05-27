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
    waitForAsync,
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {provideMockStore} from '@ngrx/store/testing';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    throwError,
} from 'rxjs';
import {take} from 'rxjs/operators';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {
    MOCK_QUICK_FILTER_LIST,
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_QUICK_FILTER_WITH_DATE_CRITERIA,
    MOCK_SAVE_QUICK_FILTER
} from '../../../../../test/mocks/quick-filters';
import {QuickFilterService} from '../../api/quick-filters/quick-filter.service';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {QuickFilterListResource} from '../../api/quick-filters/resources/quick-filter-list.resource';
import {QuickFilter} from '../../models/quick-filters/quick-filter';
import {MilestoneActions} from '../milestones/milestone.actions';
import {MilestoneQueries} from '../milestones/milestone.queries';
import {MilestoneFilters} from '../milestones/slice/milestone-filters';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectTaskFilters} from '../tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../tasks/task.actions';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {QuickFilterActions} from './quick-filter.actions';
import {QuickFilterEffects} from './quick-filter.effects';
import {QuickFilterQueries} from './quick-filter.queries';
import {QuickFilterAppliedFilters} from './quick-filter.slice';

describe('Quick Filter Effects', () => {
    let quickFiltersEffects: QuickFilterEffects;
    let actions: ReplaySubject<any>;
    let quickFilterService: any;

    const milestoneQueriesMock = mock(MilestoneQueries);
    const projectSliceServiceMock = mock(ProjectSliceService);
    const projectTaskQueriesMock = mock(ProjectTaskQueries);
    const quickFilterQueriesMock = mock(QuickFilterQueries);
    const projectId = MOCK_PROJECT_1.id;
    const emptyAppliedFilters: QuickFilterAppliedFilters = {
        list: null,
        calendar: null,
    };
    const emptyTaskFilters = new ProjectTaskFilters();
    const notEmptyTaskFilters = Object.assign(new ProjectTaskFilters(), {useCriteria: false});
    const emptyMilestoneFilters = new MilestoneFilters();
    const notEmptyMilestoneFilters = Object.assign(new MilestoneFilters(), {useCriteria: false});
    const appliedFiltersSubject = new BehaviorSubject<QuickFilterAppliedFilters>(emptyAppliedFilters);
    const calendarTaskFiltersSubject = new BehaviorSubject<ProjectTaskFilters>(emptyTaskFilters);
    const milestoneFiltersSubject = new BehaviorSubject<MilestoneFilters>(emptyMilestoneFilters);
    const taskFiltersSubject = new BehaviorSubject<ProjectTaskFilters>(emptyTaskFilters);

    const errorResponse: Observable<any> = throwError('error');
    const createQuickFilterResponse: Observable<QuickFilterResource> = of(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
    const updateQuickFilterResponse: Observable<QuickFilterResource> = of(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
    const deleteQuickFilterResponse: Observable<{}> = of({});
    const getQuickFilterListResponse: Observable<QuickFilterListResource> = of(MOCK_QUICK_FILTER_LIST);

    const getProjectTaskFiltersFromQuickFilter = (quickFilter: QuickFilter): ProjectTaskFilters => {
        const {highlight, useTaskCriteria, criteria: {tasks}} = quickFilter;

        return new ProjectTaskFilters(tasks, useTaskCriteria, highlight);
    };

    const getMilestoneFiltersFromQuickFilter = (quickFilter: QuickFilter): MilestoneFilters => {
        const {highlight, useMilestoneCriteria, criteria: {milestones}} = quickFilter;

        return new MilestoneFilters(milestones, useMilestoneCriteria, highlight);
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            QuickFilterEffects,
            provideMockStore({}),
            provideMockActions(() => actions),
            {
                provide: MilestoneQueries,
                useValue: instance(milestoneQueriesMock),
            },
            {
                provide: ProjectSliceService,
                useValue: instance(projectSliceServiceMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: QuickFilterQueries,
                useValue: instance(quickFilterQueriesMock),
            },
            {
                provide: QuickFilterService,
                useValue: jasmine.createSpyObj('QuickFilterService', ['create', 'delete', 'findAll', 'update']),
            },
        ],
    };

    when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));
    when(quickFilterQueriesMock.observeAppliedFilters()).thenReturn(appliedFiltersSubject);
    when(milestoneQueriesMock.observeFilters()).thenReturn(milestoneFiltersSubject);
    when(projectTaskQueriesMock.observeCalendarFilters()).thenReturn(calendarTaskFiltersSubject);
    when(projectTaskQueriesMock.observeTaskListFilters()).thenReturn(taskFiltersSubject);

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        quickFiltersEffects = TestBed.inject(QuickFilterEffects);
        quickFilterService = TestBed.inject(QuickFilterService);
        actions = new ReplaySubject(1);

        appliedFiltersSubject.next(emptyAppliedFilters);
        calendarTaskFiltersSubject.next(emptyTaskFilters);
        milestoneFiltersSubject.next(emptyMilestoneFilters);
        taskFiltersSubject.next(emptyTaskFilters);

        quickFilterService.findAll.calls.reset();
    });

    it('should trigger a QuickFilterActions.Request.AllFulfilled action after requesting quick filters successfully', () => {
        const expectedResult = new QuickFilterActions.Request.AllFulfilled(MOCK_QUICK_FILTER_LIST);

        quickFilterService.findAll.and.returnValue(getQuickFilterListResponse);
        actions.next(new QuickFilterActions.Request.All());
        quickFiltersEffects.requestAll$
            .pipe(take(1))
            .subscribe(result => {
                expect(quickFilterService.findAll).toHaveBeenCalledWith(projectId);
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger a QuickFilterActions.Request.AllRejected action after requesting quick filters has failed', () => {
        const expectedResult = new QuickFilterActions.Request.AllRejected();

        quickFilterService.findAll.and.returnValue(errorResponse);
        actions.next(new QuickFilterActions.Request.All());
        quickFiltersEffects.requestAll$
            .pipe(take(1))
            .subscribe(result => {
                expect(result).toEqual(expectedResult);
            });
    });

    it('should trigger the right actions after creating a quick filter successfully in the task list context', () => {
        const quickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
        const results: Action[] = [];
        const taskFilters = getProjectTaskFiltersFromQuickFilter(quickFilter);
        const expectedResults: Action[] = [
            new QuickFilterActions.Create.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
            new ProjectTaskActions.Set.Filters(taskFilters),
            new QuickFilterActions.Set.AppliedFilter(quickFilter.id, 'list'),
        ];

        quickFilterService.create.and.returnValue(createQuickFilterResponse);
        actions.next(new QuickFilterActions.Create.One(MOCK_SAVE_QUICK_FILTER, 'list'));
        quickFiltersEffects.create$
            .pipe(take(3))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after creating a quick filter successfully in the calendar context', () => {
        const quickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
        const results: Action[] = [];
        const taskFilters = getProjectTaskFiltersFromQuickFilter(quickFilter);
        const milestoneFilters = getMilestoneFiltersFromQuickFilter(quickFilter);
        const expectedResults: Action[] = [
            new QuickFilterActions.Create.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
            new ProjectTaskActions.Set.CalendarFilters(taskFilters),
            new MilestoneActions.Set.Filters(milestoneFilters),
            new QuickFilterActions.Set.AppliedFilter(quickFilter.id, 'calendar'),
        ];

        quickFilterService.create.and.returnValue(createQuickFilterResponse);
        actions.next(new QuickFilterActions.Create.One(MOCK_SAVE_QUICK_FILTER, 'calendar'));
        quickFiltersEffects.create$
            .pipe(take(4))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Create.OneRejected action after creating a quick filters failed', () => {
        const expectedResult = new QuickFilterActions.Create.OneRejected();

        quickFilterService.create.and.returnValue(errorResponse);
        actions.next(new QuickFilterActions.Create.One(MOCK_SAVE_QUICK_FILTER, 'list'));
        quickFiltersEffects.create$
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a QuickFilterActions.Delete.OneFulfilled action after deleting a quick filters successfully ' +
        'and the quick filter was not applied', () => {
        const {id, version} = MOCK_QUICK_FILTER_RESOURCE;
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Delete.OneFulfilled(id),
        ];

        quickFilterService.delete.and.returnValue(deleteQuickFilterResponse);
        actions.next(new QuickFilterActions.Delete.One(id, version));
        quickFiltersEffects.delete$
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after deleting a quick filters successfully and it was applied in the list context', () => {
        const {id, version} = MOCK_QUICK_FILTER_RESOURCE;
        const appliedFilters: QuickFilterAppliedFilters = {
            list: id,
            calendar: null,
        };
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Delete.OneFulfilled(id),
            new ProjectTaskActions.Set.Filters(new ProjectTaskFilters()),
            new QuickFilterActions.Set.AppliedFilter('all', 'list'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.delete.and.returnValue(deleteQuickFilterResponse);
        actions.next(new QuickFilterActions.Delete.One(id, version));
        quickFiltersEffects.delete$
            .pipe(take(3))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after deleting a quick filters successfully and it was applied in the calendar context', () => {
        const {id, version} = MOCK_QUICK_FILTER_RESOURCE;
        const appliedFilters: QuickFilterAppliedFilters = {
            list: null,
            calendar: id,
        };
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Delete.OneFulfilled(id),
            new ProjectTaskActions.Set.CalendarFilters(new ProjectTaskFilters()),
            new MilestoneActions.Set.Filters(new MilestoneFilters()),
            new QuickFilterActions.Set.AppliedFilter('all', 'calendar'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.delete.and.returnValue(deleteQuickFilterResponse);
        actions.next(new QuickFilterActions.Delete.One(id, version));
        quickFiltersEffects.delete$
            .pipe(take(4))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after deleting a quick filters successfully and ' +
        'it was applied in the calendar and list context', () => {
        const {id, version} = MOCK_QUICK_FILTER_RESOURCE;
        const appliedFilters: QuickFilterAppliedFilters = {
            list: id,
            calendar: id,
        };
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Delete.OneFulfilled(id),
            new ProjectTaskActions.Set.Filters(new ProjectTaskFilters()),
            new QuickFilterActions.Set.AppliedFilter('all', 'list'),
            new ProjectTaskActions.Set.CalendarFilters(new ProjectTaskFilters()),
            new MilestoneActions.Set.Filters(new MilestoneFilters()),
            new QuickFilterActions.Set.AppliedFilter('all', 'calendar'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.delete.and.returnValue(deleteQuickFilterResponse);
        actions.next(new QuickFilterActions.Delete.One(id, version));
        quickFiltersEffects.delete$
            .pipe(take(6))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Delete.OneRejected action after deleting a quick filters failed', () => {
        const {id, version} = MOCK_QUICK_FILTER_RESOURCE;
        const expectedResult = new QuickFilterActions.Delete.OneRejected();

        quickFilterService.delete.and.returnValue(errorResponse);
        actions.next(new QuickFilterActions.Delete.One(id, version));
        quickFiltersEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a QuickFilterActions.Update.OneFulfilled action after updating a quick filters successfully ' +
        'and the quick filter was not applied', () => {
        const {id, version} = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Update.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
        ];

        quickFilterService.update.and.returnValue(updateQuickFilterResponse);
        actions.next(new QuickFilterActions.Update.One(id, MOCK_SAVE_QUICK_FILTER, version));
        quickFiltersEffects.update$.subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after updating a quick filters successfully and it was applied in the list context', () => {
        const results: Action[] = [];
        const quickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
        const taskFilters = getProjectTaskFiltersFromQuickFilter(quickFilter);
        const {id, version} = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const appliedFilters: QuickFilterAppliedFilters = {
            list: id,
            calendar: null,
        };
        const expectedResults: Action[] = [
            new QuickFilterActions.Update.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
            new ProjectTaskActions.Set.Filters(taskFilters),
            new QuickFilterActions.Set.AppliedFilter(id, 'list'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.update.and.returnValue(updateQuickFilterResponse);
        actions.next(new QuickFilterActions.Update.One(id, MOCK_SAVE_QUICK_FILTER, version));
        quickFiltersEffects.update$
            .pipe(take(3))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after updating a quick filters successfully and it was applied in the calendar context', () => {
        const results: Action[] = [];
        const quickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
        const taskFilters = getProjectTaskFiltersFromQuickFilter(quickFilter);
        const milestoneFilters = getMilestoneFiltersFromQuickFilter(quickFilter);
        const {id, version} = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const appliedFilters: QuickFilterAppliedFilters = {
            list: null,
            calendar: id,
        };
        const expectedResults: Action[] = [
            new QuickFilterActions.Update.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
            new ProjectTaskActions.Set.CalendarFilters(taskFilters),
            new MilestoneActions.Set.Filters(milestoneFilters),
            new QuickFilterActions.Set.AppliedFilter(id, 'calendar'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.update.and.returnValue(updateQuickFilterResponse);
        actions.next(new QuickFilterActions.Update.One(id, MOCK_SAVE_QUICK_FILTER, version));
        quickFiltersEffects.update$
            .pipe(take(4))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger the right actions after updating a quick filters successfully and ' +
        'it was applied in the calendar and list context', () => {
        const {id, version} = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const quickFilter = QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA);
        const taskFilters = getProjectTaskFiltersFromQuickFilter(quickFilter);
        const milestoneFilters = getMilestoneFiltersFromQuickFilter(quickFilter);
        const appliedFilters: QuickFilterAppliedFilters = {
            list: id,
            calendar: id,
        };
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Update.OneFulfilled(MOCK_QUICK_FILTER_WITH_DATE_CRITERIA),
            new ProjectTaskActions.Set.Filters(taskFilters),
            new QuickFilterActions.Set.AppliedFilter(id, 'list'),
            new ProjectTaskActions.Set.CalendarFilters(taskFilters),
            new MilestoneActions.Set.Filters(milestoneFilters),
            new QuickFilterActions.Set.AppliedFilter(id, 'calendar'),
        ];

        appliedFiltersSubject.next(appliedFilters);

        quickFilterService.update.and.returnValue(updateQuickFilterResponse);
        actions.next(new QuickFilterActions.Update.One(id, MOCK_SAVE_QUICK_FILTER, version));
        quickFiltersEffects.update$
            .pipe(take(6))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Update.OneRejected action after updating a quick filters failed', () => {
        const {id, version} = MOCK_QUICK_FILTER_WITH_DATE_CRITERIA;
        const expectedResult = new QuickFilterActions.Update.OneRejected();

        quickFilterService.update.and.returnValue(errorResponse);
        actions.next(new QuickFilterActions.Update.One(id, MOCK_SAVE_QUICK_FILTER, version));
        quickFiltersEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a QuickFilterActions.Set.AppliedFilter with null when the calendar task filters change to not empty', () => {
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Set.AppliedFilter(null, 'calendar'),
        ];

        calendarTaskFiltersSubject.next(notEmptyTaskFilters);
        quickFiltersEffects.resetCalendarAppliedFilterId$
            .pipe(take(1))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Set.AppliedFilter with null when the milestone filters change to not empty', () => {
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Set.AppliedFilter(null, 'calendar'),
        ];

        milestoneFiltersSubject.next(notEmptyMilestoneFilters);
        quickFiltersEffects.resetCalendarAppliedFilterId$
            .pipe(take(1))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Set.AppliedFilter with all when the milestone and task filters change to empty', () => {
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Set.AppliedFilter('all', 'calendar'),
        ];

        calendarTaskFiltersSubject.next(emptyTaskFilters);
        milestoneFiltersSubject.next(emptyMilestoneFilters);
        quickFiltersEffects.resetCalendarAppliedFilterId$
            .pipe(take(1))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Set.AppliedFilter with null when the task list filters change to not empty', () => {
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Set.AppliedFilter(null, 'list'),
        ];

        taskFiltersSubject.next(notEmptyTaskFilters);
        quickFiltersEffects.resetListAppliedFilterId$
            .pipe(take(1))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger a QuickFilterActions.Set.AppliedFilter with all when the task list filters change to empty', () => {
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new QuickFilterActions.Set.AppliedFilter('all', 'list'),
        ];

        taskFiltersSubject.next(emptyTaskFilters);
        quickFiltersEffects.resetListAppliedFilterId$
            .pipe(take(1))
            .subscribe(result => results.push(result));

        expect(results).toEqual(expectedResults);
    });
});
