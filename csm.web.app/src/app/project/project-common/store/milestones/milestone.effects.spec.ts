/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Action} from '@ngrx/store';
import {chunk} from 'lodash';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    Subject,
    throwError
} from 'rxjs';
import {take} from 'rxjs/operators';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_FILTERS,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_LIST_EMPTY,
    MOCK_MILESTONE_LIST_ONE_OF_ONE_PAGE,
    MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE,
    MOCK_MILESTONE_LIST_TWO_OF_TWO_PAGE,
    MOCK_MILESTONE_RESOURCE_CRAFT,
    MOCK_MILESTONE_WORKAREA,
    MOCK_SAVE_MILESTONE
} from '../../../../../test/mocks/milestones';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {RealtimeQueriesStub} from '../../../../../test/stubs/realtime-queries.stub';
import {RealtimeServiceStub} from '../../../../../test/stubs/realtime-service.stub';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {MilestoneService} from '../../api/milestones/milestone.service';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {MilestoneListResource} from '../../api/milestones/resources/milestone-list.resource';
import {SaveMilestoneFilters} from '../../api/milestones/resources/save-milestone-filters';
import {TasksCalendarModeEnum} from '../../enums/tasks-calendar-mode.enum';
import {CalendarScopeActions} from '../calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {CalendarScopeParameters} from '../calendar/slice/calendar.scope-parameters';
import {ProjectSliceService} from '../projects/project-slice.service';
import {MilestoneActions} from './milestone.actions';
import {
    MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME,
    MilestoneEffects,
} from './milestone.effects';
import {MilestoneQueries} from './milestone.queries';
import {MilestoneFilters} from './slice/milestone-filters';
import {MilestoneFiltersCriteria} from './slice/milestone-filters-criteria';

