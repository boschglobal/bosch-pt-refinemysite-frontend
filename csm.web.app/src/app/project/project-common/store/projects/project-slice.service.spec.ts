/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectQueries} from './project.queries';
import {CurrentProjectPermissions} from './project.slice';
import {ProjectSliceService} from './project-slice.service';

describe('Project Slice Service', () => {
    let projectSliceService: ProjectSliceService;
    let store: MockStore;

    const initialState = {
        projectModule: {
            projectSlice: {
                userActivated: false,
                currentItem: {
                    id: MOCK_PROJECT_1.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: [MOCK_PROJECT_1],
                list: {
                    ids: [MOCK_PROJECT_1.id],
                    requestStatus: RequestStatusEnum.success,
                    _links: {
                        edit: {
                            href: '',
                        },
                        participants: {
                            href: '',
                        },
                        tasks: {
                            href: '',
                        },
                        create: {
                            href: '',
                        },
                        import: {
                            href: '',
                        },
                        export: {
                            href: '',
                        },
                    },
                },
            },
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            HttpClient,
            provideMockStore({initialState}),
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectSliceService = TestBed.inject(ProjectSliceService);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => store.setState(initialState));

    it('should get project id', () => {
        expect(projectSliceService.getCurrentProjectId()).toBe(MOCK_PROJECT_1.id);
    });

    it('should check if user has project', () => {
        expect(projectSliceService.hasProjects()).toBeTruthy();
    });

    it('should check if project exists by id', () => {
        expect(projectSliceService.hasProjectById(MOCK_PROJECT_1.id)).toBeTruthy();
        expect(projectSliceService.hasProjectById('something here')).toBeFalsy();
    });

    it('should check if user has create project permission', () => {
        expect(projectSliceService.hasCreateProjectPermission()).toBeTruthy();
    });

    it('should check if user has edit project permission for current project', () => {
        expect(projectSliceService.hasEditProjectPermission()).toBeTruthy();
    });

    it('should check if user has access to project participants for current project', () => {
        expect(projectSliceService.hasAccessToProjectParticipants()).toBeTruthy();
    });

    it('should check if user has access to project tasks for current project', () => {
        expect(projectSliceService.hasAccessToProjectTasks()).toBeTruthy();
    });

    it('should check if user has access to project crafts for current project', () => {
        expect(projectSliceService.hasAccessToProjectCrafts()).toBeTruthy();
    });

    it('should check if user has access to project workareas for current project', () => {
        expect(projectSliceService.hasAccessToProjectWorkareas()).toBeTruthy();
    });

    it('should get current project', () => {
        expect(projectSliceService.getCurrentProject()).toBe(MOCK_PROJECT_1);
    });

    it('should observe current project request status', () => {
        projectSliceService
            .observeCurrentProjectRequestStatus()
            .subscribe(result =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe project list request status', () => {
        projectSliceService
            .observeProjectListRequestStatus()
            .subscribe(result =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe userActivated', () => {
        projectSliceService
            .observeUserIsActivated()
            .subscribe(result =>
                expect(result).toBe(false));
    });

    it('should observe current project permissions', () => {
        const expectedResult: CurrentProjectPermissions = {
            canChangeSortingMode: false,
            canCopyProject: false,
            canCreateCraftMilestone: false,
            canCreateInvestorMilestone: false,
            canCreateProjectMilestone: false,
            canEditProject: true,
            canEditProjectSettings: true,
            canExportProject: true,
            canImportProject: true,
            canRescheduleProject: false,
            canSeeProjectCrafts: true,
            canSeeProjectParticipants: true,
            canSeeProjectTasks: true,
            canSeeWorkareas: true,
        };

        projectSliceService
            .observeCurrentProjectPermissions()
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should not observe current project permissions when current project is not set', () => {
        const state = cloneDeep(initialState);
        const expectedResult = 'never emitted' as unknown as CurrentProjectPermissions;
        let currentResult = 'never emitted' as unknown as CurrentProjectPermissions;

        state.projectModule.projectSlice.currentItem.id = null;

        store.setState(state);
        store.refreshState();

        projectSliceService
            .observeCurrentProjectPermissions()
            .subscribe(result => currentResult = result);

        expect(currentResult).toBe(expectedResult);
    });

    it('should observe current project id', () => {
        const expectedResult = MOCK_PROJECT_1.id;

        projectSliceService
            .observeCurrentProjectId()
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should not observe current project id when current project is not set', () => {
        const state = cloneDeep(initialState);
        const expectedResult = 'never emitted';
        let currentResult = 'never emitted';

        state.projectModule.projectSlice.currentItem.id = null;

        store.setState(state);
        store.refreshState();

        projectSliceService
            .observeCurrentProjectId()
            .subscribe(result => currentResult = result);

        expect(currentResult).toBe(expectedResult);
    });

    it('should observe current project', () => {
        const expectedResult: ProjectResource = MOCK_PROJECT_1;

        projectSliceService
            .observeCurrentProject()
            .subscribe(result =>
                expect(result).toEqual(expectedResult));
    });

    it('should not observe current project when current project is not set', () => {
        const state = cloneDeep(initialState);
        const expectedResult = 'never emitted' as unknown as ProjectResource;
        let currentResult = 'never emitted' as unknown as ProjectResource;

        state.projectModule.projectSlice.currentItem.id = null;

        store.setState(state);
        store.refreshState();

        projectSliceService
            .observeCurrentProject()
            .subscribe(result => currentResult = result);

        expect(currentResult).toBe(expectedResult);
    });

    it('should observe current project permission by key', () => {
        projectSliceService
            .observeCurrentItemPermission('tasks')
            .subscribe(result =>
                expect(result).toBeTruthy());
    });

    it('should not observe current project permission by key when current project is not set', () => {
        const state = cloneDeep(initialState);
        const expectedResult = 'never emitted' as unknown as boolean;
        let currentResult = 'never emitted' as unknown as boolean;

        state.projectModule.projectSlice.currentItem.id = null;

        store.setState(state);
        store.refreshState();

        projectSliceService
            .observeCurrentItemPermission('tasks')
            .subscribe(result => currentResult = result);

        expect(currentResult).toBe(expectedResult);
    });

    it('should observe access to project settings permissions and return true', () => {
        projectSliceService.observeAccessToProjectSettings()
            .subscribe(result => expect(result).toBeTruthy());
    });

    it('should observe access to project settings permissions and return false', () => {
        let currentResult;
        const state = cloneDeep(initialState);
        const projectWithoutEditProjectSettings = cloneDeep(MOCK_PROJECT_1);

        ProjectQueries.getProjectEditSettingsPermissionLinks().forEach(link => delete projectWithoutEditProjectSettings._links[link]);

        state.projectModule.projectSlice.items = [projectWithoutEditProjectSettings];

        projectSliceService.observeAccessToProjectSettings()
            .subscribe(result => currentResult = result);

        store.setState(state);
        store.refreshState();

        expect(currentResult).toBeFalsy();
    });
});
