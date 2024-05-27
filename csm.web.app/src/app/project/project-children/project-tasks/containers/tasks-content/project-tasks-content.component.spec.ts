/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    of,
    Subject
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_NEW_A} from '../../../../../../test/mocks/news';
import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_TASKS} from '../../../../../../test/mocks/tasks';
import {MOCK_WORKAREAS} from '../../../../../../test/mocks/workareas';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {SortDirectionEnum} from '../../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {NewsResource} from '../../../../project-common/api/news/resources/news.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {Task} from '../../../../project-common/models/tasks/task';
import {NewsQueries} from '../../../../project-common/store/news/news.queries';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkareaActions} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectTasksListComponent} from '../../presentationals/tasks-list/project-tasks-list.component';
import {ProjectTasksTableComponent} from '../../presentationals/tasks-table/project-tasks-table.component';
import {ProjectTasksContentComponent} from './project-tasks-content.component';
import {ProjectTaskContentModel} from './project-tasks-content.model';

describe('Project Tasks Content Component', () => {
    let fixture: ComponentFixture<ProjectTasksContentComponent>;
    let comp: ProjectTasksContentComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let storeMock: Store<State>;

    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const newsQueriesMock: NewsQueries = mock(NewsQueries);
    const workareaQueriesMock: WorkareaQueries = mock(WorkareaQueries);

    const currentTaskPageSubject = new Subject<Task[]>();
    const currentPageInitializedSubject = new Subject<boolean>();
    const currentWorkAreasResourceSubject = new Subject<WorkareaResource[]>();
    const taskListRequestStatusSubject = new Subject<RequestStatusEnum>();
    const taskListSortSubject = new Subject<SorterData>();
    const taskAssignListSubject = new Subject<AbstractSelectionList>();
    const taskSendListSubject = new Subject<AbstractSelectionList>();
    const hasTaskListFiltersAppliedSubject = new Subject<boolean>();
    const newsItemsByIdentifierPairSubject = new Subject<NewsResource[]>();

    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="table-${area}-${field}"]`;

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
            StoreModule.forRoot({}),
            EffectsModule.forRoot([]),
        ],
        declarations: [
            ProjectTasksListComponent,
            ProjectTasksTableComponent,
            ProjectTasksContentComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    snapshot: {
                        parent: {
                            params: 'name',
                            paramMap: {
                                get: () => 123,
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: NewsQueries,
                useFactory: () => instance(newsQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(projectTaskQueriesMock),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueriesMock),
            },
            ProjectUrlRetriever,
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksContentComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        storeMock = TestBed.inject(Store);

        when(projectTaskQueriesMock.observeCurrentTaskPage()).thenReturn(currentTaskPageSubject);
        when(projectTaskQueriesMock.observeCurrentTaskPageInitialized()).thenReturn(currentPageInitializedSubject);
        when(workareaQueriesMock.observeWorkareas()).thenReturn(currentWorkAreasResourceSubject);
        when(projectTaskQueriesMock.observeTaskListRequestStatus()).thenReturn(taskListRequestStatusSubject);
        when(projectTaskQueriesMock.observeTaskListSort()).thenReturn(taskListSortSubject);
        when(projectTaskQueriesMock.observeTaskAssignList()).thenReturn(taskAssignListSubject);
        when(projectTaskQueriesMock.observeTaskSendList()).thenReturn(taskSendListSubject);
        when(projectTaskQueriesMock.hasTaskListFiltersApplied()).thenReturn(hasTaskListFiltersAppliedSubject);
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(newsItemsByIdentifierPairSubject);

        comp.ngOnInit();

        currentTaskPageSubject.next(MOCK_TASKS);
        currentPageInitializedSubject.next(true);
        currentWorkAreasResourceSubject.next(MOCK_WORKAREAS);
        taskListRequestStatusSubject.next(RequestStatusEnum.empty);
        taskListSortSubject.next(new SorterData());
        taskAssignListSubject.next(new AbstractSelectionList());
        taskSendListSubject.next(new AbstractSelectionList());
        hasTaskListFiltersAppliedSubject.next(false);
        newsItemsByIdentifierPairSubject.next([MOCK_NEW_A]);

        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should trigger onSortTable with the right params when company is clicked', () => {
        const field = 'company';
        const sorterData = new SorterData(field, SortDirectionEnum.asc);

        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('header', field)).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onSortTable with the right params when company is clicked twice', () => {
        const field = 'company';
        const sorterData = new SorterData(field, SortDirectionEnum.desc);

        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('header', field)).dispatchEvent(clickEvent);
        el.querySelector(getTableAreaFieldSelector('header', field)).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onSortTable with the right params when name is clicked', () => {
        const field = 'name';
        const sorterData = new SorterData(field, SortDirectionEnum.asc);

        spyOn(comp, 'onSortTable').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('header', field)).dispatchEvent(clickEvent);
        expect(comp.onSortTable).toHaveBeenCalledWith(sorterData);
    });

    it('should trigger onClickTask when first row is clicked', () => {
        const field = '0';

        spyOn(comp, 'onClickTask').and.callThrough();
        el.querySelector(getTableAreaFieldSelector('row', field)).dispatchEvent(clickEvent);
        expect(comp.onClickTask).toHaveBeenCalled();
    });

    it('should set isLoading to true if request status is in progress', () => {
        taskListRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(comp.isLoading).toBeTruthy();
    });

    it('should set isLoading to false if request status is not in progress', () => {
        taskListRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isNew property in ProjectTaskContentModel when task is new', () => {
        expect(comp.tasks[0].isNew).toBeTruthy();
    });

    it('should not set isNew property in ProjectTaskContentModel when task is not new', () => {
        expect(comp.tasks[1].isNew).toBeFalsy();
    });

    it('should set hasNoTasks to true when page page is initialized, is not loading and there are no tasks', () => {
        currentTaskPageSubject.next([]);
        taskListRequestStatusSubject.next(RequestStatusEnum.success);
        currentPageInitializedSubject.next(true);
        expect(comp.hasNoTasks).toBeTruthy();
    });

    it('should return the right messages for no items when filters are applied', () => {
        currentTaskPageSubject.next([]);
        hasTaskListFiltersAppliedSubject.next(true);

        expect(comp.noItemsTitle).toBe('Project_Filter_NoTasksTitle');
        expect(comp.noItemsButton).toBe('Generic_ClearFilters');
        expect(comp.noItemsDescription).toBeNull();
    });

    it('should show no items button when filters are applied', () => {
        currentTaskPageSubject.next([]);
        hasTaskListFiltersAppliedSubject.next(true);

        expect(comp.noItemsShowButton).toBeTruthy();
    });

    it('should not show no items button when filters are not applied', () => {
        currentTaskPageSubject.next([]);
        hasTaskListFiltersAppliedSubject.next(false);
        expect(comp.noItemsShowButton).toBeFalsy();
    });

    it('should return the right messages for no items when filters are not applied', () => {
        currentTaskPageSubject.next([]);
        hasTaskListFiltersAppliedSubject.next(false);

        expect(comp.noItemsTitle).toBe('Tasks_NoRecords_Title');
        expect(comp.noItemsDescription).toBe('Tasks_NoRecords_Description');
        expect(comp.noItemsButton).toBeNull();
    });

    it('should reset filters when handleResetFilters', () => {
        const action = new ProjectTaskActions.Set.Filters(new ProjectTaskFilters());

        spyOn(storeMock, 'dispatch').and.callThrough();

        comp.handleResetFilters();

        expect(storeMock.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set showFilterAlert to true if has tasks and filters are applied', () => {
        currentTaskPageSubject.next(MOCK_TASKS);
        hasTaskListFiltersAppliedSubject.next(true);

        expect(comp.hasNoTasks).toBeFalsy();
        expect(comp.tasks.length).toBe(MOCK_TASKS.length);
        expect(comp.showFilterAlert).toBeTruthy();
    });

    it('should return a new tasks array reference when observeItemsByIdentifierPair emits', () => {
        let initTasks: ProjectTaskContentModel[] = [];
        let finalTasks: ProjectTaskContentModel[] = [];
        const newsItemsByIdentifierPair = [MOCK_NEW_A];

        newsItemsByIdentifierPairSubject.next(newsItemsByIdentifierPair);
        initTasks = comp.tasks;

        newsItemsByIdentifierPairSubject.next(newsItemsByIdentifierPair);
        finalTasks = comp.tasks;

        expect(initTasks).not.toBe(finalTasks);
    });

    it('should allow row to be selected for send if row has permission and task is assigned', () => {
        const newSelectionList = {
            ids: ['foo', 'bar'],
            isSelecting: true,
            requestStatus: RequestStatusEnum.empty,
        };
        taskSendListSubject.next(newSelectionList);

        expect(comp.isRowSelectable({sendPermission: true, company: {assigned: true}})).toBeTruthy();
        expect(comp.isRowSelectable({sendPermission: true, company: {assigned: false}})).toBeFalsy();
        expect(comp.isRowSelectable({sendPermission: false, company: {assigned: true}})).toBeFalsy();
        expect(comp.isRowSelectable({sendPermission: false, company: {assigned: false}})).toBeFalsy();
    });

    it('should dispatch workArea request when the component initializes', () => {
        const workAreaAction = new WorkareaActions.Request.All();

        spyOn(storeMock, 'dispatch').and.callThrough();

        comp.ngOnInit();

        expect(storeMock.dispatch).toHaveBeenCalledWith(workAreaAction);
    });
});
