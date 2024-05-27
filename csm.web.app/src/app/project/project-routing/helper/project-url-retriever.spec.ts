/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';

import {MOCK_PROJECT_1} from '../../../../test/mocks/projects';
import {MockStore} from '../../../../test/mocks/store';
import {MOCK_TASK_SLICE} from '../../../../test/mocks/tasks';
import {
    REDUCER,
    State
} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {ProjectResource} from '../../project-common/api/projects/resources/project.resource';
import {TaskResource} from '../../project-common/api/tasks/resources/task.resource';
import {PROJECT_ROUTE_PATHS as paths} from '../project-route.paths';
import {ProjectUrlRetriever} from './project-url-retriever';

describe('Project Url Retriever', () => {
    let store: Store<State>;

    const project: ProjectResource = MOCK_PROJECT_1;
    const task: TaskResource = MOCK_TASK_SLICE.task;
    const projectId: string = project.id;
    const taskId: string = task.id;
    const participantId: string = task.assignee.id;

    const expectedProjectUrl = `/${paths.projects}/${projectId}`;
    const expectedProjectDashboardUrl = `/${paths.projects}/${projectId}/dashboard`;
    const expectedProjectTasksUrl = `${expectedProjectUrl}/${paths.tasks}`;
    const expectedProjectTaskDetailUrl = `${expectedProjectTasksUrl}/${taskId}`;
    const expectedProjectParticipantsUrl = `${expectedProjectUrl}/${paths.participants}`;
    const expectedProjectInformationUrl = `${expectedProjectUrl}/${paths.information}`;
    const expectedProjectEditUrl = `${expectedProjectUrl}/${paths.edit}`;
    const expectedProjectCreateUrl = `/${paths.projects}/${paths.create}`;
    const expectedProjectParticipantsProfileUrl = `${expectedProjectUrl}/${paths.participants}/${participantId}`;
    const expectedProjectCraftUrl = `${expectedProjectUrl}/${paths.crafts}`;
    const expectedProjectWorkingAreasUrl = `${expectedProjectUrl}/${paths.workareas}`;
    const expectedProjectTasksCalendarUrl = `${expectedProjectUrl}/${paths.calendar}`;
    const expectedProjectKpisUrl = `${expectedProjectUrl}/${paths.kpis}`;
    const expectedProjectSettingsUrl = `${expectedProjectUrl}/${paths.settings}`;

    const moduleDef: TestModuleMetadata = {
        imports: [
            StoreModule.forRoot(REDUCER),
            EffectsModule.forRoot([])
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id,
                                },
                                items: [MOCK_PROJECT_1],
                                list: {
                                    ids: ['123'],
                                    requestStatus: RequestStatusEnum.success,
                                    _links: {
                                        edit: {
                                            href: ''
                                        },
                                        participants: {
                                            href: ''
                                        },
                                        tasks: {
                                            href: ''
                                        },
                                        create: {
                                            href: ''
                                        }
                                    }
                                }
                            }
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => store = TestBed.inject(Store));

    it('should retrieve the correct url for project page', () => {
        const url = ProjectUrlRetriever.getProjectUrl(projectId);

        expect(url).toBe(expectedProjectUrl);
    });

    it('should retrieve the correct url for project dashboard page', () => {
        const url = ProjectUrlRetriever.getProjectDashboardUrl(projectId);

        expect(url).toBe(expectedProjectDashboardUrl);
    });

    it('should retrieve the correct url for project dashboard page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectDashboardUrl(store);

        expect(url).toBe(expectedProjectDashboardUrl);
    });

    it('should retrieve the correct url for create project page', () => {
        const url = ProjectUrlRetriever.getProjectCreateUrl();

        expect(url).toBe(expectedProjectCreateUrl);
    });

    it('should retrieve the correct url for project tasks page', () => {
        const url = ProjectUrlRetriever.getProjectTasksUrl(projectId);

        expect(url).toBe(expectedProjectTasksUrl);
    });

    it('should retrieve the correct url for project tasks page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectTasksUrl(store);

        expect(url).toBe(expectedProjectTasksUrl);
    });

    it('should retrieve the correct url for project participants page', () => {
        const url = ProjectUrlRetriever.getProjectParticipantsUrl(projectId);

        expect(url).toBe(expectedProjectParticipantsUrl);
    });

    it('should retrieve the correct url for project participants page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectParticipantsUrl(store);

        expect(url).toBe(expectedProjectParticipantsUrl);
    });

    it('should retrieve the correct url for project information page', () => {
        const url = ProjectUrlRetriever.getProjectInformationUrl(projectId);

        expect(url).toBe(expectedProjectInformationUrl);
    });

    it('should retrieve the correct url for project information page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectInformationUrl(store);

        expect(url).toBe(expectedProjectInformationUrl);
    });

    it('should retrieve the correct url for project task detail page', () => {
        const url = ProjectUrlRetriever.getProjectTaskDetailUrl(projectId, taskId);

        expect(url).toBe(expectedProjectTaskDetailUrl);
    });

    it('should retrieve the correct url for project edit page', () => {
        const url = ProjectUrlRetriever.getProjectEditUrl(projectId);

        expect(url).toBe(expectedProjectEditUrl);
    });

    it('should retrieve the correct url for user profile page', () => {
        const url = ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, participantId);

        expect(url).toBe(expectedProjectParticipantsProfileUrl);
    });

    it('should retrieve the correct url for project craft page', () => {
        const url = ProjectUrlRetriever.getProjectCraftsUrl(projectId);

        expect(url).toBe(expectedProjectCraftUrl);
    });

    it('should retrieve the correct url for project craft page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectCraftsUrl(store);

        expect(url).toBe(expectedProjectCraftUrl);
    });

    it('should retrieve the correct url for project working area page', () => {
        const url = ProjectUrlRetriever.getProjectWorkareaUrl(projectId);

        expect(url).toBe(expectedProjectWorkingAreasUrl);
    });

    it('should retrieve the correct url for project working area page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectWorkareaUrl(store);

        expect(url).toBe(expectedProjectWorkingAreasUrl);
    });

    it('should retrieve the correct url for project task calendar page', () => {
        const url = ProjectUrlRetriever.getProjectCalendarUrl(projectId);

        expect(url).toBe(expectedProjectTasksCalendarUrl);
    });

    it('should retrieve the correct url for project task calendar page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectCalendarUrl(store);

        expect(url).toBe(expectedProjectTasksCalendarUrl);
    });

    it('should retrieve the correct url for project KPIs page', () => {
        const url = ProjectUrlRetriever.getProjectKpisUrl(projectId);

        expect(url).toBe(expectedProjectKpisUrl);
    });

    it('should retrieve the correct url for current project KPIs page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectKpisUrl(store);

        expect(url).toBe(expectedProjectKpisUrl);
    });

    it('should retrieve the correct url for current project settings page', () => {
        const url = ProjectUrlRetriever.getCurrentProjectSettingsUrl(store);

        expect(url).toBe(expectedProjectSettingsUrl);
    });
});
