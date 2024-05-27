/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {
    cloneDeep,
    uniqBy,
} from 'lodash';
import * as moment from 'moment';
import {take} from 'rxjs/operators';

import {
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_RESOURCE_CRAFT,
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS,
    MOCK_MILESTONE_RESOURCE_WORKAREA,
} from '../../../../../test/mocks/milestones';
import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2,
    MOCK_RELATION_RESOURCE_3
} from '../../../../../test/mocks/relations';
import {
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCE_B,
    MOCK_TASK_SCHEDULE_WITHOUT_SLOTS
} from '../../../../../test/mocks/task-schedules';
import {
    MOCK_TASK,
    MOCK_TASK_2,
    MOCK_TASK_3,
    MOCK_TASK_RESOURCE,
    MOCK_TASK_RESOURCE_2,
    MOCK_TASK_RESOURCE_3,
} from '../../../../../test/mocks/tasks';
import {State} from '../../../../app.reducers';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {TaskEntity} from '../../entities/task/task.entity';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {RelationWithResource} from '../../models/relation-with-resource/relation-with-resource';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {Task} from '../../models/tasks/task';
import {MILESTONE_SLICE_INITIAL_STATE} from '../milestones/milestone.initial-state';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from '../task-schedules/task-schedule.initial-state';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from '../tasks/task.initial-state';
import {RELATION_INITIAL_STATE} from './relation.initial-state';
import {
    RelationQueries,
    RelationResourceDirection,
} from './relation.queries';