describe('Milestone Effects', () => {
    let milestoneEffects: MilestoneEffects;
    let actions: ReplaySubject<any>;
    let milestoneService: any;

    const truncatedMilestoneFiltersSubject = new BehaviorSubject<MilestoneFilters>(null);
    const milestoneFiltersSubject = new BehaviorSubject<MilestoneFilters>(null);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const milestoneQueriesMock: MilestoneQueries = mock(MilestoneQueries);
    const context: ReplaySubject<ObjectIdentifierPair> = new ReplaySubject(1);
    const updates: ReplaySubject<RealtimeEventUpdateDataResource> = new Subject() as ReplaySubject<RealtimeEventUpdateDataResource>;

    const milestoneListId = 'bar';
    const milestoneListVersion = 1;
    const projectId = 'foo';
    const pageNumber = 0;
    const pageSize = 100;
    const milestoneFilters = new MilestoneFilters();
    milestoneFilters.criteria.types.projectCraftIds = ['bar', 'baz'];
    const defaultMilestoneFilters = new MilestoneFilters();
    const saveMilestoneFilters = SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters);
    const saveDefaultMilestoneFilters = SaveMilestoneFilters.fromMilestoneFilters(defaultMilestoneFilters);
    const saveMilestoneFiltersForList = SaveMilestoneFilters.fromMilestoneFilters(new MilestoneFilters(), [milestoneListId]);

    const errorResponse: Observable<any> = throwError('error');
    const createMilestoneResponse: Observable<MilestoneResource> = of(MOCK_MILESTONE_RESOURCE_CRAFT);
    const updateMilestoneResponse: Observable<MilestoneResource> = of(MOCK_MILESTONE_RESOURCE_CRAFT);
    const deleteMilestoneResponse: Observable<{}> = of({});
    const getOneMilestoneResponse: Observable<MilestoneResource> = of(MOCK_MILESTONE_RESOURCE_CRAFT);
    const getMilestonesOneOfOnePageResponse: Observable<MilestoneListResource> = of(MOCK_MILESTONE_LIST_ONE_OF_ONE_PAGE);
    const getMilestonesOneOfTwoPageResponse: Observable<MilestoneListResource> = of(MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE);
    const getMilestonesTwoOfTwoPageResponse: Observable<MilestoneListResource> = of(MOCK_MILESTONE_LIST_TWO_OF_TWO_PAGE);
    const getMilestonesEmptyPageResponse: Observable<MilestoneListResource> = of(MOCK_MILESTONE_LIST_EMPTY);

    const moduleDef: TestModuleMetadata = {
        providers: [
            MilestoneEffects,
            provideMockActions(() => actions),
            {
                provide: MilestoneService,
                useValue: jasmine.createSpyObj('MilestoneService', [
                    'create',
                    'delete',
                    'findAll',
                    'findAllByIds',
                    'findOne',
                    'update',
                ]),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: MilestoneQueries,
                useFactory: () => instance(milestoneQueriesMock),
            },
            {
                provide: RealtimeQueries,
                useValue: new RealtimeQueriesStub(context),
            },
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(updates),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));
        when(calendarScopeQueriesMock.observeMilestoneFiltersWithTruncatedDates()).thenReturn(truncatedMilestoneFiltersSubject);
        when(calendarScopeQueriesMock.observeDefaultMilestoneFiltersWithTruncatedDates()).thenReturn(of(defaultMilestoneFilters));
        when(milestoneQueriesMock.observeFilters()).thenReturn(milestoneFiltersSubject);
        when(milestoneQueriesMock.observeMilestoneById(MOCK_MILESTONE_CRAFT.id)).thenReturn(of(MOCK_MILESTONE_CRAFT));
        when(milestoneQueriesMock.observeMilestoneById(MOCK_MILESTONE_WORKAREA.id)).thenReturn(of(null));

        milestoneEffects = TestBed.inject(MilestoneEffects);
        milestoneService = TestBed.inject(MilestoneService);
        actions = new ReplaySubject(1);
        truncatedMilestoneFiltersSubject.next(milestoneFilters);

        milestoneService.findAll.calls.reset();
        milestoneService.findAllByIds.calls.reset();
    });

    it('should trigger a MilestoneActions.Request.OneRejected action after requesting a milestone failed', () => {
        const expectedResult = new MilestoneActions.Request.OneRejected();

        milestoneService.findOne.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Request.One(MOCK_MILESTONE_RESOURCE_CRAFT.id));
        milestoneEffects.requestOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Request.OneFulfilled action after requesting a milestone successfully', () => {
        const expectedResult = new MilestoneActions.Request.OneFulfilled(MOCK_MILESTONE_RESOURCE_CRAFT);

        milestoneService.findOne.and.returnValue(getOneMilestoneResponse);
        actions.next(new MilestoneActions.Request.One(MOCK_MILESTONE_RESOURCE_CRAFT.id));
        milestoneEffects.requestOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Request.All action after calendar parameters changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new MilestoneActions.Request.All();

        actions.next(new CalendarScopeActions.Set.ScopeParameters(new CalendarScopeParameters()));
        milestoneEffects.triggerRequestAllActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a MilestoneActions.Request.All action after calendar start changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new MilestoneActions.Request.All();

        actions.next(new CalendarScopeActions.Set.Start(null));
        milestoneEffects.triggerRequestAllActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a MilestoneActions.Request.All action after calendar mode changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new MilestoneActions.Request.All();

        actions.next(new CalendarScopeActions.Set.Mode(TasksCalendarModeEnum.EighteenWeeks));
        milestoneEffects.triggerRequestAllActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a MilestoneActions.Request.All action after milestone filters changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new MilestoneActions.Request.All();

        actions.next(new MilestoneActions.Set.Filters(MOCK_MILESTONE_FILTERS));
        milestoneEffects.triggerRequestAllActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should not trigger a milestone request when useCriteria and highlight are set to FALSE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), false, false);

        truncatedMilestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.requestAll$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
        expect(milestoneService.findAll).not.toHaveBeenCalled();
    });

    it('should trigger a milestone request when useCriteria and highlight are set to TRUE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, true);

        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        truncatedMilestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.requestAll$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(milestoneService.findAll).toHaveBeenCalled();
    });

    it('should trigger a milestone request when useCriteria is set to TRUE and highlight is set to FALSE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, false);

        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        truncatedMilestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.requestAll$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(milestoneService.findAll).toHaveBeenCalled();
    });

    it('should trigger a milestone request when useCriteria is set to FALSE and highlight is set to TRUE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), false, true);

        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        truncatedMilestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.requestAll$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(milestoneService.findAll).toHaveBeenCalled();
    });

    it('should trigger MilestoneActions.Initialize.List action when useCriteria and highlight are set to FALSE', () => {
        const expectedResult = new MilestoneActions.Initialize.List();
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), false, false);

        milestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.initializeList$
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should not trigger MilestoneActions.Initialize.List action when useCriteria is set to TRUE and highlight is set to FALSE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), true, false);

        milestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.initializeList$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
    });

    it('should not trigger MilestoneActions.Initialize.List action when useCriteria is set to FALSE and highlight is set to TRUE', () => {
        let results = 0;
        const filters = new MilestoneFilters(new MilestoneFiltersCriteria(), false, true);

        milestoneFiltersSubject.next(filters);
        actions.next(new MilestoneActions.Request.All());

        milestoneEffects.initializeList$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
    });

    it('should request milestones with default filters when highlight filter results is enabled', () => {
        const filtersWithHighlightFilterResults = new MilestoneFilters();
        filtersWithHighlightFilterResults.highlight = true;

        truncatedMilestoneFiltersSubject.next(filtersWithHighlightFilterResults);
        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        actions.next(new MilestoneActions.Request.All());
        milestoneEffects.requestAll$.subscribe(() => {
            expect(milestoneService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveDefaultMilestoneFilters);
        });
    });

    it('should trigger MilestoneActions.Request.AllFulfilled action after requesting milestones successfully and ' +
        'there\'s only one page of milestones', () => {
        const expectedResult = new MilestoneActions.Request.AllFulfilled(MOCK_MILESTONE_LIST_ONE_OF_ONE_PAGE);

        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        actions.next(new MilestoneActions.Request.All());
        milestoneEffects.requestAll$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveMilestoneFilters);
            expect(milestoneService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger MilestoneActions.Request.AllFulfilled action after requesting milestones successfully and ' +
        'there\'s two pages of milestones', () => {
        const expectedPayload = Object.assign({},
            MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE,
            {items: [...MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE.items, ...MOCK_MILESTONE_LIST_TWO_OF_TWO_PAGE.items]}
        );
        const expectedResult = new MilestoneActions.Request.AllFulfilled(expectedPayload);

        milestoneService.findAll.and.returnValues(getMilestonesOneOfTwoPageResponse, getMilestonesTwoOfTwoPageResponse);
        actions.next(new MilestoneActions.Request.All());
        milestoneEffects.requestAll$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledTimes(2);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger MilestoneActions.Request.AllFulfilled action after requesting milestones successfully and ' +
        'no milestones are returned', () => {
        const expectedResult = new MilestoneActions.Request.AllFulfilled(MOCK_MILESTONE_LIST_EMPTY);

        milestoneService.findAll.and.returnValue(getMilestonesEmptyPageResponse);
        actions.next(new MilestoneActions.Request.All());
        milestoneEffects.requestAll$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveMilestoneFilters);
            expect(milestoneService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Request.AllRejected action after requesting milestones has failed', () => {
        const expectedResult = new MilestoneActions.Request.AllRejected();

        milestoneService.findAll.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Request.All());
        milestoneEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Create.OneRejected action after creating a milestone failed', () => {
        const expectedResult = new MilestoneActions.Create.OneRejected();

        milestoneService.create.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Create.One(MOCK_SAVE_MILESTONE));
        milestoneEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Create.OneFulfilled action after creating a milestone successfully', () => {
        const results: Action[] = [];
        const firstExpectedResult = new MilestoneActions.Create.OneFulfilled(MOCK_MILESTONE_RESOURCE_CRAFT);
        const secondExpectedResult = new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('Milestone_Create_SuccessMessage'),
        });

        milestoneService.create.and.returnValue(createMilestoneResponse);
        actions.next(new MilestoneActions.Create.One(MOCK_SAVE_MILESTONE));
        milestoneEffects.create$.subscribe(result => {
            results.push(result);
        });

        const firstResult = results[0];
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a MilestoneActions.Update.OneRejected action after updating a milestone failed', () => {
        const expectedResult = new MilestoneActions.Update.OneRejected();

        milestoneService.update.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Update.One(
            MOCK_MILESTONE_RESOURCE_CRAFT.id,
            MOCK_SAVE_MILESTONE,
            MOCK_MILESTONE_RESOURCE_CRAFT.version,
        ));
        milestoneEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Update.OneFulfilled action after updating a milestone successfully', () => {
        const results: Action[] = [];
        const firstExpectedResult = new MilestoneActions.Update.OneFulfilled(MOCK_MILESTONE_RESOURCE_CRAFT);
        const secondExpectedResult = new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('Milestone_Update_SuccessMessage'),
        });

        milestoneService.update.and.returnValue(updateMilestoneResponse);
        actions.next(new MilestoneActions.Update.One(
            MOCK_MILESTONE_RESOURCE_CRAFT.id,
            MOCK_SAVE_MILESTONE,
            MOCK_MILESTONE_RESOURCE_CRAFT.version,
        ));
        milestoneEffects.update$.subscribe(result => {
            results.push(result);
        });

        const firstResult = results[0];
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a MilestoneActions.Delete.OneRejected action after deleting a milestone failed', () => {
        const expectedResult = new MilestoneActions.Delete.OneRejected();

        milestoneService.delete.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Delete.One(MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_CRAFT.version));
        milestoneEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Delete.OneFulfilled action after deleting a milestone successfully', () => {
        const results: Action[] = [];
        const firstExpectedResult = new MilestoneActions.Delete.OneFulfilled(MOCK_MILESTONE_CRAFT.id);
        const secondExpectedResult = new AlertActions.Add.SuccessAlert({
            message: new AlertMessageResource('Milestone_Delete_SuccessMessage'),
        });

        milestoneService.delete.and.returnValue(deleteMilestoneResponse);
        actions.next(new MilestoneActions.Delete.One(MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_CRAFT.version));
        milestoneEffects.delete$.subscribe(result => {
            results.push(result);
        });

        const firstResult = results[0];
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(firstResult).toEqual(firstExpectedResult);
        expect(secondResult.type).toBe(secondExpectedResult.type);
        expect(secondResult.payload.type).toBe(secondExpectedResult.payload.type);
        expect(secondResult.payload.message).toEqual(secondExpectedResult.payload.message);
    });

    it('should trigger a MilestoneActions.Request.AllByIds when an event of a updated milestone is received', fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByIds([MOCK_MILESTONE_CRAFT.id]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_CRAFT.id,
            MOCK_MILESTONE_CRAFT.version + 1,
        );
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should not trigger a MilestoneActions.Request.AllByIds when an event of a updated milestone is received ' +
        'but user is already updated', fakeAsync(() => {
        let currentResult: Action = null;
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_CRAFT.version);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
        subscription.unsubscribe();
    }));

    it('should trigger a MilestoneActions.Request.AllByIds when an event of a created milestone is received', fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByIds([MOCK_MILESTONE_WORKAREA.id]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_WORKAREA.id,
            MOCK_MILESTONE_WORKAREA.version,
        );
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should not trigger a MilestoneActions.Request.AllByIds when an event of a created milestone is received ' +
        'but user already has the milestone since he created it himself', fakeAsync(() => {
        let currentResult: Action = null;
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_CRAFT.version);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => {
            currentResult = result;
        });
        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toBeNull();
        subscription.unsubscribe();
    }));

    it(`should buffer the milestone update and create events when they are received in a period of
     ${MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByIds([MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_WORKAREA.id]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_CRAFT.id,
            MOCK_MILESTONE_CRAFT.version + 1,
        );
        const objectB = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_WORKAREA.id,
            MOCK_MILESTONE_WORKAREA.version + 1,
        );
        const updateEvent: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, objectA);
        const createEvent: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, objectB);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(updateEvent);
        updates.next(createEvent);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should not buffer the milestone update and create events when they are received with a time gap
    of ${MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const currentResult: Action[] = [];
        const expectedResult = [
            new MilestoneActions.Request.AllByIds([MOCK_MILESTONE_CRAFT.id]),
            new MilestoneActions.Request.AllByIds([MOCK_MILESTONE_WORKAREA.id]),
        ];
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_CRAFT.id,
            MOCK_MILESTONE_CRAFT.version + 1,
        );
        const objectB = new ObjectIdentifierPairWithVersion(
            ObjectTypeEnum.Milestone,
            MOCK_MILESTONE_WORKAREA.id,
            MOCK_MILESTONE_WORKAREA.version + 1,
        );
        const updateEvent: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, objectA);
        const createEvent: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, objectB);

        const subscription = milestoneEffects.milestoneUpdateAndCreateEvents$.subscribe(result => currentResult.push(result));

        context.next(root);
        updates.next(updateEvent);
        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(createEvent);
        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should trigger a MilestoneActions.Delete.OneFulfilled when an event of a deleted milestone is received', () => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Delete.OneFulfilled(MOCK_MILESTONE_CRAFT.id);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id, MOCK_MILESTONE_CRAFT.version);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, object);

        const subscription = milestoneEffects.milestoneDeleteEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should trigger a MilestoneActions.Request.AllByMilestoneListIds for a given list when a REORDERED event of a ' +
        'milestone list is received', fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListId, milestoneListVersion);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Reordered, root, object);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should trigger a MilestoneActions.Request.AllByMilestoneListIds for a given list when a ${EventTypeEnum.ItemAdded} event
    of a milestone list is received`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListId, milestoneListVersion);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemAdded, root, object);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should trigger a MilestoneActions.Request.AllByMilestoneListIds for a given list when a ${EventTypeEnum.ItemRemoved} event
     of a milestone list is received`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListId, milestoneListVersion);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemRemoved, root, object);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should buffer the milestone list ${EventTypeEnum.ItemRemoved} and ${EventTypeEnum.ItemAdded} events when they are received
     in a period of ${MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        let currentResult: Action = null;
        const milestoneListIdA = 'foo';
        const milestoneListIdB = 'bar';
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIds([milestoneListIdA, milestoneListIdB]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListIdA, 1);
        const objectB = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListIdB, 1);
        const addedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemAdded, root, objectA);
        const removedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemRemoved, root, objectB);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(addedEvent);
        updates.next(removedEvent);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should not buffer the milestone list ${EventTypeEnum.ItemRemoved} and ${EventTypeEnum.ItemAdded} events when they are received
     with a time gap of ${MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const currentResult: Action[] = [];
        const milestoneListIdA = 'foo';
        const milestoneListIdB = 'bar';
        const expectedResult = [
            new MilestoneActions.Request.AllByMilestoneListIds([milestoneListIdA]),
            new MilestoneActions.Request.AllByMilestoneListIds([milestoneListIdB]),
        ];
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const objectA = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListIdA, 1);
        const objectB = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListIdB, 1);
        const addedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemAdded, root, objectA);
        const removedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemRemoved, root, objectB);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => currentResult.push(result));

        context.next(root);
        updates.next(addedEvent);
        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(removedEvent);
        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should trigger a MilestoneActions.Request.AllByMilestoneListIds for a given list when a ${EventTypeEnum.ItemRemoved} event
     of a milestone list is received`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.MilestoneList, milestoneListId, milestoneListVersion);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.ItemRemoved, root, object);

        const subscription = milestoneEffects.milestoneListUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(MILESTONE_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should trigger MilestoneActions.Request.AllByMilestoneListIdsFulfilled action after requesting milestones successfully and ' +
        'there\'s only one page of milestones', (done) => {
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIdsFulfilled(MOCK_MILESTONE_LIST_ONE_OF_ONE_PAGE.items);

        milestoneService.findAll.and.returnValue(getMilestonesOneOfOnePageResponse);
        actions.next(new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]));
        milestoneEffects.requestAllByMilestoneListIds$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveMilestoneFiltersForList);
            expect(milestoneService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger MilestoneActions.Request.AllByMilestoneListIdsFulfilled action after requesting milestones successfully and ' +
        'there\'s two pages of milestones', (done) => {
        const expectedPayload = [...MOCK_MILESTONE_LIST_ONE_OF_TWO_PAGE.items, ...MOCK_MILESTONE_LIST_TWO_OF_TWO_PAGE.items];
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIdsFulfilled(expectedPayload);

        milestoneService.findAll.and.returnValues(getMilestonesOneOfTwoPageResponse, getMilestonesTwoOfTwoPageResponse);
        actions.next(new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]));
        milestoneEffects.requestAllByMilestoneListIds$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledTimes(2);
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should chunk the requests by the milestone list ids when there are more than 500 milestone list ids to request', (done) => {
        const milestoneListIds = new Array(501).fill(UUID.v4());

        milestoneService.findAll.and.returnValues(getMilestonesOneOfOnePageResponse, getMilestonesOneOfOnePageResponse);
        actions.next(new MilestoneActions.Request.AllByMilestoneListIds(milestoneListIds));
        milestoneEffects.requestAllByMilestoneListIds$.subscribe(() => {
            expect(milestoneService.findAll).toHaveBeenCalledTimes(2);
            done();
        });
    });

    it('should trigger MilestoneActions.Request.AllByMilestoneListIdsFulfilled action after requesting milestones successfully and ' +
        'no milestones are returned', (done) => {
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIdsFulfilled([]);

        milestoneService.findAll.and.returnValue(getMilestonesEmptyPageResponse);
        actions.next(new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]));
        milestoneEffects.requestAllByMilestoneListIds$.subscribe(result => {
            expect(milestoneService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveMilestoneFiltersForList);
            expect(milestoneService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
            done();
        });
    });

    it('should trigger a MilestoneActions.Request.AllByMilestoneListIdsRejected action after requesting milestones has failed', () => {
        const expectedResult = new MilestoneActions.Request.AllByMilestoneListIdsRejected();

        milestoneService.findAll.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Request.AllByMilestoneListIds([milestoneListId]));
        milestoneEffects.requestAllByMilestoneListIds$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a MilestoneActions.Request.AllByIdsFulfilled action after a successful milestone request all by ids', () => {
        const milestoneList = new Array(150).fill(MOCK_MILESTONE_HEADER);
        const milestoneIds = milestoneList.map(item => item.id);
        const results = chunk(milestoneList, 100);
        const firstResultResponse = of(results[0]);
        const secondResultResponse = of(results[1]);
        const expectedResult = new MilestoneActions.Request.AllByIdsFulfilled(milestoneList);

        milestoneService.findAllByIds.and.returnValues(firstResultResponse, secondResultResponse);
        actions.next(new MilestoneActions.Request.AllByIds(milestoneIds));
        milestoneEffects.requestAllByIds$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(milestoneService.findAllByIds).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger MilestoneActions.Request.AllByIdsRejected action after a unsuccessful request' +
        ' for milestone request all by ids', () => {
        const expectedResult = new MilestoneActions.Request.AllByIdsRejected();

        milestoneService.findAllByIds.and.returnValue(errorResponse);
        actions.next(new MilestoneActions.Request.AllByIds(['foo']));
        milestoneEffects.requestAllByIds$.subscribe(result => expect(result).toEqual(expectedResult));
    });
});
