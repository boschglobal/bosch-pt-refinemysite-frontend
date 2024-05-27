/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import * as moment from 'moment';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';
import {take} from 'rxjs/operators';

import {
    TEST_PROJECT_LIST,
    TEST_PROJECT_LIST_EMPTY,
    TEST_PROJECT_LIST_ONE_OF_TWO_PAGE,
    TEST_PROJECT_LIST_TWO_OF_TWO_PAGE,
} from '../../../../../test/mocks/project-list';
import {PROJECT_PICTURE_1} from '../../../../../test/mocks/project-picture';
import {
    MOCK_POST_PROJECT_SUCCESS_ALERT_PAYLOAD,
    MOCK_PROJECT_1,
    MOCK_PUT_PROJECT_SUCCESS_ALERT_PAYLOAD
} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ProjectService} from '../../api/projects/project.service';
import {ProjectPictureService} from '../../api/projects/project-picture.service';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListResource} from '../../api/projects/resources/project-list.resource';
import {ProjectPictureResource} from '../../api/projects/resources/project-picture.resource';
import {SaveProjectResource} from '../../api/projects/resources/save-project.resource';
import {SaveProjectPictureResource} from '../../api/projects/resources/save-project-picture.resource';
import {
    ProjectActions,
    ProjectPictureActions
} from './project.actions';
import {ProjectEffects} from './project.effects';

