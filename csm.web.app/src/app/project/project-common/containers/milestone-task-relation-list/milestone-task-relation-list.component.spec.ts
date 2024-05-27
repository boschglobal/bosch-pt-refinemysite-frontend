/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    BehaviorSubject,
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_MILESTONE_CRAFT} from '../../../../../test/mocks/milestones';
import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2,
} from '../../../../../test/mocks/relations';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK,
    MOCK_TASK_2,
    MOCK_TASK_3,
} from '../../../../../test/mocks/tasks';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B
} from '../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {GroupListSelectionComponent} from '../../../../shared/ui/group-list-selection/group-list-selection.component';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
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
import {RelationActions} from '../../store/relations/relation.actions';
import {RelationQueries} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    DELETE_TASK_RELATION_ITEM_ID,
    MilestoneTask,
    MilestoneTaskRelationListComponent,
} from './milestone-task-relation-list.component';
import {MilestoneTaskRelationListTestComponent} from './milestone-task-relation-list.test.component';
import SpyObj = jasmine.SpyObj;
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';

describe('Milestone Task Relation List Component', () => {
    let component: MilestoneTaskRelationListComponent;
    let testHostComp: MilestoneTaskRelationListTestComponent;
    let fixture: ComponentFixture<MilestoneTaskRelationListTestComponent>;
    let store: Store<State>;
    let breakpointHelper: SpyObj<BreakpointHelper>;
    let de: DebugElement;

    const workareas: WorkareaResource[] = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
    ];

    const milestoneTaskRelationListComponentSelector = 'ss-milestone-task-relation-list';
    const milestoneTaskRelationListSelector = '[data-automation="ss-milestone-task-relation-list"]';
    const milestoneTaskRelationListAddButtonSelector = '[data-automation="ss-milestone-task-relation-list-add-button"]';
    const milestoneTaskRelationListLoadingSelector = '[data-automation="ss-milestone-task-relation-list-loading"]';

    const relationQueriesMock: RelationQueries = mock(RelationQueries);
    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const workareaQueries: WorkareaQueries = mock(WorkareaQueries);
    const milestone = MOCK_MILESTONE_CRAFT;
    const milestoneWithoutUpdatePermission: Milestone = {
        ...milestone,
        permissions: {
            ...milestone.permissions,
            canUpdate: false,
        },
    };
    const tasks = [
        MOCK_TASK,
        MOCK_TASK_2,
        MOCK_TASK_3,
    ];
    const taskRelations: RelationWithResource<Task>[] = tasks
        .map(task => RelationWithResource.fromRelationAndResource<Task>(task, MOCK_RELATION_RESOURCE_2, ObjectTypeEnum.Task));
    const relations: RelationResource[] = [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ];

    const breakpointChangeSubject = new Subject<string>();
    const relationsMilestoneTasksSubject = new Subject<RelationWithResource<Task>[]>();
    const partOfRelationsSubject = new Subject<RelationResource[]>();
    const partOfRelationsRequestStatusSubject = new Subject<RequestStatusEnum>();
    const calendarSelectionItemsIdsByTaskSubject = new BehaviorSubject<string[]>([]);
    const calendarSelectionIsModeActiveObservable: Subject<boolean> = new Subject<boolean>();

    const getDocumentElement = (selector: string): HTMLElement => document.querySelector(selector);
    const getElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector));
    const getDeleteTaskRelationItem = (relation: RelationWithResource<Task>): MenuItem => ({
        id: DELETE_TASK_RELATION_ITEM_ID,
        type: 'button',
        label: 'MilestoneTaskRelation_Delete_Label',
        value: relation,
    });

    const milestoneSubTaskRelationGroupId = 'ss-milestone-subTask-relation-groupId';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        declarations: [
            GroupListSelectionComponent,
            MilestoneTaskRelationListComponent,
            MilestoneTaskRelationListTestComponent,
        ],
        providers: [
            {
                provide: CalendarSelectionQueries,
                useFactory: () => instance(calendarSelectionQueriesMock),
            },
            {
                provide: RelationQueries,
                useFactory: () => instance(relationQueriesMock),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: BreakpointHelper,
                useValue: jasmine.createSpyObj('BreakpointHelper', ['breakpointChange', 'isCurrentBreakpoint']),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneTaskRelationListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(milestoneTaskRelationListComponentSelector));
        component = de.componentInstance;

        breakpointHelper = TestBed.inject(BreakpointHelper) as SpyObj<BreakpointHelper>;
        store = TestBed.inject(Store);

        when(relationQueriesMock.observeRelationsMilestoneSubtasksByMilestoneId(milestone.id)).thenReturn(relationsMilestoneTasksSubject);
        when(relationQueriesMock.observePartOfRelationsByMilestoneId(milestone.id)).thenReturn(partOfRelationsSubject);
        when(relationQueriesMock.observePartOfRelationsRequestStatus()).thenReturn(partOfRelationsRequestStatusSubject);
        when(workareaQueries.observeWorkareas()).thenReturn(of(workareas));
        when(calendarSelectionQueriesMock.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task))
            .thenReturn(calendarSelectionItemsIdsByTaskSubject);
        when(calendarSelectionQueriesMock.observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.TasksOfMilestones))
            .thenReturn(calendarSelectionIsModeActiveObservable);
        breakpointHelper.breakpointChange.and.returnValue(breakpointChangeSubject);

        testHostComp.milestone = milestone;
        fixture.detectChanges();

        component.ngOnInit();
    });

    it('should create a group with the provided tasks when observeRelationsMilestoneSubtasksByMilestoneId emits', () => {
        const tasksFromRelations = taskRelations.map(({resource}) => resource);
        const sortedTasks = TaskSortHelper.sortForRelationList(tasksFromRelations, workareas);
        const sortedGroupItems = sortedTasks.map(task => taskRelations.find(taskRelation => taskRelation.resource.id === task.id));

        const expectedGroup: GroupItem<MilestoneTask>[] = [{
            id: milestoneSubTaskRelationGroupId,
            items: sortedGroupItems.map(({resource}) => ({task: resource, id: resource.id, actions: []})),
        }];

        relationsMilestoneTasksSubject.next(taskRelations);

        expect(component.groups).toEqual(expectedGroup);
    });

    it('should create a group without tasks when observePartOfRelationsByMilestoneId emits' +
        ' and observeRelationsMilestoneSubtasksByMilestoneId not emitted yet', () => {
        const expectedGroups: GroupItem<MilestoneTask>[] = [{
            id: milestoneSubTaskRelationGroupId,
            items: relations.map(relation => ({id: relation.id, task: null, actions: []})),
        }];

        partOfRelationsSubject.next(relations);

        expect(component.groups).toEqual(expectedGroups);
    });

    it('should add the deletion action to the relations that can be deleted', () => {
        const taskRelationWithDeletePermissions: RelationWithResource<Task> = {
            ...taskRelations[0],
            permissions: {
                canDelete: true,
            },
        };

        relationsMilestoneTasksSubject.next([taskRelationWithDeletePermissions]);

        expect(component.groups[0].items[0].actions).not.toEqual([]);
    });

    it('should dispatch RelationActions.Delete.One action when delete button is clicked', () => {
        const taskRelationWithDeletePermission: RelationWithResource<Task> = {
            ...taskRelations[0],
            permissions: {
                canDelete: true,
            },
        };
        const {id, version} = taskRelationWithDeletePermission;
        const expectedAction = new RelationActions.Delete.One(id, version, 'MilestoneTaskRelation_DeleteOne_SuccessMessage');

        spyOn(store, 'dispatch');

        relationsMilestoneTasksSubject.next([taskRelationWithDeletePermission]);
        component.handleActionClicked(getDeleteTaskRelationItem(taskRelationWithDeletePermission));

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not display the add relation button when the user have permissions to update the milestone' +
        ' and the screen size is xs', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(true);
        component.ngOnInit();

        expect(getDocumentElement(milestoneTaskRelationListAddButtonSelector)).toBeFalsy();
    });

    it('should display the add relation button when the user have permissions to update the milestone, the screen size is xl' +
        ' and the component is not loading', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.empty);

        expect(getDocumentElement(milestoneTaskRelationListAddButtonSelector)).toBeTruthy();
    });

    it('should not display the add relation button when the user have permissions to update the milestone, the screen size is xl' +
        ' and the component is loading', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        component.handleAddTask();
        component.multipleSelectionToolbarData.submitSelection();
        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getDocumentElement(milestoneTaskRelationListAddButtonSelector)).toBeFalsy();
    });

    it('should not display the add relation button when the user does not have permissions to update the milestone' +
        ' and the screen size is xl', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        testHostComp.milestone = milestoneWithoutUpdatePermission;
        fixture.detectChanges();

        expect(getDocumentElement(milestoneTaskRelationListAddButtonSelector)).toBeFalsy();
    });

    it('should not display the add relation button when the user does not have permissions to update the milestone' +
        ' and the screen size is xs', () => {
        testHostComp.milestone = milestoneWithoutUpdatePermission;
        breakpointHelper.isCurrentBreakpoint.and.returnValue(true);
        breakpointChangeSubject.next('xs');
        fixture.detectChanges();

        expect(getDocumentElement(milestoneTaskRelationListAddButtonSelector)).toBeFalsy();
    });

    it('should set the multipleSelectionToolbarData when the add relation button is clicked', () => {
        expect(component.multipleSelectionToolbarData).toBeNull();

        component.handleAddTask();

        expect(component.multipleSelectionToolbarData).not.toBeNull();
        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);
    });

    it('should unset the multipleSelectionToolbarData when the submitSelection is called', () => {
        component.handleAddTask();
        calendarSelectionItemsIdsByTaskSubject.next([]);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        component.multipleSelectionToolbarData.submitSelection();

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should unset the multipleSelectionToolbarData when the dismissSelection is called', () => {
        component.handleAddTask();
        calendarSelectionItemsIdsByTaskSubject.next([]);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        component.multipleSelectionToolbarData.dismissSelection();

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should display the milestone task relation list when the user have permissions to update the milestone and' +
        ' there are no tasks of the milestone', () => {
        expect(getElement(milestoneTaskRelationListSelector)).toBeTruthy();
    });

    it('should display the milestone task relation list when the user does not have permissions to update the milestone and' +
        ' there are tasks of the milestone', () => {
        partOfRelationsSubject.next(relations);
        testHostComp.milestone = milestoneWithoutUpdatePermission;
        fixture.detectChanges();

        expect(getElement(milestoneTaskRelationListSelector)).toBeTruthy();
    });

    it('should display the milestone task relation list when the user have permissions to update the milestone and' +
        ' there are tasks of the milestone', () => {
        partOfRelationsSubject.next(relations);

        expect(getElement(milestoneTaskRelationListSelector)).toBeTruthy();
    });

    it('should not display the milestone task relation list when the user does not have permissions to update the milestone and' +
        ' there are no tasks of the milestone', () => {
        testHostComp.milestone = milestoneWithoutUpdatePermission;
        fixture.detectChanges();

        expect(getElement(milestoneTaskRelationListSelector)).toBeFalsy();
    });

    it('should not display the loading when relation request status in not in progress and the component is not submitting', () => {
        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.empty);

        expect(getElement(milestoneTaskRelationListLoadingSelector)).toBeFalsy();
    });

    it('should not display the loading when relation request status is in progress and the component is not submitting', () => {
        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getElement(milestoneTaskRelationListLoadingSelector)).toBeFalsy();
    });

    it('should display the loading when relations request status is in progress and the component is submitting', () => {
        component.handleAddTask();
        calendarSelectionItemsIdsByTaskSubject.next([]);
        component.multipleSelectionToolbarData.submitSelection();
        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.progress);

        expect(getElement(milestoneTaskRelationListLoadingSelector)).toBeTruthy();

        partOfRelationsRequestStatusSubject.next(RequestStatusEnum.success);

        expect(getElement(milestoneTaskRelationListLoadingSelector)).toBeFalsy();
    });

    it('should dispatch RelationActions.Request.All action on ngOnInit', () => {
        const expectedPayload = SaveRelationFilters.forMilestoneSubtasksByMilestoneId(milestone.id);
        const expectedResult = new RelationActions.Request.All(expectedPayload, true);

        spyOn(store, 'dispatch').and.callThrough();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All on dismissSelection callback function call', () => {
        const expectedResult = new CalendarSelectionActions.Initialize.All();

        component.handleAddTask();

        spyOn(store, 'dispatch').and.callThrough();

        component.multipleSelectionToolbarData.dismissSelection();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch CalendarSelectionActions.Set.Selection on handleAddTask', () => {
        const expectedResult = new CalendarSelectionActions.Set.Selection(true, CalendarSelectionContextEnum.TasksOfMilestones, []);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleAddTask();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch RelationActions.Create.All and CalendarSelectionActions.Initialize.All when ' +
        'submitSelection is called', () => {
        const createRelationsPayload = tasks.map(task => SaveRelationResource.forMilestoneSubtask(milestone.id, task.id));
        const calendarSelectionTaskItemsIds = tasks.map(task => task.id);
        const expectedInitializeCalendarSelectionAction = new CalendarSelectionActions.Initialize.All();
        const expectedCreateRelationsAction =
            new RelationActions.Create.All(createRelationsPayload, 'MilestoneTaskRelation_CreateAll_SuccessMessage');

        component.handleAddTask();
        calendarSelectionItemsIdsByTaskSubject.next(calendarSelectionTaskItemsIds);

        spyOn(store, 'dispatch').and.callThrough();

        component.multipleSelectionToolbarData.submitSelection();

        expect(store.dispatch).toHaveBeenCalledTimes(2);
        expect(store.dispatch).toHaveBeenCalledWith(expectedCreateRelationsAction);
        expect(store.dispatch).toHaveBeenCalledWith(expectedInitializeCalendarSelectionAction);
    });

    it('should set multipleSelectionToolbarData when multi selection is enabled and there is a new set of selected tasks', () => {
        const calendarSelectionTaskItemsIds = tasks.map(task => task.id);

        component.handleAddTask();
        calendarSelectionItemsIdsByTaskSubject.next(calendarSelectionTaskItemsIds);

        expect(component.multipleSelectionToolbarData).not.toBeNull();
        expect(component.multipleSelectionToolbarData.itemsCount).toBe(tasks.length);
    });

    it('should not set multipleSelectionToolbarData when multi selection is not enabled and there is a new set of selected tasks', () => {
        const calendarSelectionTaskItemsIds = tasks.map(task => task.id);

        calendarSelectionItemsIdsByTaskSubject.next(calendarSelectionTaskItemsIds);

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should unset multipleSelectionToolbarData when calendar selection mode DEPENDENCIES changes from being active to inactive', () => {
        expect(component.multipleSelectionToolbarData).toBeNull();

        component.handleAddTask();

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        calendarSelectionIsModeActiveObservable.next(true);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        calendarSelectionIsModeActiveObservable.next(false);

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleTaskCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleTaskCardClicked(MOCK_TASK);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
