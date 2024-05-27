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
import {select} from '@ngrx/store';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {take} from 'rxjs/operators';

import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {ProjectQueries} from './project.queries';

describe('Project Queries', () => {
    let store: MockStore;
    let copyProjectMock = cloneDeep(MOCK_PROJECT_1);

    const initialState = {
        projectModule: {
            projectSlice: {
                items: [copyProjectMock],
                currentItem: {
                    id: copyProjectMock.id,
                },
            },
        },
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectQueries,
            provideMockStore({initialState}),
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        copyProjectMock = cloneDeep(MOCK_PROJECT_1);
        store.setState(initialState);
    });

    it('should retrieve project name on getProjectName call', () => {
        const params = {projectId: copyProjectMock.id};
        const projectName = ProjectQueries.getProjectName(params) as any;
        store.pipe(
            select(projectName))
            .subscribe((result) => expect(result).toBe(copyProjectMock.title));
    });

    it('should retrieve null on getProjectName call when there is no project with given id', () => {
        const params = {projectId: '123'};
        const projectName = ProjectQueries.getProjectName(params) as any;
        store.pipe(
            select(projectName))
            .subscribe((result) => expect(result).toBeNull());
    });

    it('should retrieve true when there is permission to get project tasks', () => {
        const params = {projectId: copyProjectMock.id};
        const tasksPermission = ProjectQueries.getProjectTasksPermission(params) as any;
        store.pipe(
            select(tasksPermission))
            .subscribe((result) => expect(result).toBeTruthy());
    });

    it('should retrieve false when there is no permission to get project tasks', () => {
        const newState = cloneDeep(initialState);
        const params = {projectId: copyProjectMock.id};
        const tasksPermission = ProjectQueries.getProjectTasksPermission(params) as any;
        delete copyProjectMock._links.tasks;

        newState.projectModule.projectSlice.items = [copyProjectMock];
        newState.projectModule.projectSlice.currentItem.id = copyProjectMock.id;

        setStoreState(newState);

        store.pipe(
            select(tasksPermission), take(1))
            .subscribe((result) => expect(result).toBeFalsy());
    });

    it('should retrieve null when there is no permission to get project tasks', () => {
        const params = {projectId: '1234'};
        const tasksPermission = ProjectQueries.getProjectTasksPermission(params) as any;
        store.pipe(
            select(tasksPermission))
            .subscribe((result) => expect(result).toBeNull());
    });

    it('should retrieve true when there is permission to get participants', () => {
        const params = {projectId: copyProjectMock.id};
        const participantsPermission = ProjectQueries.getProjectParticipantsPermission(params) as any;
        store.pipe(
            select(participantsPermission))
            .subscribe((result) => expect(result).toBeTruthy());
    });

    it('should retrieve false when there is no permission to get project participants', () => {
        const newState = cloneDeep(initialState);
        const params = {projectId: copyProjectMock.id};
        const participantsPermission = ProjectQueries.getProjectParticipantsPermission(params) as any;
        delete copyProjectMock._links.participants;

        newState.projectModule.projectSlice.items = [copyProjectMock];
        newState.projectModule.projectSlice.currentItem.id = copyProjectMock.id;

        setStoreState(newState);

        store.pipe(
            select(participantsPermission), take(1))
            .subscribe((result) => expect(result).toBeFalsy());
    });

    it('should retrieve null when there is no permission to get participants', () => {
        const params = {projectId: '123'};
        const participantsPermission = ProjectQueries.getProjectParticipantsPermission(params) as any;
        store.pipe(
            select(participantsPermission))
            .subscribe((result) => expect(result).toBeNull());
    });

    it('should retrieve true when there is craft to get craft', () => {
        const params = {projectId: copyProjectMock.id};
        const craftPermission = ProjectQueries.getProjectCraftsPermission(params) as any;
        store.pipe(
            select(craftPermission))
            .subscribe((result) => expect(result).toBeTruthy());
    });

    it('should retrieve false when there is no permission to get project craft', () => {
        const newState = cloneDeep(initialState);
        const params = {projectId: copyProjectMock.id};
        const craftPermission = ProjectQueries.getProjectCraftsPermission(params) as any;
        delete copyProjectMock._links.projectCrafts;

        newState.projectModule.projectSlice.items = [copyProjectMock];
        newState.projectModule.projectSlice.currentItem.id = copyProjectMock.id;

        setStoreState(newState);

        store.pipe(
            select(craftPermission), take(1))
            .subscribe((result) => expect(result).toBeFalsy());
    });

    it('should retrieve null when there is no craft to get craft', () => {
        const params = {projectId: '123'};
        const craftPermission = ProjectQueries.getProjectCraftsPermission(params) as any;
        store.pipe(
            select(craftPermission))
            .subscribe((result) => expect(result).toBeNull());
    });

    it('should retrieve true when there is permission to get workarea', () => {
        const params = {projectId: copyProjectMock.id};
        const workAreaPermission = ProjectQueries.getProjectWorkareasPermission(params) as any;
        store.pipe(
            select(workAreaPermission))
            .subscribe((result) => expect(result).toBeTruthy());
    });

    it('should retrieve false when there is no permission to get project workarea', () => {
        const newState = cloneDeep(initialState);
        const params = {projectId: copyProjectMock.id};
        const workAreaPermission = ProjectQueries.getProjectWorkareasPermission(params) as any;
        delete copyProjectMock._links.workAreas;

        newState.projectModule.projectSlice.items = [copyProjectMock];
        newState.projectModule.projectSlice.currentItem.id = copyProjectMock.id;

        setStoreState(newState);

        store.pipe(
            select(workAreaPermission), take(1))
            .subscribe((result) => expect(result).toBeFalsy());
    });

    it('should retrieve null when there is no permission to get workarea', () => {
        const params = {projectId: '123'};
        const workAreaPermission = ProjectQueries.getProjectWorkareasPermission(params) as any;
        store.pipe(
            select(workAreaPermission))
            .subscribe((result) => expect(result).toBeNull());
    });

    it('should retrieve true when a project has edit settings permission', () => {
        const params = {projectId: copyProjectMock.id};
        const editProjectSettingsPermission = ProjectQueries.getProjectEditSettingsPermission(params) as any;
        store.pipe(
            select(editProjectSettingsPermission))
            .subscribe((result) => expect(result).toBeTruthy());
    });

    it('should retrieve false when a project does not have edit settings permissions', () => {
        const newState = cloneDeep(initialState);
        const params = {projectId: copyProjectMock.id};
        const editProjectSettingsPermission = ProjectQueries.getProjectEditSettingsPermission(params) as any;

        ProjectQueries.getProjectEditSettingsPermissionLinks().forEach(link => delete copyProjectMock._links[link]);

        newState.projectModule.projectSlice.items = [copyProjectMock];

        setStoreState(newState);

        store.pipe(
            select(editProjectSettingsPermission), take(1))
            .subscribe((result) => expect(result).toBeFalsy());
    });

    it('should retrieve true when a project has edit settings permissions', () => {
        const links = ProjectQueries.getProjectEditSettingsPermissionLinks();

        links.forEach(link => copyProjectMock._links[link] = '');

        expect(ProjectQueries.projectHasEditSettingsPermissions(copyProjectMock)).toBeTruthy();
    });

    it('should return false when a project does not have edit settings permissions', () => {
        const links = ProjectQueries.getProjectEditSettingsPermissionLinks();

        links.forEach(link => delete copyProjectMock._links[link]);

        expect(ProjectQueries.projectHasEditSettingsPermissions(copyProjectMock)).toBeFalsy();
    });

    it('should retrieve true when a project has "updateWorkdays" permissions', () => {
        copyProjectMock._links = {
            self: new ResourceLink(),
            updateWorkdays: new ResourceLink(),
        };

        expect(ProjectQueries.projectHasEditSettingsPermissions(copyProjectMock)).toBeTruthy();
    });

    it('should retrieve false when a project does not have "updateWorkdays" permissions', () => {
        copyProjectMock._links = {
            self: new ResourceLink(),
        };

        expect(ProjectQueries.projectHasEditSettingsPermissions(copyProjectMock)).toBeFalsy();
    });
});
