/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {
    chunk,
    uniq,
} from 'lodash';
import {
    Observable,
    of,
    ReplaySubject,
    Subject,
    throwError
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_MILESTONE_LIST,
    MOCK_MILESTONE_LIST_EMPTY,
} from '../../../../../test/mocks/milestones';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {
    MOCK_ABSTRACT_RELATION_LIST,
    MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE,
    MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_TWO,
    MOCK_RELATION_LIST_RESOURCE_PAGE_TWO_OF_TWO,
    MOCK_RELATION_RESOURCE_1,
    MOCK_SAVE_RELATION_FILTERS_1,
    MOCK_SAVE_RELATION_RESOURCE_1
} from '../../../../../test/mocks/relations';
import {
    MOCK_TASK_LIST,
    MOCK_TASK_LIST_EMPTY,
} from '../../../../../test/mocks/tasks';
import {RealtimeQueriesStub} from '../../../../../test/stubs/realtime-queries.stub';
import {RealtimeServiceStub} from '../../../../../test/stubs/realtime-service.stub';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {RelationService} from '../../api/relations/relation.service';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListResource} from '../../api/relations/resources/relation-list.resource';
import {SaveRelationResource} from '../../api/relations/resources/save-relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {MilestoneActions} from '../milestones/milestone.actions';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectTaskActions} from '../tasks/task.actions';
import {RelationActions} from './relation.actions';
import {
    RELATION_UPDATE_EVENTS_DEBOUNCE_TIME,
    RelationEffects,
    TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME,
} from './relation.effects';
import {RelationQueries} from './relation.queries';

