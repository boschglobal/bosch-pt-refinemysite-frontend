/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateModule} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {
    MOCK_PROJECT_2,
    MOCK_PROJECT_PICTURE
} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {MOCK_TASK_RESOURCE} from '../../../../../../test/mocks/tasks';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {GenericBannerComponent} from '../../../../../shared/misc/presentationals/generic-banner/generic-banner.component';
import {GenericDashboardTileComponent} from '../../../../../shared/misc/presentationals/generic-dashboard-tile/generic-dashboard-tile.component';
import {FlyoutDirective} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../../shared/ui/flyout/service/flyout.service';
import {ButtonLinkComponent} from '../../../../../shared/ui/links/button-link/button-link.component';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {CurrentProjectPermissions} from '../../../../project-common/store/projects/project.slice';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectTaskFilters} from '../../../../project-common/store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {
    ProjectDashboardActionsIdsEnum,
    ProjectDashboardComponent
} from './project-dashboard.component';

describe('Project Dashboard Component', () => {
    let fixture: ComponentFixture<ProjectDashboardComponent>;
    let comp: ProjectDashboardComponent;
    let de: DebugElement;
    let router: Router;
    let store: Store<State>;
    let modalService: ModalService;
    let flyoutService: FlyoutService;

    const currentProjectId = MOCK_PROJECT_PICTURE.id;
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const currentProjectPermissions: CurrentProjectPermissions = {
        canEditProject: true,
        canSeeProjectTasks: true,
    } as CurrentProjectPermissions;

    const dataAutomationDashboardTileItemSelector = '[data-automation="project-dashboard-tile-task-item"]';
    const dataAutomationDashboardTileTasksSelector = '[data-automation="project-dashboard-tile-tasks"]';
    const dataAutomationDashboardTileCalendarSelector = '[data-automation="project-dashboard-tile-calendar"]';
    const dataAutomationDashboardTileTeamSelector = '[data-automation="project-dashboard-tile-participants"]';
    const dataAutomationDashboardTileCraftsSelector = '[data-automation="project-dashboard-tile-crafts"]';
    const dataAutomationDashboardTileWorkareasSelector = '[data-automation="project-dashboard-tile-workareas"]';
    const dataAutomationDashboardBannerLinkSelector = '[data-automation="generic-banner-link"] button';
    const dataAutomationDashboardTileKpisSelector = '[data-automation="project-dashboard-tile-kpis"]';
    const dataAutomationDashboardImportButtonSelector = '[data-automation="project-dashboard-import-btn"]';
    const dataAutomationDashboardEditButtonSelector = '[data-automation="project-dashboard-edit-btn"]';
    const dataAutomationDashboardDropdownMenuSelector = '[data-automation="project-dashboard-dropdown-menu"]';
    const dataAutomationTooltipFlyoutSelector = '[data-automation="project-dashboard-import-tooltip-flyout"]';

    const tooltipFlyoutId = 'ssProjectDashboardImportTooltip';

    const clickEvent: Event = new Event('click');
    const mouseEnterEvent: Event = new Event('mouseenter');

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownActions.map(({items}) => items)).find(item => item.id === itemId);
    const getNativeElement = (selector: string) => de.query(By.css(selector)).nativeElement;
    const getElement = (selector: string) => de.query(By.css(selector));
    const getFlyout = () => document.querySelector(dataAutomationTooltipFlyoutSelector);

    const clearFlyout = () => {
        if (flyoutService.isFlyoutOpen(tooltipFlyoutId)) {
            flyoutService.close(tooltipFlyoutId);
        }
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            StoreModule,
            TranslateModule.forRoot(),
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: currentProjectId}),
                    snapshot: {
                        parent: {
                            params: 'name',
                            paramMap: {
                                get: () => currentProjectId,
                            },
                        },
                    },
                },
            },
            HttpClient,
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_PICTURE.id,
                                },
                                items: [MOCK_PROJECT_PICTURE],
                            },
                            projectParticipantSlice: {
                                currentItem: {
                                    id: MOCK_PARTICIPANT.id,
                                },
                            },
                            projectTaskSlice: {
                                currentItem: {
                                    id: MOCK_TASK_RESOURCE.id,
                                },
                                items: [MOCK_TASK_RESOURCE],
                            },
                        },
                    }
                ),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
        ],
        declarations: [
            ButtonLinkComponent,
            FlyoutDirective,
            GenericBannerComponent,
            GenericDashboardTileComponent,
            ProjectDashboardComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectDashboardComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        modalService = de.injector.get(ModalService);
        flyoutService = TestBed.inject(FlyoutService);

        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(MOCK_PROJECT_PICTURE));
        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(currentProjectPermissions));

        comp.ngOnInit();

        fixture.detectChanges();
    });

    afterEach((done) => {
        clearFlyout();
        done();
    });

    afterAll(() => {
        comp.ngOnDestroy();
    });

    it('should get the correct tile link for project team', () => {
        expect(comp.teamUrl).toBe(ProjectUrlRetriever.getProjectParticipantsUrl(currentProjectId.toString()));
    });

    it('should get the correct tile link for project crafts', () => {
        expect(comp.craftsUrl).toBe(ProjectUrlRetriever.getProjectCraftsUrl(currentProjectId.toString()));
    });

    it('should call navigateByUrl with the right url when calling handleNavigate', () => {
        const expectedResult = '123';
        spyOn(router, 'navigateByUrl');
        comp.handleNavigate(expectedResult);

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedResult);
    });

    it('should render one project-dashboard-tile-task-item for each task status', () => {
        const renderedRows: DebugElement[] = de.queryAll(By.css(dataAutomationDashboardTileItemSelector));
        expect(renderedRows.length).toBe(5);
    });

    it('should set status filter and navigate when handleSetStatusFilter is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.status = [TaskStatusEnum.CLOSED];
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(currentProjectId);

        comp.handleSetStatusFilter(TaskStatusEnum.CLOSED);

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should set critical filter and navigate when handleSetCriticalTopicFilter is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.topicCriticality = ['CRITICAL'];
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(currentProjectId);

        comp.handleSetCriticalTopicFilter();

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should unset filters and navigate when handleUnsetFilters is called', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(store, 'dispatch').and.callThrough();

        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        const action = new ProjectTaskActions.Set.Filters(filters);
        const url = ProjectUrlRetriever.getProjectTasksUrl(currentProjectId);

        comp.handleUnsetFilters();

        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(router.navigateByUrl).toHaveBeenCalledWith(url);
    });

    it('should navigate when project information link is clicked', () => {
        spyOn(router, 'navigate').and.callThrough();

        de.query(By.css(dataAutomationDashboardBannerLinkSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(router.navigate).toHaveBeenCalled();
    });

    it('should call handleNavigate with the right url when user clicks KPIs tile', () => {
        const kpisTileComponent = de.query((By.css(dataAutomationDashboardTileKpisSelector))).componentInstance;
        const expectedResult = ProjectUrlRetriever.getProjectKpisUrl(currentProjectId.toString());

        spyOn(comp, 'handleNavigate').and.callThrough();

        kpisTileComponent.tileClick.emit();

        expect(comp.handleNavigate).toHaveBeenCalledWith(expectedResult);
    });

    it('should not render tasks when it has not permission', () => {
        comp.permissions.canSeeProjectTasks = false;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileTasksSelector))).toBeNull();
    });

    it('should render tasks when it has permission', () => {
        comp.permissions.canSeeProjectTasks = true;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileTasksSelector))).toBeTruthy();
    });

    it('should not render calendar when it has not permissions', () => {
        comp.permissions.canSeeProjectTasks = false;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileCalendarSelector))).toBeNull();
    });

    it('should render calendar when it has permission', () => {
        comp.permissions.canSeeProjectTasks = true;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileCalendarSelector))).toBeTruthy();
    });

    it('should not render team when it has not permissions', () => {
        comp.permissions.canSeeProjectParticipants = false;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileTeamSelector))).toBeNull();
    });

    it('should render team when it has permission', () => {
        comp.permissions.canSeeProjectParticipants = true;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileTeamSelector))).toBeTruthy();
    });

    it('should not render crafts when it has not permission', () => {
        comp.permissions.canSeeProjectCrafts = false;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileCraftsSelector))).toBeNull();
    });

    it('should render crafts when it has permission', () => {
        comp.permissions.canSeeProjectCrafts = true;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationDashboardTileCraftsSelector))).toBeTruthy();
    });

    it('should get the right critical topics label', () => {
        comp.project._embedded.statistics.criticalTopics = 1;

        expect(comp.getTopicLabelKey()).toBe('Generic_CriticalTopic');

        comp.project._embedded.statistics.criticalTopics = 2;

        expect(comp.getTopicLabelKey()).toBe('Generic_CriticalTopics');
    });

    it('should get right participants label', () => {
        comp.project.participants = 1;

        expect(comp.getParticipantLabelKey()).toBe('Generic_Participant');

        comp.project.participants = 2;

        expect(comp.getParticipantLabelKey()).toBe('Generic_Participants');
    });

    it('should get the right picture href', () => {
        comp.project = MOCK_PROJECT_PICTURE;

        expect(comp.getProjectPicture).toBe(MOCK_PROJECT_PICTURE._embedded.projectPicture._links.small.href);

        comp.project = MOCK_PROJECT_2;

        expect(comp.getProjectPicture).toBeNull();
    });

    it('should call handleNavigate with the right url when user clicks Calendar tile', () => {
        const calendarTileComponent = de.query((By.css(dataAutomationDashboardTileCalendarSelector))).componentInstance;
        const expectedResult = ProjectUrlRetriever.getProjectCalendarUrl(currentProjectId);

        spyOn(comp, 'handleNavigate').and.callThrough();

        calendarTileComponent.tileClick.emit();

        expect(comp.handleNavigate).toHaveBeenCalledWith(expectedResult);
    });

    it('should call handleNavigate with the right url when user clicks Workareas tile', () => {
        const workareasTileComponent = de.query((By.css(dataAutomationDashboardTileWorkareasSelector))).componentInstance;
        const expectedResult = ProjectUrlRetriever.getProjectWorkareaUrl(currentProjectId);

        spyOn(comp, 'handleNavigate').and.callThrough();

        workareasTileComponent.tileClick.emit();

        expect(comp.handleNavigate).toHaveBeenCalledWith(expectedResult);
    });

    it('should set edit project action when user has permissions', () => {
        const expectedIcon = 'edit';
        const permissions: CurrentProjectPermissions = {canEditProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();

        const item = getDropdownItem(ProjectDashboardActionsIdsEnum.Edit);

        expect(item).toBeTruthy();
        expect(item.customData).toEqual(expectedIcon);
    });

    it('should redirect to edit if handleActionClick id called with edit id', () => {
        const expectedCallback = ProjectUrlRetriever.getProjectEditUrl(MOCK_PROJECT_PICTURE.id);
        spyOn(router, 'navigateByUrl');

        comp.handleActionClick(ProjectDashboardActionsIdsEnum.Edit);

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedCallback);
    });

    it(`should set import project action when user has permissions`, () => {
        const permissions: CurrentProjectPermissions = {canImportProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getNativeElement(dataAutomationDashboardImportButtonSelector)).toBeTruthy();
    });

    it(`should open import modal if handleActionClick id called with import id`, () => {
        const permissions: CurrentProjectPermissions = {canImportProject: true} as CurrentProjectPermissions;

        spyOn(modalService, 'open').and.callThrough();
        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        getNativeElement(dataAutomationDashboardImportButtonSelector).dispatchEvent(clickEvent);

        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.ProjectImport,
            data: null,
        });
    });

    it(`should set export project action when user has permissions`, () => {
        const expectedIcon = 'export';
        const permissions: CurrentProjectPermissions = {canExportProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();

        const item = getDropdownItem(ProjectDashboardActionsIdsEnum.Export);

        expect(item).toBeTruthy();
        expect(item.customData).toEqual(expectedIcon);
    });

    it(`should open export modal if handleActionClick id called with export id`, () => {
        spyOn(modalService, 'open').and.callThrough();

        comp.handleActionClick(ProjectDashboardActionsIdsEnum.Export);

        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.ProjectExport,
            data: null,
        });
    });

    it(`should set copy project action when user has permissions`, () => {
        const expectedIcon = 'copy';
        const permissions: CurrentProjectPermissions = {canCopyProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();

        const item = getDropdownItem(ProjectDashboardActionsIdsEnum.Copy);

        expect(item).toBeTruthy();
        expect(item.customData).toEqual(expectedIcon);
    });

    it(`should open copy project modal if handleActionClick id called with copy id`, () => {
        spyOn(modalService, 'open').and.callThrough();

        comp.handleActionClick(ProjectDashboardActionsIdsEnum.Copy);

        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.ProjectCopy,
            data: null,
        });
    });

    it('should not set copy project action when user does not have permissions', () => {
        const permissions: CurrentProjectPermissions = {canCopyProject: false} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();

        const item = getDropdownItem(ProjectDashboardActionsIdsEnum.Copy);

        expect(item).toBeFalsy();
        expect(comp.dropdownActions[0].items.length).toBeFalsy();
    });

    it('should not set edit project action when user does not have permissions', () => {
        const permissions: CurrentProjectPermissions = {canEditProject: false} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();
        fixture.detectChanges();

        const item = getDropdownItem(ProjectDashboardActionsIdsEnum.Edit);

        expect(item).toBeFalsy();
        expect(getElement(dataAutomationDashboardEditButtonSelector)).toBeFalsy();
    });

    it('should not set import project action when user does not have permissions but feature active', () => {
        const permissions: CurrentProjectPermissions = {canImportProject: false} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));
        comp.ngOnInit();

        expect(getElement(dataAutomationDashboardImportButtonSelector)).toBeFalsy();
    });

    it('should close the modal when closeModal is called', () => {
        spyOn(modalService, 'close').and.callThrough();

        comp.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should open flyout when hovering a button with tooltip', () => {
        const permissions: CurrentProjectPermissions = {canImportProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        getNativeElement(dataAutomationDashboardImportButtonSelector).dispatchEvent(mouseEnterEvent);
        expect(getFlyout()).not.toBeNull();
    });

    it('should show edit button if user has only edit permission', () => {
        const permissions: CurrentProjectPermissions = {canEditProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(dataAutomationDashboardDropdownMenuSelector)).toBeNull();
        expect(getElement(dataAutomationDashboardEditButtonSelector)).not.toBeNull();
    });

    it('should show dropdown menu button if user has edit plus either copy or export permission', () => {
        const permissions: CurrentProjectPermissions = {canEditProject: true, canExportProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        const editItem = getDropdownItem(ProjectDashboardActionsIdsEnum.Edit);

        expect(editItem).not.toBeNull();
        expect(getElement(dataAutomationDashboardEditButtonSelector)).toBeNull();
        expect(getElement(dataAutomationDashboardDropdownMenuSelector)).not.toBeNull();
    });

    it('should show dropdown menu button if user does not have edit permission but has copy/export permission', () => {
        const permissions: CurrentProjectPermissions = {canEditProject: false, canExportProject: true} as CurrentProjectPermissions;

        when(projectSliceServiceMock.observeCurrentProjectPermissions()).thenReturn(of(permissions));

        comp.ngOnInit();
        fixture.detectChanges();

        const editItem = getDropdownItem(ProjectDashboardActionsIdsEnum.Edit);

        expect(editItem).toBe(undefined);
        expect(getElement(dataAutomationDashboardEditButtonSelector)).toBeNull();
        expect(getElement(dataAutomationDashboardDropdownMenuSelector)).not.toBeNull();
    });
});