describe('Relation Queries', () => {
    let relationQueries: RelationQueries;
    let store: MockStore;

    const milestoneId = MOCK_MILESTONE_HEADER.id;
    const taskId = MOCK_TASK.id;
    const milestonesResources: MilestoneResource[] = [
        MOCK_MILESTONE_RESOURCE_HEADER,
        MOCK_MILESTONE_RESOURCE_CRAFT,
    ];
    const milestones: Milestone[] = milestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
    const tasksResources: TaskResource[] = [
        MOCK_TASK_RESOURCE,
        MOCK_TASK_RESOURCE_2,
        MOCK_TASK_RESOURCE_3,
    ];
    const taskEntities = tasksResources.map(task => TaskEntity.fromResource(task));
    const taskSchedulesResources: TaskScheduleResource[] = [
        {
            ...MOCK_TASK_SCHEDULE_RESOURCE_A,
            task: new ResourceReference(MOCK_TASK_RESOURCE.id, ''),
        },
        {
            ...MOCK_TASK_SCHEDULE_RESOURCE_B,
            task: new ResourceReference(MOCK_TASK_RESOURCE_2.id, ''),
        },
        {
            ...MOCK_TASK_SCHEDULE_WITHOUT_SLOTS,
            task: new ResourceReference(MOCK_TASK_RESOURCE_3.id, ''),
        },
    ];
    const taskSchedulesEntities = taskSchedulesResources.map(taskSchedule => TaskScheduleEntity.fromResource(taskSchedule));
    const taskSchedules: TaskSchedule[] = taskSchedulesEntities.map(taskSchedule => TaskSchedule.fromTaskScheduleEntity(taskSchedule));
    const tasks: Task[] = taskEntities
        .map((task, i) => Task.fromTaskEntity(task, taskSchedules[i]));
    const partOfRelations: RelationResource[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        },
        {
            ...MOCK_RELATION_RESOURCE_2,
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        },
        {
            ...MOCK_RELATION_RESOURCE_3,
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_3.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'foo',
            type: RelationTypeEnum.PartOf,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_CRAFT.id),
        },
    ];
    const finishToStartRelations: RelationResource[] = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-1',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-2',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-3',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_CRAFT.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-4',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_CRAFT.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-5',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_CRAFT.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-6',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_2.id),
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-7',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_CRAFT.id),
        },
    ];

    const notCriticalFinishToStartRelations = [
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-8',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_WORKAREA.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS.id),
            critical: false,
        },
        {
            ...MOCK_RELATION_RESOURCE_1,
            id: 'finish-to-start-relation-9',
            type: RelationTypeEnum.FinishToStart,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_RESOURCE_WORKAREA.id),
            critical: false,
        },
    ];

    const mapTaskResourcesAndTaskSchedulesResourcesToTasks =
        (tasksEntities: TaskEntity[], taskSchedulesEntitiesList: TaskScheduleEntity[]) =>
            taskSchedulesEntitiesList.map(taskScheduleEntity => {
                const taskEntity = tasksEntities.find(task => task.id === taskScheduleEntity.task.id);
                const taskSchedule = TaskSchedule.fromTaskScheduleEntity(taskScheduleEntity);
                return Task.fromTaskEntity(taskEntity, taskSchedule);
            });

    const getCharFromZtoA = (charAtIndex: number): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyz'
            .split('')
            .reverse();
        return chars[charAtIndex];
    };

    const getTaskRelations = (id: string, relationList: RelationResource[], taskList: Task[]): RelationWithResource<Task>[] =>
        relationList
            .filter(relation => relation.target.id === id)
            .map(relation => {
                const task = taskList.find(item => item.id === relation.source.id);
                return RelationWithResource.fromRelationAndResource<Task>(task, relation, ObjectTypeEnum.Task);
            });

    const getMilestones = (id: string, relationList: RelationResource[], milestoneList: Milestone[]): Milestone[] =>
        relationList
            .filter(relation => relation.source.id === id)
            .map(relation => milestoneList.find(milestone => milestone.id === relation.target.id));

    const getRelationsWithResourcesFromRelationList = (relationList: RelationResource[],
                                                       milestoneList: Milestone[],
                                                       taskList: Task[],
                                                       direction: RelationResourceDirection): RelationWithResource<Task | Milestone>[] =>
        relationList.map(relation => {
            const {id, type} = relation[direction];
            const resource = type === ObjectTypeEnum.Milestone
                ? milestoneList.find(milestone => milestone.id === id)
                : taskList.find(task => task.id === id);

            return RelationWithResource.fromRelationAndResource<Task | Milestone>(resource, relation, type);
        });

    const getMilestonePredecessors = (id: string,
                                      milestoneList: Milestone[],
                                      taskList: Task[]): RelationWithResource<Task | Milestone>[] => {
        const milestoneIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id);
        const relationList = finishToStartRelations.filter(relation => milestoneIdentifierPair.isSame(relation.target));

        return getRelationsWithResourcesFromRelationList(relationList, milestoneList, taskList, 'source');
    };

    const getMilestoneSuccessors = (id: string,
                                    milestoneList: Milestone[],
                                    taskList: Task[]): RelationWithResource<Task | Milestone>[] => {
        const milestoneIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, id);
        const relationList = finishToStartRelations.filter(relation => milestoneIdentifierPair.isSame(relation.source));

        return getRelationsWithResourcesFromRelationList(relationList, milestoneList, taskList, 'target');
    };
    const getTaskPredecessors = (id: string,
                                 milestoneList: Milestone[],
                                 taskList: Task[]): RelationWithResource<Task | Milestone>[] => {
        const taskIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, id);
        const relationList = finishToStartRelations.filter(relation => taskIdentifierPair.isSame(relation.target));

        return getRelationsWithResourcesFromRelationList(relationList, milestoneList, taskList, 'source');
    };
    const getTaskSuccessors = (id: string,
                               milestoneList: Milestone[],
                               taskList: Task[]): RelationWithResource<Task | Milestone>[] => {
        const taskIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, id);
        const relationList = finishToStartRelations.filter(relation => taskIdentifierPair.isSame(relation.source));

        return getRelationsWithResourcesFromRelationList(relationList, milestoneList, taskList, 'target');
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            milestoneSlice: {
                ...MILESTONE_SLICE_INITIAL_STATE,
                items: milestonesResources,
            },
            relationSlice: {
                ...RELATION_INITIAL_STATE,
                items: [
                    ...partOfRelations,
                    ...finishToStartRelations,
                ],
                lists: {
                    [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                        requestStatus: RequestStatusEnum.success,
                        ids: partOfRelations.map(relation => relation.id),
                    }),
                    [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                        requestStatus: RequestStatusEnum.success,
                        ids: finishToStartRelations.map(relation => relation.id),
                    }),
                } as any,
            },
            projectTaskSlice: {
                ...PROJECT_TASK_SLICE_INITIAL_STATE,
                items: taskEntities,
            },
            taskScheduleSlice: {
                ...TASK_SCHEDULE_SLICE_INITIAL_STATE,
                items: taskSchedulesEntities,
            },
        },
    };
    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            RelationQueries,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        relationQueries = TestBed.inject(RelationQueries);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => store.setState(initialState));

    it('should observe PART_OF relations by Milestone Id when relations are different then previous', () => {
        const results: RelationResource[][] = [];
        const newState = cloneDeep(initialState);
        const firstResult = partOfRelations.filter(relation => relation.target.id === milestoneId);
        const secondResult = firstResult.filter((relation, index) => index !== 0);

        relationQueries.observePartOfRelationsByMilestoneId(milestoneId)
            .pipe(take(2))
            .subscribe(result => results.push(result));

        newState.projectModule.relationSlice.items = secondResult;
        newState.projectModule.relationSlice.lists[RelationTypeEnum.PartOf].ids = secondResult.map(relation => relation.id);

        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(firstResult);
        expect(results[1]).toEqual(secondResult);
    });

    it('should observe PART_OF relations by Milestone Id when relations are the same as previous', () => {
        const results: RelationResource[][] = [];
        const newState = cloneDeep(initialState);
        const firstResult = partOfRelations.filter(relation => relation.target.id === milestoneId);

        relationQueries.observePartOfRelationsByMilestoneId(milestoneId)
            .pipe(take(2))
            .subscribe(result => results.push(result));

        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(firstResult);
    });

    it('should observe PART_OF relations by Task Id when relations are different then previous', () => {
        const results: RelationResource[][] = [];
        const newState = cloneDeep(initialState);
        const firstResult = partOfRelations.filter(relation => relation.source.id === taskId);
        const secondResult = firstResult.filter((relation, index) => index !== 0);

        relationQueries.observePartOfRelationsByTaskId(taskId)
            .pipe(take(2))
            .subscribe(result => results.push(result));

        newState.projectModule.relationSlice.items = secondResult;
        newState.projectModule.relationSlice.lists[RelationTypeEnum.PartOf].ids = secondResult.map(relation => relation.id);

        setStoreState(newState);

        expect(results.length).toBe(2);
        expect(results[0]).toEqual(firstResult);
        expect(results[1]).toEqual(secondResult);
    });

    it('should observe PART_OF relations by Task Id when relations are the same as previous', () => {
        const results: RelationResource[][] = [];
        const newState = cloneDeep(initialState);
        const firstResult = partOfRelations.filter(relation => relation.source.id === taskId);

        relationQueries.observePartOfRelationsByTaskId(taskId)
            .pipe(take(2))
            .subscribe(result => results.push(result));

        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(firstResult);
    });

    it('should observe Milestone Sub-Tasks relations by Milestone Id', () => {
        const expectedResult: RelationWithResource<Task>[] = getTaskRelations(milestoneId, partOfRelations, tasks);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Task Milestone relations by Task Id', () => {
        const expectedResult: Milestone[] = getMilestones(taskId, partOfRelations, milestones);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Milestone Sub-Tasks relations by Milestone Id when Task name changes', () => {
        const newState = cloneDeep(initialState);
        const newTasksEntities = cloneDeep(taskEntities);
        const expectedFirstResult: RelationWithResource<Task>[] = getTaskRelations(milestoneId, partOfRelations, tasks);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newTasksEntities.forEach(task => {
            task.name = 'foo';
        });

        const newTasks = mapTaskResourcesAndTaskSchedulesResourcesToTasks(newTasksEntities, taskSchedulesEntities);
        const expectedResultSecondResult = getTaskRelations(milestoneId, partOfRelations, newTasks);

        newState.projectModule.projectTaskSlice.items = newTasksEntities;

        setStoreState(newState);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResultSecondResult));
    });

    it('should observe Milestone Sub-Tasks relations by Milestone Id when Task Schedules changes', () => {
        const today = moment();
        const newState = cloneDeep(initialState);
        const newTaskSchedulesEntities = cloneDeep(taskSchedulesEntities);
        const expectedFirstResult: RelationWithResource<Task>[] = getTaskRelations(milestoneId, partOfRelations, tasks);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newTaskSchedulesEntities.forEach(taskSchedule => {
            taskSchedule.start = today.clone().subtract(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
            taskSchedule.end = today.clone().add(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        });

        const newTasks = mapTaskResourcesAndTaskSchedulesResourcesToTasks(taskEntities, newTaskSchedulesEntities);
        const expectedResultSecondResult = getTaskRelations(milestoneId, partOfRelations, newTasks);

        newState.projectModule.taskScheduleSlice.items = newTaskSchedulesEntities;

        setStoreState(newState);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResultSecondResult));
    });

    it('should observe Task Milestone relations by Task Id when Milestones date changes', () => {
        const today = moment();
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult: Milestone[] = getMilestones(taskId, partOfRelations, milestones);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach((milestone, i) => {
            milestone.date = today.clone().add(i + 1, 'y').toDate();
        });

        const expectedSecondResult: Milestone[] = newMilestonesResources
            .map(milestone => Milestone.fromMilestoneResource(milestone));

        newState.projectModule.milestoneSlice.items = newMilestonesResources;

        setStoreState(newState);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));
    });

    it('should observe Task Milestone relations by Task Id when Milestones name changes', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult: Milestone[] = getMilestones(taskId, partOfRelations, milestones);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach((milestone, i) => {
            milestone.name = getCharFromZtoA(i);
        });

        const expectedSecondResult: Milestone[] = newMilestonesResources
            .map(milestone => Milestone.fromMilestoneResource(milestone));

        newState.projectModule.milestoneSlice.items = newMilestonesResources;

        setStoreState(newState);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));
    });

    it('should observe Task Milestone relations by Task Id and return Milestones only when there are data of all Task Milestones', () => {
        const results = [];
        const newMilestonesResources = cloneDeep(milestonesResources);
        const newState = cloneDeep(initialState);
        const expectedResult: Milestone[] = getMilestones(taskId, partOfRelations, milestones);
        const incompleteMilestoneResources = [newMilestonesResources[0]];

        newState.projectModule.milestoneSlice.items = incompleteMilestoneResources;
        setStoreState(newState);

        relationQueries.observeRelationsTaskMilestonesByTaskId(taskId)
            .subscribe(result => results.push(result));

        expect(results.length).toBe(0);

        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(expectedResult);
    });

    it('should observe Milestone Sub-Tasks relations by Milestone Id and return Task Relations ' +
        'only when all Tasks have Task Schedules', () => {
        const results = [];
        const today = moment();
        const newState = cloneDeep(initialState);
        const newTaskSchedulesEntities = cloneDeep(taskSchedulesEntities);
        const expectedFirstResult: RelationWithResource<Task>[] = getTaskRelations(milestoneId, partOfRelations, tasks);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .subscribe(items => results.push(items));

        expect(results.length).toEqual(1);
        expect(results[0]).toEqual(expectedFirstResult);

        const removedTaskSchedule = newTaskSchedulesEntities.shift();

        newState.projectModule.taskScheduleSlice.items = newTaskSchedulesEntities;
        setStoreState(newState);
        expect(results.length).toEqual(1);
        expect(results[0]).toEqual(expectedFirstResult);

        removedTaskSchedule.start = today.clone().subtract(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        removedTaskSchedule.end = today.clone().add(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        const editedTaskSchedules = [...newTaskSchedulesEntities, removedTaskSchedule];
        const newTasks: Task[] = mapTaskResourcesAndTaskSchedulesResourcesToTasks(taskEntities, editedTaskSchedules);
        const expectedSecondResult: RelationWithResource<Task>[] = getTaskRelations(milestoneId, partOfRelations, newTasks);

        newState.projectModule.taskScheduleSlice.items = editedTaskSchedules;
        setStoreState(newState);
        expect(results.length).toEqual(2);
        expect(results[1]).toEqual(expectedSecondResult);
    });

    it('should observe Milestone Sub-Tasks relations by Milestone Id and return empty array when there are no relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = [];

        newState.projectModule.relationSlice.items = [];

        setStoreState(newState);

        relationQueries.observeRelationsMilestoneSubtasksByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe PART_OF relations request status', () => {
        relationQueries.observePartOfRelationsRequestStatus()
            .subscribe(result => expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe relation by id', () => {
        const relation = partOfRelations[0];

        relationQueries
            .observeRelationById(relation.id)
            .subscribe((result: RelationResource) => expect(result).toEqual(relation));
    });

    it('should observe FINISH_TO_START predecessor relations by Milestone Id', () => {
        const milestoneIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const expectedResult = finishToStartRelations.filter(relation => milestoneIdentifierPair.isSame(relation.target));

        relationQueries.observeFinishToStartPredecessorRelationsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe FINISH_TO_START predecessor relations by Task Id', () => {
        const taskIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult = finishToStartRelations.filter(relation => taskIdentifierPair.isSame(relation.target));

        relationQueries.observeFinishToStartPredecessorRelationsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe FINISH_TO_START successor relations by Milestone Id', () => {
        const milestoneIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestoneId);
        const expectedResult = finishToStartRelations.filter(relation => milestoneIdentifierPair.isSame(relation.source));

        relationQueries.observeFinishToStartSuccessorRelationsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe FINISH_TO_START successor relations by Task Id', () => {
        const taskIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId);
        const expectedResult = finishToStartRelations.filter(relation => taskIdentifierPair.isSame(relation.source));

        relationQueries.observeFinishToStartSuccessorRelationsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should observe FINISH_TO_START Criticality when there are critical relations', () => {
        const expectedResult = true;

        relationQueries.observeFinishToStartRelationsCriticalityByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toBe(expectedResult));
    });

    it('should observe FINISH_TO_START Criticality return false when there are no critical relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = false;

        newState.projectModule.relationSlice.items = notCriticalFinishToStartRelations;
        newState.projectModule.relationSlice.lists[RelationTypeEnum.FinishToStart] = {
            requestStatus: RequestStatusEnum.success,
            ids: notCriticalFinishToStartRelations.map(relation => relation.id),
        };

        setStoreState(newState);

        relationQueries.observeFinishToStartRelationsCriticalityByMilestoneId(MOCK_MILESTONE_RESOURCE_WORKAREA.id)
            .pipe(take(1))
            .subscribe(items => expect(items).toBe(expectedResult));
    });

    it('should observe the Resources associated with a Relation when the resources are sources of the relation', () => {
        const relationDirection = 'source';
        const expectedResult = getRelationsWithResourcesFromRelationList(finishToStartRelations, milestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(finishToStartRelations, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe the Resources associated with a Relation when the resources are targets of the relation', () => {
        const relationDirection = 'target';
        const expectedResult = getRelationsWithResourcesFromRelationList(finishToStartRelations, milestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(finishToStartRelations, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe the Resources associated with a Relation and return empty array when there are no relations', () => {
        const expectedResult = [];
        const relationList = [];

        relationQueries.observeResourcesByRelationList(relationList, 'source')
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe the Resources associated with a Relation and emit new value when Task name changes', () => {
        const newState = cloneDeep(initialState);
        const newTaskEntities = cloneDeep(taskEntities);
        const relationDirection = 'target';
        const relationList = finishToStartRelations;
        const expectedFirstResult = getRelationsWithResourcesFromRelationList(relationList, milestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newTaskEntities.forEach(task => task.name = 'foo');
        newState.projectModule.projectTaskSlice.items = newTaskEntities;
        setStoreState(newState);

        const newTasks = mapTaskResourcesAndTaskSchedulesResourcesToTasks(newTaskEntities, taskSchedulesEntities);
        const expectedSecondResult = getRelationsWithResourcesFromRelationList(relationList, milestones, newTasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));
    });

    it('should observe the Resources associated with a Relation and emit new value when Task schedule changes', () => {
        const newState = cloneDeep(initialState);
        const newTaskSchedulesEntities = cloneDeep(taskSchedulesEntities);
        const relationDirection = 'target';
        const relationList = finishToStartRelations;
        const expectedFirstResult = getRelationsWithResourcesFromRelationList(relationList, milestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newTaskSchedulesEntities.forEach(taskSchedule =>
            taskSchedule.start = moment().subtract(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT));
        newState.projectModule.taskScheduleSlice.items = newTaskSchedulesEntities;
        setStoreState(newState);

        const newTasks = mapTaskResourcesAndTaskSchedulesResourcesToTasks(taskEntities, newTaskSchedulesEntities);
        const expectedSecondResult = getRelationsWithResourcesFromRelationList(relationList, milestones, newTasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));
    });

    it('should observe the Resources associated with a Relation and emit new value when Milestone date changes', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const relationDirection = 'target';
        const relationList = finishToStartRelations;
        const expectedFirstResult = getRelationsWithResourcesFromRelationList(relationList, milestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach(milestone => milestone.date = moment().add(1, 'y').toDate());
        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        const newMilestones = newMilestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
        const expectedSecondResult = getRelationsWithResourcesFromRelationList(relationList, newMilestones, tasks, relationDirection);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));
    });

    it('should observe the Resources associated with a Relation and only return when all Tasks have schedule', () => {
        const results = [];
        const today = moment();
        const newState = cloneDeep(initialState);
        const newTaskSchedulesEntities = cloneDeep(taskSchedulesEntities);
        const relationDirection = 'source';
        const relationList = finishToStartRelations;

        const removedTaskSchedule = newTaskSchedulesEntities.shift();

        newState.projectModule.taskScheduleSlice.items = newTaskSchedulesEntities;
        setStoreState(newState);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .subscribe(items => results.push(items));

        removedTaskSchedule.start = today.clone().subtract(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        removedTaskSchedule.end = today.clone().add(1, 'y').format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        const editedTaskSchedules = [...newTaskSchedulesEntities, removedTaskSchedule];
        const newTasks: Task[] = mapTaskResourcesAndTaskSchedulesResourcesToTasks(taskEntities, editedTaskSchedules);
        const expectedResult = getRelationsWithResourcesFromRelationList(relationList, milestones, newTasks, relationDirection);

        newState.projectModule.taskScheduleSlice.items = editedTaskSchedules;
        setStoreState(newState);

        expect(results.length).toEqual(1);
        expect(results[0]).toEqual(expectedResult);
    });

    it('should observe the Resources associated with a Relation and only return when there are data of all Milestones', () => {
        const results = [];
        const newMilestonesResources = cloneDeep(milestonesResources);
        const newState = cloneDeep(initialState);
        const relationDirection = 'source';
        const relationList = finishToStartRelations;
        const expectedResult = getRelationsWithResourcesFromRelationList(relationList, milestones, tasks, relationDirection);

        newState.projectModule.milestoneSlice.items = [newMilestonesResources[0]];
        setStoreState(newState);

        relationQueries.observeResourcesByRelationList(relationList, relationDirection)
            .subscribe(result => results.push(result));

        expect(results.length).toBe(0);

        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(expectedResult);
    });

    it('should observe Milestone Predecessors when there are relations', () => {
        const expectedResult = getMilestonePredecessors(milestoneId, milestones, tasks);

        relationQueries.observeRelationsMilestonePredecessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Milestone Predecessors when there are no relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = [];

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsMilestonePredecessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Milestone Predecessors when relations and resources change', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult = getMilestonePredecessors(milestoneId, milestones, tasks);
        const expectedThirdResult = [];

        relationQueries.observeRelationsMilestonePredecessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach(milestone => milestone.date = moment().add(1, 'y').toDate());
        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        const newMilestones = newMilestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
        const expectedSecondResult = getMilestonePredecessors(milestoneId, newMilestones, tasks);

        relationQueries.observeRelationsMilestonePredecessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsMilestonePredecessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedThirdResult));
    });

    it('should observe Task Predecessors when there are relations', () => {
        const expectedResult = getTaskPredecessors(taskId, milestones, tasks);

        relationQueries.observeRelationsTaskPredecessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Task Predecessors when there are no relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = [];

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsTaskPredecessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Task Predecessors when relations and resources change', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult = getTaskPredecessors(taskId, milestones, tasks);
        const expectedThirdResult = [];

        relationQueries.observeRelationsTaskPredecessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach(milestone => milestone.date = moment().add(1, 'y').toDate());
        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        const newMilestones = newMilestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
        const expectedSecondResult = getTaskPredecessors(taskId, newMilestones, tasks);

        relationQueries.observeRelationsTaskPredecessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsTaskPredecessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedThirdResult));
    });

    it('should observe Milestone Successors when there are relations', () => {
        const expectedResult = getMilestoneSuccessors(milestoneId, milestones, tasks);

        relationQueries.observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Milestone Successors when there are no relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = [];

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Milestone Successors when relations and resources change', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult = getMilestoneSuccessors(milestoneId, milestones, tasks);
        const expectedThirdResult = [];

        relationQueries.observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach(milestone => milestone.date = moment().add(1, 'y').toDate());
        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        const newMilestones = newMilestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
        const expectedSecondResult = getMilestoneSuccessors(milestoneId, newMilestones, tasks);

        relationQueries.observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsMilestoneSuccessorsByMilestoneId(milestoneId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedThirdResult));
    });

    it('should observe Task Successors when there are relations', () => {
        const expectedResult = getTaskSuccessors(taskId, milestones, tasks);

        relationQueries.observeRelationsTaskSuccessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Task Successors when there are no relations', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = [];

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsTaskSuccessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedResult));
    });

    it('should observe Task Successors when relations and resources change', () => {
        const newState = cloneDeep(initialState);
        const newMilestonesResources = cloneDeep(milestonesResources);
        const expectedFirstResult = getTaskSuccessors(taskId, milestones, tasks);
        const expectedThirdResult = [];

        relationQueries.observeRelationsTaskSuccessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedFirstResult));

        newMilestonesResources.forEach(milestone => milestone.date = moment().add(1, 'y').toDate());
        newState.projectModule.milestoneSlice.items = newMilestonesResources;
        setStoreState(newState);

        const newMilestones = newMilestonesResources.map(milestone => Milestone.fromMilestoneResource(milestone));
        const expectedSecondResult = getTaskSuccessors(taskId, newMilestones, tasks);

        relationQueries.observeRelationsTaskSuccessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedSecondResult));

        newState.projectModule.relationSlice.items = [];
        setStoreState(newState);

        relationQueries.observeRelationsTaskSuccessorsByTaskId(taskId)
            .pipe(take(1))
            .subscribe(items => expect(items).toEqual(expectedThirdResult));
    });

    it('should observe FINISH_TO_START relations request status', () => {
        relationQueries.observeFinishToStartRelationsRequestStatus()
            .subscribe(result => expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe FINISH_TO_START relations', () => {
        const newState = cloneDeep(initialState);
        const results: RelationResource[][] = [];
        const newFinishToStartRelation = {...MOCK_RELATION_RESOURCE_1, id: 'new-relation', type: RelationTypeEnum.FinishToStart};
        const updatedFinishToStartRelationsWithNewRelation = [...finishToStartRelations, newFinishToStartRelation];
        const relationToUpdate = finishToStartRelations[0];
        const updatedRelation = {...relationToUpdate, id: relationToUpdate.id, version: relationToUpdate.version + 1};
        const updatedFinishToStartRelationsWithUpdateRelation =
            uniqBy([updatedRelation, ...finishToStartRelations], (relation => relation.id));
        const expectedFirstResult = finishToStartRelations;
        const expectedSecondResult = updatedFinishToStartRelationsWithUpdateRelation;
        const expectedThirdResult = updatedFinishToStartRelationsWithNewRelation;

        relationQueries.observeFinishToStartRelations()
            .subscribe(result => results.push(result));

        setStoreState(newState);

        newState.projectModule.relationSlice.items = [...partOfRelations, ...updatedFinishToStartRelationsWithUpdateRelation];
        setStoreState(newState);

        newState.projectModule.relationSlice.items = [...partOfRelations, ...updatedFinishToStartRelationsWithNewRelation];
        newState.projectModule.relationSlice.lists[RelationTypeEnum.FinishToStart].ids =
            updatedFinishToStartRelationsWithNewRelation.map(relation => relation.id);
        setStoreState(newState);

        const firstResult = results[0] as RelationResource[];
        const secondResult = results[1] as RelationResource[];
        const thirdResult = results[2] as RelationResource[];

        expect(results.length).toBe(3);
        expect(firstResult).toEqual(expectedFirstResult);
        expect(secondResult).toEqual(expectedSecondResult);
        expect(thirdResult).toEqual(expectedThirdResult);
    });

    it('should observe critical relations', () => {
        const expectedResult = finishToStartRelations.filter(relation => relation.critical);

        relationQueries.observeCriticalRelations()
            .subscribe(result => expect(result).toEqual(expectedResult));
    });
});