describe('Relation Effects', () => {
    let actions: ReplaySubject<any>;
    let relationEffects: RelationEffects;
    let relationService: any;

    const projectId = 'foo';
    const relationId = MOCK_RELATION_RESOURCE_1.id;
    const relationVersion = MOCK_RELATION_RESOURCE_1.version;
    const pageNumber = 0;
    const pageSize = 100;
    const projectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);

    const context: ReplaySubject<ObjectIdentifierPair> = new ReplaySubject(1);
    const updates: ReplaySubject<RealtimeEventUpdateDataResource> = new Subject() as ReplaySubject<RealtimeEventUpdateDataResource>;
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const relationQueriesMock: RelationQueries = mock(RelationQueries);

    const errorResponse: Observable<any> = throwError('error');
    const deleteRelationResponse: Observable<{}> = of({});

    const saveRelationFiltersPayload: SaveRelationFilters = MOCK_SAVE_RELATION_FILTERS_1;
    const saveRelationsPayload: SaveRelationResource[] = [MOCK_SAVE_RELATION_RESOURCE_1];
    const relationsPayload: RelationResource[] = [MOCK_RELATION_RESOURCE_1];
    const relationListOneOfOnePayload: RelationListResource = MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE;
    const abstractRelationList: AbstractItemsResource<RelationResource> = MOCK_ABSTRACT_RELATION_LIST;

    const relationsResponse: Observable<RelationResource[]> = of(relationsPayload);
    const relationListResponse: Observable<RelationListResource> = of(relationListOneOfOnePayload);
    const relationListOneOfTwoResponse: Observable<RelationListResource> = of(MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_TWO);
    const relationListTwoOfTwoResponse: Observable<RelationListResource> = of(MOCK_RELATION_LIST_RESOURCE_PAGE_TWO_OF_TWO);

    const taskListResource = MOCK_TASK_LIST;
    const milestoneListResource = MOCK_MILESTONE_LIST;

    const getResourcesIdsByType = (relationList: RelationListResource | AbstractItemsResource<RelationResource>,
                                   type: ObjectTypeEnum): string[] =>
        [
            ...relationList.items.filter(item => item.source.type === type).map(item => item.source.id),
            ...relationList.items.filter(item => item.target.type === type).map(item => item.target.id),
        ];

    const moduleDef: TestModuleMetadata = {
        providers: [
            RelationEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: RelationQueries,
                useFactory: () => instance(relationQueriesMock),
            },
            {
                provide: RelationService,
                useValue: jasmine.createSpyObj('RelationService', [
                    'findAll',
                    'findAllByIds',
                    'createAll',
                    'delete',
                ]),
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

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

        relationEffects = TestBed.inject(RelationEffects);
        relationService = TestBed.inject(RelationService);
        actions = new ReplaySubject(1);

        relationService.findAll.calls.reset();
        relationService.createAll.calls.reset();
        relationService.delete.calls.reset();
        relationService.findAllByIds.calls.reset();
    });

    it('should trigger a RelationActions.Request.AllFulfilled action after fetching relations with success', () => {
        const expectedResult = new RelationActions.Request.AllFulfilled(relationListOneOfOnePayload);

        relationService.findAll.and.returnValue(relationListResponse);
        actions.next(new RelationActions.Request.All(saveRelationFiltersPayload));
        relationEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveRelationFiltersPayload);
        });
    });

    it('should trigger a RelationActions.Request.AllFulfilled action after fetching relations with success and there\s ' +
        'two pages of relations', () => {
        const expectedPayload = Object.assign({},
            MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_TWO,
            {items: [...MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_TWO.items, ...MOCK_RELATION_LIST_RESOURCE_PAGE_TWO_OF_TWO.items]}
        );
        const expectedResult = new RelationActions.Request.AllFulfilled(expectedPayload);

        relationService.findAll.and.returnValues(relationListOneOfTwoResponse, relationListTwoOfTwoResponse);
        actions.next(new RelationActions.Request.All(saveRelationFiltersPayload));
        relationEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.findAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a RelationActions.Request.AllRejected action after a unsuccessful fetch for relations', () => {
        const expectedResult = new RelationActions.Request.AllRejected();

        relationService.findAll.and.returnValue(errorResponse);
        actions.next(new RelationActions.Request.All(saveRelationFiltersPayload));
        relationEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.findAll).toHaveBeenCalledWith(projectId, pageNumber, pageSize, saveRelationFiltersPayload);
        });
    });

    it('should trigger a RelationActions.Create.AllFulfilled action after creating relations with success', () => {
        const successMessageKey = 'foo';
        const results = [];
        const expectedResults = [
            new RelationActions.Create.AllFulfilled(relationsPayload),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(successMessageKey)}),
        ];

        relationService.createAll.and.returnValue(relationsResponse);
        actions.next(new RelationActions.Create.All(saveRelationsPayload, successMessageKey));
        relationEffects.createAll$.subscribe(result => results.push(result));

        const firstResult = results[0] as RelationActions.Create.AllFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(results.length).toEqual(expectedResults.length);
        expect(results[0]).toEqual(firstResult);
        expect(results[1].type).toEqual(secondResult.type);
        expect(results[1].payload.type).toEqual(secondResult.payload.type);
        expect(results[1].payload.message).toEqual(secondResult.payload.message);
        expect(relationService.createAll).toHaveBeenCalledWith(projectId, saveRelationsPayload);
    });

    it('should trigger a RelationActions.Create.AllRejected action after a unsuccessful relation creation', () => {
        const relationTypes: RelationTypeEnum[] = uniq(saveRelationsPayload.map(item => item.type));
        const expectedResult = new RelationActions.Create.AllRejected(relationTypes);

        relationService.createAll.and.returnValue(errorResponse);
        actions.next(new RelationActions.Create.All(saveRelationsPayload, 'foo'));
        relationEffects.createAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.createAll).toHaveBeenCalledWith(projectId, saveRelationsPayload);
        });
    });

    it('should trigger a RelationActions.Delete.OneFulfilled action after deleting a relation with success', () => {
        const successMessageKey = 'foo';
        const results = [];
        const expectedResults = [
            new RelationActions.Delete.OneFulfilled(relationId),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(successMessageKey)}),
        ];

        relationService.delete.and.returnValue(deleteRelationResponse);
        actions.next(new RelationActions.Delete.One(relationId, relationVersion, successMessageKey));
        relationEffects.deleteOne$.subscribe(result => results.push(result));

        const firstResult = results[0] as RelationActions.Delete.OneFulfilled;
        const secondResult = results[1] as AlertActions.Add.SuccessAlert;

        expect(results.length).toEqual(expectedResults.length);
        expect(results[0]).toEqual(firstResult);
        expect(results[1].type).toEqual(secondResult.type);
        expect(results[1].payload.type).toEqual(secondResult.payload.type);
        expect(results[1].payload.message).toEqual(secondResult.payload.message);
        expect(relationService.delete).toHaveBeenCalledWith(projectId, relationId, relationVersion);
    });

    it('should trigger a RelationActions.Delete.OneRejected action after a unsuccessful relation deletion', () => {
        const expectedResult = new RelationActions.Delete.OneRejected(relationId);

        relationService.delete.and.returnValue(errorResponse);
        actions.next(new RelationActions.Delete.One(relationId, relationVersion, 'foo'));
        relationEffects.deleteOne$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.delete).toHaveBeenCalledWith(projectId, relationId, relationVersion);
        });
    });

    it('should dispatch a ProjectTaskActions.Request.AllByIds and MilestoneActions.Request.AllByIds actions after a ' +
        'RelationActions.Request.AllFulfilled action with the flag withResources set to true', () => {
        const results = [];
        const taskIds = getResourcesIdsByType(relationListOneOfOnePayload, ObjectTypeEnum.Task);
        const milestoneIds = getResourcesIdsByType(relationListOneOfOnePayload, ObjectTypeEnum.Milestone);

        const expectedResults = [
            new ProjectTaskActions.Request.AllByIds(taskIds),
            new MilestoneActions.Request.AllByIds(milestoneIds),
        ];

        relationEffects.requestAllRelationsResources.subscribe(result => results.push(result));
        actions.next(new RelationActions.Request.AllFulfilled(relationListOneOfOnePayload, true));
        expect(results).toEqual(expectedResults);
    });

    it('should not dispatch a ProjectTaskActions.Request.AllByIds and MilestoneActions.Request.AllByIds actions after a ' +
        'RelationActions.Request.AllFulfilled with the flag withResources not set', () => {
        const results = [];
        const expectedResults = [];

        relationEffects.requestAllRelationsResources.subscribe(result => results.push(result));
        actions.next(new RelationActions.Request.AllFulfilled(relationListOneOfOnePayload));
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a RelationActions.Request.AllByIdsFulfilled action after a successful relation request all by ids', () => {
        const relationItems = new Array(150).fill(MOCK_RELATION_RESOURCE_1);
        const relationIds = relationItems.map(item => item.id);
        const chunks = chunk(relationItems, 100);
        const firstResult: Observable<AbstractItemsResource<RelationResource>> = of(Object.assign(
            new AbstractItemsResource<RelationResource>(),
            abstractRelationList,
            {items: chunks[0]},
        ));
        const secondResult: Observable<AbstractItemsResource<RelationResource>> = of(Object.assign(
            new AbstractItemsResource<RelationResource>(),
            abstractRelationList,
            {items: chunks[1]},
        ));
        const expectedAbstractList: AbstractItemsResource<RelationResource> = Object.assign(
            new AbstractItemsResource<RelationResource>(),
            abstractRelationList,
            {items: relationItems},
        );
        const expectedResult = new RelationActions.Request.AllByIdsFulfilled(expectedAbstractList);

        actions.next(new RelationActions.Request.AllByIds(relationIds));

        relationService.findAllByIds.and.returnValues(firstResult, secondResult);
        relationEffects.requestAllByIds$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(relationService.findAllByIds).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger RelationActions.Request.AllByIdsRejected action after a unsuccessful request for relation find all by ids', () => {
        const expectedResult = new RelationActions.Request.AllByIdsRejected();

        actions.next(new RelationActions.Request.AllByIds(['foo']));

        relationService.findAllByIds.and.returnValue(errorResponse);
        relationEffects.requestAllByIds$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should dispatch a ProjectTaskActions.Request.AllByIds and MilestoneActions.Request.AllByIds actions after a ' +
        'RelationActions.Request.AllByIdsFulfilled action with the flag withResources set to true', () => {
        const results = [];
        const taskIds = getResourcesIdsByType(abstractRelationList, ObjectTypeEnum.Task);
        const milestoneIds = getResourcesIdsByType(abstractRelationList, ObjectTypeEnum.Milestone);
        const expectedResults = [
            new ProjectTaskActions.Request.AllByIds(taskIds),
            new MilestoneActions.Request.AllByIds(milestoneIds),
        ];

        relationEffects.requestAllRelationsResources.subscribe(result => results.push(result));
        actions.next(new RelationActions.Request.AllByIdsFulfilled(abstractRelationList, true));

        expect(results).toEqual(expectedResults);
    });

    it('should not dispatch a ProjectTaskActions.Request.AllByIds and MilestoneActions.Request.AllByIds actions after a ' +
        'RelationActions.Request.AllByIdsFulfilled with the flag withResources not set', () => {
        const results = [];
        const expectedResults = [];

        relationEffects.requestAllRelationsResources.subscribe(result => results.push(result));
        actions.next(new RelationActions.Request.AllByIdsFulfilled(abstractRelationList));

        expect(results).toEqual(expectedResults);
    });

    it('should trigger one RelationActions.Request.AllByIds when a create and an update relation event ' +
        'are received within 1000ms', (done) => {
        let currentResult: Action = null;
        const createdRelationId = 'created-relation-id';
        const updatedRelationId = 'updated-relation-id';
        const createdObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, createdRelationId, 0);
        const updatedObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, updatedRelationId, 0);
        const createdEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, projectIdentifierPair, createdObject);
        const updatedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, projectIdentifierPair, updatedObject);
        const expectedResult = new RelationActions.Request.AllByIds([createdRelationId, updatedRelationId], true);
        const subscription = relationEffects.relationUpdateAndCreateEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(createdRelationId)).thenReturn(of(null));
        when(relationQueriesMock.observeRelationById(updatedRelationId)).thenReturn(of(null));

        context.next(projectIdentifierPair);
        updates.next(createdEvent);
        updates.next(updatedEvent);

        setTimeout(() => {
            expect(currentResult).toEqual(expectedResult);

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger two RelationActions.Request.AllByIds when a create and an update relation event are received ' +
        'with a time interval greater that 1000ms', (done) => {
        const createdRelationId = 'created-relation-id-2';
        const updatedRelationId = 'updated-relation-id-2';
        const createdObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, createdRelationId, 0);
        const updatedObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, updatedRelationId, 1);
        const createdEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, projectIdentifierPair, createdObject);
        const updatedEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, projectIdentifierPair, updatedObject);
        const results: Action[] = [];
        const expectedResults: Action[] = [
            new RelationActions.Request.AllByIds([createdRelationId], true),
            new RelationActions.Request.AllByIds([updatedRelationId], true),
        ];
        const subscription = relationEffects.relationUpdateAndCreateEvents$.subscribe(result => results.push(result));

        when(relationQueriesMock.observeRelationById(createdRelationId)).thenReturn(of(null));
        when(relationQueriesMock.observeRelationById(updatedRelationId)).thenReturn(of(null));

        context.next(projectIdentifierPair);
        updates.next(createdEvent);

        setTimeout(() => {
            updates.next(updatedEvent);

            setTimeout(() => {
                expect(results).toEqual(expectedResults);

                subscription.unsubscribe();
                done();
            }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME + 50);
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should not trigger a RelationActions.Request.AllByIds when an update relation event is received ' +
        'but user is already updated', (done) => {
        let currentResult: Action = null;
        const id = MOCK_RELATION_RESOURCE_1.id;
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, 0);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, projectIdentifierPair, object);
        const subscription = relationEffects.relationUpdateAndCreateEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(id)).thenReturn(of(MOCK_RELATION_RESOURCE_1));

        context.next(projectIdentifierPair);
        updates.next(event);

        setTimeout(() => {
            expect(currentResult).toBeNull();

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should not trigger a RelationActions.Request.AllByIds when an create relation event is received ' +
        'but the user already has the milestone', (done) => {
        let currentResult: Action = null;
        const id = MOCK_RELATION_RESOURCE_1.id;
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, 0);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, projectIdentifierPair, object);
        const subscription = relationEffects.relationUpdateAndCreateEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(id)).thenReturn(of(MOCK_RELATION_RESOURCE_1));

        context.next(projectIdentifierPair);
        updates.next(event);

        setTimeout(() => {
            expect(currentResult).toBeNull();

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger a RelationActions.Delete.OneFulfilled when an event of a deleted milestone is received', () => {
        let currentResult: Action = null;
        const id = 'deleted-relation-id';
        const expectedResult = new RelationActions.Delete.OneFulfilled(id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, 0);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, projectIdentifierPair, object);
        const subscription = relationEffects.relationDeleteEvents$.subscribe(result => currentResult = result);

        context.next(projectIdentifierPair);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
        subscription.unsubscribe();
    });

    it('should trigger a RelationActions.Request.All action for tasks after calendar tasks request succeed', fakeAsync(() => {
        let resultFromEffect = null;
        const tasks = taskListResource.tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
        const payload = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(tasks, tasks);
        const expectedResult = new RelationActions.Request.All(payload);
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultFromEffect = result);

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(taskListResource));

        expect(resultFromEffect).toBeNull();

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultFromEffect).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should trigger a RelationActions.Request.All action for milestones after milestones request succeed', fakeAsync(() => {
        let resultFromEffect = null;
        const milestones = milestoneListResource.items.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id));
        const payload = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(milestones, milestones);
        const expectedResult = new RelationActions.Request.All(payload);
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultFromEffect = result);

        actions.next(new MilestoneActions.Request.AllFulfilled(milestoneListResource));

        expect(resultFromEffect).toBeNull();

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultFromEffect).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it('should trigger a RelationActions.Request.All action for tasks and milestones after calendar tasks and ' +
        'milestones requests succeed', fakeAsync(() => {
        let resultFromEffect = null;
        const milestones = milestoneListResource.items.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id));
        const tasks = taskListResource.tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
        const elements = [
            ...tasks,
            ...milestones,
        ];
        const payload = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(elements, elements);
        const expectedResult = new RelationActions.Request.All(payload);
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultFromEffect = result);

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(taskListResource));
        actions.next(new MilestoneActions.Request.AllFulfilled(milestoneListResource));

        expect(resultFromEffect).toBeNull();

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultFromEffect).toEqual(expectedResult);
        subscription.unsubscribe();
    }));

    it(`should trigger two RelationActions.Request.All actions after requesting tasks and milestones successfully' +
        ' but not within a timespan of ${TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME}`, fakeAsync(() => {
        const resultsFromEffect = [];
        const milestones = milestoneListResource.items.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id));
        const tasks = taskListResource.tasks.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Task, id));
        const payloadTasks = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(tasks, tasks);
        const payloadMilestones = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(milestones, milestones);
        const expectedFirstResult = new RelationActions.Request.All(payloadTasks);
        const expectedSecondResult = new RelationActions.Request.All(payloadMilestones);
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultsFromEffect.push(result));

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(taskListResource));

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultsFromEffect.length).toBe(1);
        expect(resultsFromEffect[0]).toEqual(expectedFirstResult);

        actions.next(new MilestoneActions.Request.AllFulfilled(milestoneListResource));

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultsFromEffect.length).toBe(2);
        expect(resultsFromEffect[1]).toEqual(expectedSecondResult);
        subscription.unsubscribe();
    }));

    it('should not trigger a RelationActions.Request.All action for tasks and milestones after empty calendar tasks and ' +
        'milestones requests succeed', fakeAsync(() => {
        let resultFromEffect = null;
        const emptyTaskListResource = MOCK_TASK_LIST_EMPTY;
        const emptyMilestoneListResource = MOCK_MILESTONE_LIST_EMPTY;
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultFromEffect = result);

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(emptyTaskListResource));
        actions.next(new MilestoneActions.Request.AllFulfilled(emptyMilestoneListResource));

        expect(resultFromEffect).toBeNull();

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultFromEffect).toBeNull();
        subscription.unsubscribe();
    }));

    it('should buffer the critical and uncritical realtime events when they are received within 1000ms', (done) => {
        let currentResult: Action = null;
        const relationA: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-a',
            version: 3,
        };
        const relationB: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-b',
            version: 5,
        };
        const relationAObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, relationA.id, 4);
        const relationBObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, relationB.id, 6);
        const relationAEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationAObject);
        const relationBEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationBObject);
        const expectedResult = new RelationActions.Set.AllCritical([relationAObject, relationBObject]);
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(relationA.id)).thenReturn(of(relationA));
        when(relationQueriesMock.observeRelationById(relationB.id)).thenReturn(of(relationB));

        context.next(projectIdentifierPair);
        updates.next(relationAEvent);
        updates.next(relationBEvent);

        setTimeout(() => {
            expect(currentResult).toEqual(expectedResult);

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should not buffer the critical and uncritical realtime events when they are received with a time interval' +
        ' greater that 1000ms', (done) => {
        const results: Action[] = [];
        const relationA: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-a',
            version: 3,
        };
        const relationB: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-b',
            version: 5,
        };
        const relationAObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, relationA.id, 4);
        const relationBObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, relationB.id, 6);
        const relationAEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationAObject);
        const relationBEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationBObject);
        const expectedResults: Action[] = [
            new RelationActions.Set.AllCritical([relationAObject]),
            new RelationActions.Set.AllCritical([relationBObject]),
        ];
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => results.push(result));

        when(relationQueriesMock.observeRelationById(relationA.id)).thenReturn(of(relationA));
        when(relationQueriesMock.observeRelationById(relationB.id)).thenReturn(of(relationB));

        context.next(projectIdentifierPair);
        updates.next(relationAEvent);

        setTimeout(() => {
            updates.next(relationBEvent);

            setTimeout(() => {
                expect(results).toEqual(expectedResults);

                subscription.unsubscribe();
                done();
            }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME + 50);
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should not handle any criticality event when the user is already updated', (done) => {
        let currentResult: Action = null;
        const {id, version} = MOCK_RELATION_RESOURCE_1;
        const relationObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, version);
        const relationEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationObject);
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(id)).thenReturn(of(MOCK_RELATION_RESOURCE_1));

        context.next(projectIdentifierPair);
        updates.next(relationEvent);

        setTimeout(() => {
            expect(currentResult).toBeNull();

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger a RelationActions.Request.AllByIds action when a critical event is received and the user' +
        ' didn\'t have the relation', (done) => {
        let currentResult: Action = null;
        const {id, version} = MOCK_RELATION_RESOURCE_1;
        const relationObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, version);
        const relationEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationObject);
        const expectedResult = new RelationActions.Request.AllByIds([id]);
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(id)).thenReturn(of(null));

        context.next(projectIdentifierPair);
        updates.next(relationEvent);

        setTimeout(() => {
            expect(currentResult).toEqual(expectedResult);

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger a RelationActions.Request.AllByIds action when a critical event is received for a relation that ' +
        'is not the previous one compared to the one from the event', (done) => {
        let currentResult: Action = null;
        const {id, version} = MOCK_RELATION_RESOURCE_1;
        const relationObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, version + 2);
        const relationEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, relationObject);
        const expectedResult = new RelationActions.Request.AllByIds([id]);
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => currentResult = result);

        when(relationQueriesMock.observeRelationById(id)).thenReturn(of(MOCK_RELATION_RESOURCE_1));

        context.next(projectIdentifierPair);
        updates.next(relationEvent);

        setTimeout(() => {
            expect(currentResult).toEqual(expectedResult);

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger SetAllCritical and SetAllUncritical actions when different events are received ' +
        'for relations that were up-to-date', (done) => {
        const results: Action[] = [];
        const criticalRelation: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-a',
            version: 3,
        };
        const uncriticalRelation: RelationResource = {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'relation-b',
            version: 5,
            critical: true,
        };
        const criticalObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, criticalRelation.id, 4);
        const uncriticalObject = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, uncriticalRelation.id, 6);
        const criticalEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Critical, projectIdentifierPair, criticalObject);
        const uncriticalEvent = new RealtimeEventUpdateDataResource(EventTypeEnum.Uncritical, projectIdentifierPair, uncriticalObject);
        const expectedResults: Action[] = [
            new RelationActions.Set.AllCritical([criticalObject]),
            new RelationActions.Set.AllUncritical([uncriticalObject]),
        ];
        const subscription = relationEffects.relationCriticalityEvents$.subscribe(result => results.push(result));

        when(relationQueriesMock.observeRelationById(criticalRelation.id)).thenReturn(of(criticalRelation));
        when(relationQueriesMock.observeRelationById(uncriticalRelation.id)).thenReturn(of(uncriticalRelation));

        context.next(projectIdentifierPair);
        updates.next(criticalEvent);
        updates.next(uncriticalEvent);

        setTimeout(() => {
            expect(results).toEqual(expectedResults);

            subscription.unsubscribe();
            done();
        }, RELATION_UPDATE_EVENTS_DEBOUNCE_TIME);
    });

    it('should trigger a RelationActions.Request.All action for milestones without duplicated identifier ' +
        'after two milestones requests succeed', fakeAsync(() => {
        let resultFromEffect = null;
        const milestones = milestoneListResource.items.map(({id}) => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id));
        const payload = SaveRelationFilters.forFinishToStartRelationsBySourcesAndTargets(milestones, milestones);
        const expectedResult = new RelationActions.Request.All(payload);
        const subscription = relationEffects.triggerRequestCalendarRelations$.subscribe(result => resultFromEffect = result);

        actions.next(new MilestoneActions.Request.AllFulfilled(milestoneListResource));
        actions.next(new MilestoneActions.Request.AllFulfilled(milestoneListResource));

        expect(resultFromEffect).toBeNull();

        tick(TRIGGER_REQUEST_CALENDAR_RELATIONS_ACTIONS_BUFFER_TIME);

        expect(resultFromEffect).toEqual(expectedResult);
        subscription.unsubscribe();
    }));
});