describe('Project Effects', () => {
    let projectEffects: ProjectEffects;
    let projectService: any;
    let projectPictureService: any;
    let actions: ReplaySubject<any>;

    const SAVE_PROJECT_RESOURCE: SaveProjectResource = {
        title: 'José',
        description: '',
        projectNumber: '99',
        start: moment(),
        end: moment().add(1, 'day'),
        client: null,
        category: null,
        address: {
            zipCode: '0000-999',
            houseNumber: '77',
            city: 'Coverage',
            street: 'Street'
        }
    };

    const CREATE_PROJECT_SIMPLE: any = {
        project: SAVE_PROJECT_RESOURCE,
        picture: null
    };

    const CREATE_PROJECT_FULL: any = {
        project: SAVE_PROJECT_RESOURCE,
        picture: new File([''], 'filename')
    };

    const UPLOAD_PROJECT_PICTURE: SaveProjectPictureResource = {
        id: MOCK_PROJECT_1.id,
        picture: new File([''], 'filename')
    };

    const errorResponse: Observable<any> = throwError('error');
    const findProjectsOneOfOnePageResponse: Observable<ProjectListResource> = of(TEST_PROJECT_LIST);
    const findProjectsOneOfTwoPageResponse: Observable<ProjectListResource> = of(TEST_PROJECT_LIST_ONE_OF_TWO_PAGE);
    const findProjectsTwoOfTwoPageResponse: Observable<ProjectListResource> = of(TEST_PROJECT_LIST_TWO_OF_TWO_PAGE);
    const findProjectsEmptyPageResponse: Observable<ProjectListResource> = of(TEST_PROJECT_LIST_EMPTY);
    const findOneProjectResponse: Observable<ProjectResource> = of(MOCK_PROJECT_1);
    const createProjectResponse: Observable<ProjectResource> = of(MOCK_PROJECT_1);
    const uploadProjectPictureResponse: Observable<ProjectPictureResource> = of(PROJECT_PICTURE_1);
    const pageNumber = 0;
    const pageSize = 20;

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectService,
                useValue: jasmine.createSpyObj('ProjectService', ['findOne', 'findAll', 'create', 'update'])
            },
            {
                provide: ProjectPictureService,
                useValue: jasmine.createSpyObj('ProjectPictureService', ['upload', 'findByProjectId', 'remove'])
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                items: [MOCK_PROJECT_1],
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
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

    beforeEach(() => {
        projectEffects = TestBed.inject(ProjectEffects);
        projectService = TestBed.inject(ProjectService);
        projectPictureService = TestBed.inject(ProjectPictureService);
        actions = new ReplaySubject(1);

        projectService.findAll.calls.reset();
    });

    it('should trigger a ProjectActions.Request.ProjectsFulfilled action after requesting projects successfully ' +
        'and there\'s only one page', () => {
        const expectedResult = new ProjectActions.Request.ProjectsFulfilled(TEST_PROJECT_LIST);

        projectService.findAll.and.returnValue(findProjectsOneOfOnePageResponse);
        actions.next(new ProjectActions.Request.Projects());
        projectEffects.requestAll$.subscribe(result => {
            expect(projectService.findAll).toHaveBeenCalledWith(pageNumber, pageSize);
            expect(projectService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Request.ProjectsFulfilled action after requesting projects successfully ' +
        'and there are two pages', () => {
        const expectedPayload: ProjectListResource = {
            ...TEST_PROJECT_LIST_ONE_OF_TWO_PAGE,
            projects: [
                ...TEST_PROJECT_LIST_ONE_OF_TWO_PAGE.projects,
                ...TEST_PROJECT_LIST_TWO_OF_TWO_PAGE.projects
            ],
        };
        const expectedResult = new ProjectActions.Request.ProjectsFulfilled(expectedPayload);

        projectService.findAll.and.returnValues(findProjectsOneOfTwoPageResponse, findProjectsTwoOfTwoPageResponse);
        actions.next(new ProjectActions.Request.Projects());
        projectEffects.requestAll$.subscribe(result => {
            expect(projectService.findAll).toHaveBeenCalledTimes(2);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Request.ProjectsFulfilled action after requesting projects successfully ' +
        'and no projects are returned', () => {
        const expectedResult = new ProjectActions.Request.ProjectsFulfilled(TEST_PROJECT_LIST_EMPTY);

        projectService.findAll.and.returnValues(findProjectsEmptyPageResponse);
        actions.next(new ProjectActions.Request.Projects());
        projectEffects.requestAll$.subscribe(result => {
            expect(projectService.findAll).toHaveBeenCalledWith(pageNumber, pageSize);
            expect(projectService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Request.ProjectsRejected action after requesting projects has failed', () => {
        const expectedResult = new ProjectActions.Request.ProjectsRejected();

        projectService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectActions.Request.Projects());
        projectEffects.requestAll$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Request.CurrentProject action after the current project changes', () => {
        const expectedResult: Action = new ProjectActions.Request.CurrentProject();
        const projectId: string = MOCK_PROJECT_1.id;
        let resultFromEffect = null;

        actions.next(new ProjectActions.SetCurrentProject(projectId));
        projectEffects.triggerRequestActions$.subscribe(result => resultFromEffect = result);
        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a ProjectActions.Request.CurrentProject action after the current project picture is deleted', () => {
        const expectedResult: Action = new ProjectActions.Request.CurrentProject();
        let resultFromEffect = null;

        projectService.findOne.and.returnValue(findOneProjectResponse);
        actions.next(new ProjectPictureActions.Delete.ProjectPictureFulfilled(null));
        projectEffects.triggerRequestActions$.subscribe(result => resultFromEffect = result);
        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a ProjectActions.Request.CurrentProject action after the current project picture is updated', () => {
        const expectedResult: Action = new ProjectActions.Request.CurrentProject();
        let resultFromEffect = null;

        projectService.findOne.and.returnValue(findOneProjectResponse);
        actions.next(new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(null));
        projectEffects.triggerRequestActions$.subscribe(result => resultFromEffect = result);
        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a ProjectActions.Request.CurrentProjectFulfilled action after requesting current project successfully', () => {
        const expectedResult = new ProjectActions.Request.CurrentProjectFulfilled(MOCK_PROJECT_1);

        projectService.findOne.and.returnValue(findOneProjectResponse);
        actions.next(new ProjectActions.Request.CurrentProject());
        projectEffects.requestCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Request.CurrentProjectRejected action after requesting current project has failed', () => {
        const expectedResult = new ProjectActions.Request.CurrentProjectRejected();

        projectService.findOne.and.returnValue(errorResponse);
        actions.next(new ProjectActions.Request.CurrentProject());
        projectEffects.requestCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Create.ProjectFulfilled action after creating a project successfully', () => {
        const expectedResult = new ProjectActions.Create.ProjectFulfilled(MOCK_PROJECT_1);

        projectService.create.and.returnValue(createProjectResponse);
        actions.next(new ProjectActions.Create.Project(CREATE_PROJECT_SIMPLE));
        projectEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Create.ProjectFulfilled action after creating a full project information successfully', () => {
        const expectedResult = new ProjectActions.Create.ProjectFulfilled(MOCK_PROJECT_1);

        projectService.create.and.returnValue(createProjectResponse);
        actions.next(new ProjectActions.Create.Project(CREATE_PROJECT_FULL));
        projectEffects.create$.pipe(take(1)).subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Create.ProjectRejected action after the creation of a project has failed', () => {
        const expectedResult = new ProjectActions.Create.ProjectRejected();

        projectService.create.and.returnValue(errorResponse);
        actions.next(new ProjectActions.Create.Project(CREATE_PROJECT_SIMPLE));
        projectEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Update.ProjectFulfilled action after put project successfully', () => {
        const expectedResult = new ProjectActions.Update.ProjectFulfilled(MOCK_PROJECT_1);

        projectService.update.and.returnValue(createProjectResponse);
        actions.next(new ProjectActions.Update.Project(SAVE_PROJECT_RESOURCE));
        projectEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectActions.Update.ProjectRejected action after put project has failed', () => {
        const expectedResult = new ProjectActions.Update.ProjectRejected();

        projectService.update.and.returnValue(errorResponse);
        actions.next(new ProjectActions.Update.Project(SAVE_PROJECT_RESOURCE));
        projectEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled action ' +
        'after uploading a project picture successfully', () => {
        const expectedResult = new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(PROJECT_PICTURE_1);

        projectPictureService.upload.and.returnValue(uploadProjectPictureResponse);
        actions.next(new ProjectPictureActions.CreateOrUpdate.Project(UPLOAD_PROJECT_PICTURE));
        projectEffects.uploadPicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected action ' +
        'after uploading a project picture has failed', () => {
        const expectedResult = new ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected();

        projectPictureService.upload.and.returnValue(errorResponse);
        actions.next(new ProjectPictureActions.CreateOrUpdate.Project(UPLOAD_PROJECT_PICTURE));
        projectEffects.uploadPicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectPictureActions.Delete.ProjectPictureFulfilled action after deleting a project picture successfully', () => {
        const expectedResult = new ProjectPictureActions.Delete.ProjectPictureFulfilled(MOCK_PROJECT_1.id);

        projectPictureService.remove.and.returnValue(uploadProjectPictureResponse);
        actions.next(new ProjectPictureActions.Delete.ProjectPicture());
        projectEffects.deletePicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectPictureActions.Delete.ProjectPictureRejected action after deleting a project picture has failed', () => {
        const expectedResult = new ProjectPictureActions.Delete.ProjectPictureRejected();

        projectPictureService.remove.and.returnValue(errorResponse);
        actions.next(new ProjectPictureActions.Delete.ProjectPicture());
        projectEffects.deletePicture$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after a ' +
        'ProjectActions.Create.ProjectFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_POST_PROJECT_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectActions.Create.ProjectFulfilled(MOCK_PROJECT_1));
        projectEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after a ' +
        'ProjectActions.Update.ProjectFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_PUT_PROJECT_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectActions.Update.ProjectFulfilled(MOCK_PROJECT_1));
        projectEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with success payload after a ' +
        'ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_PUT_PROJECT_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(PROJECT_PICTURE_1));
        projectEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });

    it('should not trigger a AlertActions.Add.SuccessAlert action with success payload after a ' +
        'ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled action is triggered', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_PUT_PROJECT_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(PROJECT_PICTURE_1, true));
        projectEffects.requestSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
        });
    });
});
