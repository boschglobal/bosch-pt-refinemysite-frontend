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
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA,
} from '../../../../../test/mocks/milestones';
import {
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2
} from '../../../../../test/mocks/relations';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B
} from '../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {GroupListSelectionComponent} from '../../../../shared/ui/group-list-selection/group-list-selection.component';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {Milestone} from '../../models/milestones/milestone';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {RelationActions} from '../../store/relations/relation.actions';
import {RelationQueries} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    TaskMilestone,
    TaskMilestoneRelationListComponent,
} from './task-milestone-relation-list.component';

describe('Task Milestone Relation List Component', () => {
    let component: TaskMilestoneRelationListComponent;
    let fixture: ComponentFixture<TaskMilestoneRelationListComponent>;
    let store: Store<State>;

    const taskMilestoneRelationListSelector = '[data-automation="ss-task-milestone-relation-list"]';

    const relationQueriesMock: RelationQueries = mock(RelationQueries);
    const workareaQueries: WorkareaQueries = mock(WorkareaQueries);

    const workareas: WorkareaResource[] = [
        MOCK_WORKAREA_A,
        MOCK_WORKAREA_B,
    ];
    const task = MOCK_TASK;
    const milestones: Milestone[] = [
        MOCK_MILESTONE_CRAFT,
        MOCK_MILESTONE_HEADER,
        MOCK_MILESTONE_WORKAREA,
    ];
    const taskMilestones: TaskMilestone[] = milestones.map(milestone => ({id: milestone.id, milestone}));
    const relations: RelationResource[] = [
        MOCK_RELATION_RESOURCE_1,
        MOCK_RELATION_RESOURCE_2,
    ];
    const relationsTaskMilestonesSubject = new Subject<Milestone[]>();
    const partOfRelationsSubject = new Subject<RelationResource[]>();

    const getElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector));

    const taskMilestoneRelationGroupId = 'ss-task-milestone-relation-groupId';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        declarations: [
            GroupListSelectionComponent,
            TaskMilestoneRelationListComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
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
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskMilestoneRelationListComponent);
        store = TestBed.inject(Store);

        component = fixture.componentInstance;
        component.task = task;

        when(relationQueriesMock.observeRelationsTaskMilestonesByTaskId(task.id)).thenReturn(relationsTaskMilestonesSubject);
        when(relationQueriesMock.observePartOfRelationsByTaskId(task.id)).thenReturn(partOfRelationsSubject);
        when(workareaQueries.observeWorkareas()).thenReturn(of(workareas));

        fixture.detectChanges();
    });

    it('should create a group with the provided milestones when observeRelationsTaskMilestonesByTaskId emits', () => {
        const expectedGroups: GroupItem<TaskMilestone>[] = [{
            id: taskMilestoneRelationGroupId,
            items: taskMilestones,
        }];

        relationsTaskMilestonesSubject.next(milestones);

        expect(component.groups).toEqual(expectedGroups);
    });

    it('should create a group without milestones when observePartOfRelationsByTaskId emits' +
        ' and observeRelationsTaskMilestonesByTaskId not emitted yet', () => {
        const expectedGroups: GroupItem<TaskMilestone>[] = [{
            id: taskMilestoneRelationGroupId,
            items: relations.map(relation => ({id: relation.id, milestone: null})),
        }];

        partOfRelationsSubject.next(relations);

        expect(component.groups).toEqual(expectedGroups);
    });

    it('should display the relation list when the task has relations', () => {
        partOfRelationsSubject.next(relations);
        fixture.detectChanges();

        expect(getElement(taskMilestoneRelationListSelector)).toBeTruthy();
    });

    it('should not display the relation list when the task does not have relations', () => {
        partOfRelationsSubject.next([]);
        fixture.detectChanges();

        expect(getElement(taskMilestoneRelationListSelector)).toBeFalsy();
    });

    it('should dispatch RelationActions.Request.All action on ngOnInit', () => {
        const expectedPayload = SaveRelationFilters.forTaskMilestonesByTaskId(task.id);
        const expectedResult = new RelationActions.Request.All(expectedPayload, true);

        spyOn(store, 'dispatch').and.callThrough();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement on handleMilestoneCardClicked', () => {
        const expectedPayload = new ObjectIdentifierPair(ObjectTypeEnum.Milestone, MOCK_MILESTONE_CRAFT.id);
        const expectedAction = new CalendarScopeActions.Resolve.NavigateToElement(expectedPayload);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleMilestoneCardClicked(MOCK_MILESTONE_CRAFT);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
