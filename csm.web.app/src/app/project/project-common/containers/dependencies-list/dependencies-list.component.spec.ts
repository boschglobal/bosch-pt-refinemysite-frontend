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
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA,
} from '../../../../../test/mocks/milestones';
import {MOCK_RELATION_RESOURCE_2} from '../../../../../test/mocks/relations';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK,
    MOCK_TASK_2,
} from '../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {
    GroupItem,
    GroupItemListComponent,
} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {GroupListSelectionComponent} from '../../../../shared/ui/group-list-selection/group-list-selection.component';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {MultipleSelectionToolbarConfirmationModeEnum} from '../../../../shared/ui/multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {Milestone} from '../../models/milestones/milestone';
import {RelationWithResource} from '../../models/relation-with-resource/relation-with-resource';
import {Task} from '../../models/tasks/task';
import {MilestoneOverviewCardComponent} from '../../presentationals/milestone-overview-card/milestone-overview-card.component';
import {TaskOverviewCardComponent} from '../../presentationals/task-overview-card/task-overview-card.component';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';
import {RelationActions} from '../../store/relations/relation.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    DELETE_DEPENDENCY_ITEM_ID,
    DEPENDENCIES_LIST_SUBMIT_PAYLOAD_BY_TYPE,
    DependenciesListComponent,
    DependenciesListRelationsObservables,
    Dependency,
    DependencyTypeEnum,
    MULTIPLE_SELECTION_TOOLBAR_TRANSLATIONS,
} from './dependencies-list.component';
import {DependenciesListTestComponent} from './dependencies-list.test.component';
import SpyObj = jasmine.SpyObj;

describe('Dependencies List Component', () => {
    let component: DependenciesListComponent;
    let testHostComp: DependenciesListTestComponent;
    let fixture: ComponentFixture<DependenciesListTestComponent>;
    let store: Store<State>;
    let breakpointHelper: SpyObj<BreakpointHelper>;
    let de: DebugElement;

    const mockCalendarSelectionQueries: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const workareaQueries: WorkareaQueries = mock(WorkareaQueries);

    const predecessorsGroupId = 'ss-dependencies-list-predecessors-groupId';
    const successorsGroupId = 'ss-dependencies-list-successors-groupId';
    const dependenciesListComponentSelector = 'ss-dependencies-list';
    const dependenciesListSelector = '[data-automation="ss-dependencies-list"]';
    const dependenciesListAddButtonSelector = '[data-automation="ss-dependencies-list-add-dropdown"]';
    const dependenciesListLoadingSelector = '[data-automation="ss-dependencies-list-loading"]';
    const predecessorItem: MenuItem = {
        id: DependencyTypeEnum.Predecessor,
        type: 'button',
        label: 'Generic_Predecessor',
        value: DependencyTypeEnum.Predecessor,
    };
    const successorItem: MenuItem = {
        id: DependencyTypeEnum.Successor,
        type: 'button',
        label: 'Generic_Successor',
        value: DependencyTypeEnum.Successor,
    };

    const calendarSelectionItemsObservable: Subject<ObjectIdentifierPair[]> = new Subject<ObjectIdentifierPair[]>();
    const calendarSelectionIsModeActiveObservable: Subject<boolean> = new Subject<boolean>();

    const predecessorRelationsWithResources: RelationWithResource<Task | Milestone>[] = [
        {
            id: 'finish-to-start-relation-1',
            version: 0,
            type: ObjectTypeEnum.Task,
            resource: MOCK_TASK,
            permissions: {canDelete: false},
            critical: true,
        },
        {
            id: 'finish-to-start-relation-2',
            version: 0,
            type: ObjectTypeEnum.Milestone,
            resource: MOCK_MILESTONE_HEADER,
            permissions: {canDelete: false},
            critical: false,
        },
    ];
    const predecessorRelations: RelationResource[] = predecessorRelationsWithResources
        .map(({id, resource, type}) => ({
            ...MOCK_RELATION_RESOURCE_2,
            id,
            source: new ObjectIdentifierPair(type, resource.id),
            target: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id),
        }));

    const successorRelationsWithResources: RelationWithResource<Task | Milestone>[] = [
        {
            id: 'finish-to-start-relation-3',
            version: 0,
            type: ObjectTypeEnum.Task,
            resource: MOCK_TASK_2,
            permissions: {canDelete: false},
            critical: false,
        },
        {
            id: 'finish-to-start-relation-4',
            version: 0,
            type: ObjectTypeEnum.Milestone,
            resource: MOCK_MILESTONE_WORKAREA,
            permissions: {canDelete: false},
            critical: true,
        },
    ];
    const successorRelations: RelationResource[] = successorRelationsWithResources
        .map(({id, resource, type}) => ({
            ...MOCK_RELATION_RESOURCE_2,
            id,
            source: new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id),
            target: new ObjectIdentifierPair(type, resource.id),
        }));

    const originator = new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo');
    const breakpointChangeSubject = new Subject<string>();
    const predecessorsObservable = new Subject<RelationResource[]>();
    const predecessorsWithResourcesObservable = new Subject<RelationWithResource<Task | Milestone>[]>();
    const requestStatusObservable = new Subject<RequestStatusEnum>();
    const successorsObservable = new Subject<RelationResource[]>();
    const successorsWithResourcesObservable = new Subject<RelationWithResource<Task | Milestone>[]>();
    const relationsObservables: DependenciesListRelationsObservables = {
        predecessorsObservable,
        predecessorsWithResourcesObservable,
        requestStatusObservable,
        successorsObservable,
        successorsWithResourcesObservable,
    };

    const getDocumentElement = (selector: string): HTMLElement => document.querySelector(selector);
    const getElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector));
    const getMilestoneOverviewCardElement = (milestoneId: string) =>
        getDocumentElement(`[data-automation="ss-dependencies-list-milestone-overview-card-${milestoneId}"]`);
    const getTaskOverviewCardElement = (taskId: string) =>
        getDocumentElement(`[data-automation="ss-dependencies-list-task-overview-card-${taskId}"]`);
    const getDeleteDependencyItem = (relation: RelationWithResource<Task | Milestone>): MenuItem => ({
        id: DELETE_DEPENDENCY_ITEM_ID,
        type: 'button',
        label: 'DependenciesList_DeleteOne_Label',
        value: relation,
    });

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        declarations: [
            DependenciesListComponent,
            DependenciesListTestComponent,
            GroupItemListComponent,
            GroupListSelectionComponent,
            MilestoneOverviewCardComponent,
            TaskOverviewCardComponent,
        ],
        providers: [
            {
                provide: CalendarSelectionQueries,
                useFactory: () => instance(mockCalendarSelectionQueries),
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
                useValue: instance(workareaQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(DependenciesListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(dependenciesListComponentSelector));
        component = de.componentInstance;

        breakpointHelper = TestBed.inject(BreakpointHelper) as SpyObj<BreakpointHelper>;
        store = TestBed.inject(Store);
        breakpointHelper.breakpointChange.and.returnValue(breakpointChangeSubject);
        testHostComp.canAddDependencies = true;
        testHostComp.relationsObservables = relationsObservables;
        testHostComp.originator = originator;

        when(workareaQueries.observeWorkareas()).thenReturn(of([]));
        when(mockCalendarSelectionQueries.observeCalendarSelectionItems()).thenReturn(calendarSelectionItemsObservable);
        when(mockCalendarSelectionQueries.observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.Dependencies))
            .thenReturn(calendarSelectionIsModeActiveObservable);

        fixture.detectChanges();

        predecessorsObservable.next([]);
        predecessorsWithResourcesObservable.next([]);
        requestStatusObservable.next(RequestStatusEnum.empty);
        successorsObservable.next([]);
        successorsWithResourcesObservable.next([]);
        calendarSelectionIsModeActiveObservable.next(false);
        calendarSelectionItemsObservable.next([]);
    });

    it('should create groups without resources when predecessors and successors relations dont have resources', () => {
        const expectedGroups: GroupItem<Dependency>[] = [{
            id: predecessorsGroupId,
            title: 'Generic_Predecessors',
            items: predecessorRelations.map(({id, critical, source: {type}}) => ({
                id,
                type,
                critical,
                resource: null,
                actions: [],
            })),
        }, {
            id: successorsGroupId,
            title: 'Generic_Successors',
            items: successorRelations.map(({id, critical, target: {type}}) => ({
                id,
                type,
                critical,
                resource: null,
                actions: [],
            })),
        }];

        predecessorsObservable.next(predecessorRelations);
        successorsObservable.next(successorRelations);

        expect(component.groups).toEqual(expectedGroups);
    });

    it('should create groups with resources when predecessors and successors relations have resources', () => {
        const expectedGroups: GroupItem<Dependency>[] = [{
            id: predecessorsGroupId,
            title: 'Generic_Predecessors',
            items: predecessorRelationsWithResources.map(({resource, type, critical}) => ({
                type,
                resource,
                critical,
                id: resource.id,
                actions: [],
            })),
        }, {
            id: successorsGroupId,
            title: 'Generic_Successors',
            items: successorRelationsWithResources.map(({resource, type, critical}) => ({
                type,
                resource,
                critical,
                id: resource.id,
                actions: [],
            })),
        }];

        predecessorsWithResourcesObservable.next(predecessorRelationsWithResources);
        successorsWithResourcesObservable.next(successorRelationsWithResources);

        expect(component.groups).toEqual(expectedGroups);
    });

    it('should add the deletion action to the relations that can be deleted', () => {
        const predecessorWithDeletePermissions: RelationWithResource<Task | Milestone> = {
            ...predecessorRelationsWithResources[0],
            permissions: {
                canDelete: true,
            },
        };

        predecessorsWithResourcesObservable.next([predecessorWithDeletePermissions]);

        expect(component.groups[0].items[0].actions).not.toEqual([]);
    });

    it('should dispatch RelationActions.Delete.One action when delete button is clicked', () => {
        const predecessorWithDeletePermissions: RelationWithResource<Task | Milestone> = {
            ...predecessorRelationsWithResources[0],
            permissions: {
                canDelete: true,
            },
        };
        const {id, version} = predecessorWithDeletePermissions;
        const expectedAction = new RelationActions.Delete.One(id, version, 'DependenciesList_DeleteOne_SuccessMessage');

        spyOn(store, 'dispatch');

        predecessorsWithResourcesObservable.next([predecessorWithDeletePermissions]);
        component.handleActionClicked(getDeleteDependencyItem(predecessorWithDeletePermissions));

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not display the add relation dropdown when canAddDependencies is true and the screen size is xs', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(true);
        component.ngOnInit();

        expect(getDocumentElement(dependenciesListAddButtonSelector)).toBeFalsy();
    });

    it('should display the add relation dropdown when canAddDependencies is true, the screen size is xl' +
        ' and the component is not loading', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        requestStatusObservable.next(RequestStatusEnum.empty);

        expect(getDocumentElement(dependenciesListAddButtonSelector)).toBeTruthy();
    });

    it('should not display the add relation dropdown when canAddDependencies is true, the screen size is xl' +
        ' and the component is loading', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        component.handleDropdownItemClicked(predecessorItem);
        component.multipleSelectionToolbarData.submitSelection();
        requestStatusObservable.next(RequestStatusEnum.progress);

        expect(getDocumentElement(dependenciesListAddButtonSelector)).toBeFalsy();
    });

    it('should not display the add relation dropdown when canAddDependencies is false and the screen size is xl', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(false);
        breakpointChangeSubject.next('xl');
        testHostComp.canAddDependencies = false;
        fixture.detectChanges();

        expect(getDocumentElement(dependenciesListAddButtonSelector)).toBeFalsy();
    });

    it('should not display the add relation dropdown when canAddDependencies is false and the screen size is xs', () => {
        breakpointHelper.isCurrentBreakpoint.and.returnValue(true);
        breakpointChangeSubject.next('xs');
        testHostComp.canAddDependencies = false;
        fixture.detectChanges();

        expect(getDocumentElement(dependenciesListAddButtonSelector)).toBeFalsy();
    });

    it('should set the multipleSelectionToolbarData when the add predecessor button is clicked', () => {
        const {
            emptyItemsLabel,
            selectedItemLabel,
            selectedItemsLabel,
        } = MULTIPLE_SELECTION_TOOLBAR_TRANSLATIONS[DependencyTypeEnum.Predecessor];

        expect(component.multipleSelectionToolbarData).toBeNull();

        component.handleDropdownItemClicked(predecessorItem);

        expect(component.multipleSelectionToolbarData).not.toBeNull();
        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);
        expect(component.multipleSelectionToolbarData.emptyItemsLabel).toBe(emptyItemsLabel);
        expect(component.multipleSelectionToolbarData.selectedItemLabel).toBe(selectedItemLabel);
        expect(component.multipleSelectionToolbarData.selectedItemsLabel).toBe(selectedItemsLabel);
        expect(component.multipleSelectionToolbarData.mode).toBe(MultipleSelectionToolbarConfirmationModeEnum.Add);
    });

    it('should set the multipleSelectionToolbarData when the add successor button is clicked', () => {
        const {
            emptyItemsLabel,
            selectedItemLabel,
            selectedItemsLabel,
        } = MULTIPLE_SELECTION_TOOLBAR_TRANSLATIONS[DependencyTypeEnum.Successor];

        expect(component.multipleSelectionToolbarData).toBeNull();

        component.handleDropdownItemClicked(successorItem);

        expect(component.multipleSelectionToolbarData).not.toBeNull();
        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);
        expect(component.multipleSelectionToolbarData.emptyItemsLabel).toBe(emptyItemsLabel);
        expect(component.multipleSelectionToolbarData.selectedItemLabel).toBe(selectedItemLabel);
        expect(component.multipleSelectionToolbarData.selectedItemsLabel).toBe(selectedItemsLabel);
    });

    it('should unset the multipleSelectionToolbarData when the submitSelection is called', () => {
        component.handleDropdownItemClicked(predecessorItem);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        component.multipleSelectionToolbarData.submitSelection();

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should unset the multipleSelectionToolbarData when the dismissSelection is called', () => {
        component.handleDropdownItemClicked(predecessorItem);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        component.multipleSelectionToolbarData.dismissSelection();

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should display the dependencies list when canAddDependencies is true and there are no relations', () => {
        expect(getElement(dependenciesListSelector)).toBeTruthy();
    });

    it('should display the dependencies list when canAddDependencies is false and there are relations', () => {
        predecessorsObservable.next(predecessorRelations);
        testHostComp.canAddDependencies = false;
        fixture.detectChanges();

        expect(getElement(dependenciesListSelector)).toBeTruthy();
    });

    it('should display the dependencies list when canAddDependencies is true and there are relations', () => {
        predecessorsObservable.next(predecessorRelations);

        expect(getElement(dependenciesListSelector)).toBeTruthy();
    });

    it('should not display the dependencies list when canAddDependencies is false and there are no relations', () => {
        testHostComp.canAddDependencies = false;
        fixture.detectChanges();

        expect(getElement(dependenciesListSelector)).toBeFalsy();
    });

    it('should not display the loading when relation request status in not in progress and the component is not submitting', () => {
        requestStatusObservable.next(RequestStatusEnum.empty);

        expect(getElement(dependenciesListLoadingSelector)).toBeFalsy();
    });

    it('should not display the loading when relation request status is in progress and the component is not submitting', () => {
        requestStatusObservable.next(RequestStatusEnum.progress);

        expect(getElement(dependenciesListLoadingSelector)).toBeFalsy();
    });

    it('should display the loading when relations request status is in progress and the component is submitting', () => {
        component.handleDropdownItemClicked(predecessorItem);
        component.multipleSelectionToolbarData.submitSelection();
        requestStatusObservable.next(RequestStatusEnum.progress);

        expect(getElement(dependenciesListLoadingSelector)).toBeTruthy();

        requestStatusObservable.next(RequestStatusEnum.success);

        expect(getElement(dependenciesListLoadingSelector)).toBeFalsy();
    });

    it('should render the right overview card when te resources are of type Task and Milestone', () => {
        const relationsWithResources = [
            ...predecessorRelationsWithResources,
            ...successorRelationsWithResources,
        ];
        const taskIds = relationsWithResources
            .filter(relation => relation.type === ObjectTypeEnum.Task)
            .map(({resource}) => resource.id);
        const milestoneIds = relationsWithResources
            .filter(relation => relation.type === ObjectTypeEnum.Milestone)
            .map(({resource}) => resource.id);

        predecessorsWithResourcesObservable.next(predecessorRelationsWithResources);
        successorsWithResourcesObservable.next(successorRelationsWithResources);

        expect(taskIds.map(taskId => getTaskOverviewCardElement(taskId)).every(element => !!element)).toBeTruthy();
        expect(milestoneIds.map(milestoneId => getMilestoneOverviewCardElement(milestoneId)).every(element => !!element)).toBeTruthy();
    });

    it('it should dispatch CalendarSelectionActions.Set.Selection action when calling the callback function of dropdown ' +
        'button option 1 and 2', () => {
        const spy = spyOn(store, 'dispatch').and.callThrough();
        const expectedAction = new CalendarSelectionActions.Set.Selection(true, CalendarSelectionContextEnum.Dependencies, []);

        component.handleDropdownItemClicked(predecessorItem);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

        spy.calls.reset();

        component.handleDropdownItemClicked(successorItem);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch CalendarSelectionActions.Initialize.All action when multipleSelectionToolbarData dismissSelection' +
        ' is called', () => {
        const expectedAction = new CalendarSelectionActions.Initialize.All();

        component.handleDropdownItemClicked(predecessorItem);

        spyOn(store, 'dispatch').and.callThrough();

        component.multipleSelectionToolbarData.dismissSelection();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should update multipleSelectionToolbarData itemsCount when adding dependencies, current calendar selection ' +
        'mode is DEPENDENCIES and calendar selection items changes', () => {
        const calendarSelectionItems = [new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo')];

        component.handleDropdownItemClicked(predecessorItem);

        calendarSelectionIsModeActiveObservable.next(true);

        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);

        calendarSelectionItemsObservable.next(calendarSelectionItems);

        expect(component.multipleSelectionToolbarData.itemsCount).toBe(calendarSelectionItems.length);
    });

    it('should not update multipleSelectionToolbarData itemsCount when adding dependencies, current calendar selection ' +
        'mode is not DEPENDENCIES and calendar selection items changes', () => {
        const calendarSelectionItems = [new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo')];

        component.handleDropdownItemClicked(predecessorItem);

        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);

        calendarSelectionIsModeActiveObservable.next(false);
        calendarSelectionItemsObservable.next(calendarSelectionItems);

        expect(component.multipleSelectionToolbarData.itemsCount).toBe(0);
    });

    it('should unset multipleSelectionToolbarData when calendar selection mode DEPENDENCIES changes from being active to inactive', () => {
        expect(component.multipleSelectionToolbarData).toBeNull();

        component.handleDropdownItemClicked(predecessorItem);
        calendarSelectionIsModeActiveObservable.next(true);

        expect(component.multipleSelectionToolbarData).not.toBeNull();

        calendarSelectionIsModeActiveObservable.next(false);

        expect(component.multipleSelectionToolbarData).toBeNull();
    });

    it('should dispatch RelationActions.Create.All and CalendarSelectionActions.Initialize.All when submitting a ' +
        'selection of predecessor dependencies', () => {
        const calendarSelectionItems = [new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo')];
        const {payloadParserFn, successMessageKey} = DEPENDENCIES_LIST_SUBMIT_PAYLOAD_BY_TYPE[DependencyTypeEnum.Predecessor];
        const expectedPayload = calendarSelectionItems.map(item => payloadParserFn(originator, item));
        const expectedCalendarInitializeSelectionAction = new CalendarSelectionActions.Initialize.All();
        const expectedRelationCreateAllAction = new RelationActions.Create.All(expectedPayload, successMessageKey);

        component.handleDropdownItemClicked(predecessorItem);
        calendarSelectionIsModeActiveObservable.next(true);
        calendarSelectionItemsObservable.next(calendarSelectionItems);

        spyOn(store, 'dispatch').and.callThrough();

        component.multipleSelectionToolbarData.submitSelection();

        expect(store.dispatch).toHaveBeenCalledTimes(2);
        expect(store.dispatch).toHaveBeenCalledWith(expectedRelationCreateAllAction);
        expect(store.dispatch).toHaveBeenCalledWith(expectedCalendarInitializeSelectionAction);
    });

    it('should dispatch RelationActions.Create.All and CalendarSelectionActions.Initialize.All when submitting a ' +
        'selection of successor dependencies', () => {
        const calendarSelectionItems = [new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo')];
        const {payloadParserFn, successMessageKey} = DEPENDENCIES_LIST_SUBMIT_PAYLOAD_BY_TYPE[DependencyTypeEnum.Successor];
        const expectedPayload = calendarSelectionItems.map(item => payloadParserFn(originator, item));
        const expectedCalendarInitializeSelectionAction = new CalendarSelectionActions.Initialize.All();
        const expectedRelationCreateAllAction = new RelationActions.Create.All(expectedPayload, successMessageKey);

        component.handleDropdownItemClicked(successorItem);
        calendarSelectionIsModeActiveObservable.next(true);
        calendarSelectionItemsObservable.next(calendarSelectionItems);

        spyOn(store, 'dispatch').and.callThrough();

        component.multipleSelectionToolbarData.submitSelection();

        expect(store.dispatch).toHaveBeenCalledTimes(2);
        expect(store.dispatch).toHaveBeenCalledWith(expectedRelationCreateAllAction);
        expect(store.dispatch).toHaveBeenCalledWith(expectedCalendarInitializeSelectionAction);
    });

    it('should dispatch RelationActions.Request.All on ngOnInit', () => {
        const expectedPayload = SaveRelationFilters.forFinishToStartDependenciesByObjectIdentifierPair(originator);
        const expectedAction = new RelationActions.Request.All(expectedPayload, true);

        spyOn(store, 'dispatch').and.callThrough();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleTaskCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleTaskCardClicked(MOCK_TASK);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleMilestoneCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleMilestoneCardClicked(MOCK_MILESTONE_CRAFT);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

});
