/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {TEST_PROJECT_LIST} from '../../../../../test/mocks/project-list';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2,
    MOCK_PROJECT_PICTURE
} from '../../../../../test/mocks/projects';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItemWithPicture} from '../../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListResource} from '../../api/projects/resources/project-list.resource';
import {SaveProjectPictureResource} from '../../api/projects/resources/save-project-picture.resource';
import {
    ProjectActions,
    ProjectPictureActions
} from './project.actions';
import {PROJECT_SLICE_INITIAL_STATE} from './project.initial-state';
import {PROJECT_REDUCER} from './project.reducer';
import {ProjectSlice} from './project.slice';

describe('Project Reducer', () => {
    let initialState: ProjectSlice;
    let nextState: ProjectSlice;
    let midState: ProjectSlice;

    beforeEach(() => {
        initialState = PROJECT_SLICE_INITIAL_STATE;
        nextState = cloneDeep(PROJECT_SLICE_INITIAL_STATE);
        midState = cloneDeep(PROJECT_SLICE_INITIAL_STATE);
    });

    it('should handle INITIALIZE_PROJECT', () => {
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Initialize.Project())).toEqual(initialState);
    });

    it('should handle INITIALIZE_PROJECT_CREATE', () => {
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Initialize.ProjectCreate())).toEqual(initialState);
    });

    it('should handle INITIALIZE_PROJECT_EDIT', () => {
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Initialize.ProjectEdit())).toEqual(initialState);
    });

    it('should handle SET_CURRENT_PROJECT', () => {
        const currentItemId: string = MOCK_PROJECT_1.id;
        const setCurrentProjectIdAction: Action = new ProjectActions.SetCurrentProject(currentItemId);

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            id: currentItemId
        });

        expect(PROJECT_REDUCER(initialState, setCurrentProjectIdAction)).toEqual(nextState);
    });

    it('should handle REQUEST_CURRENT_PROJECT', () => {
        const requestCurrentProjectAction: Action = new ProjectActions.Request.CurrentProject();

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress
        });
        expect(PROJECT_REDUCER(initialState, requestCurrentProjectAction)).toEqual(nextState);
    });

    it('should handle POST_PROJECT', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            dataRequestStatus: RequestStatusEnum.progress
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Create.Project(null))).toEqual(nextState);
    });

    it('should handle PUT_PROJECT', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            dataRequestStatus: RequestStatusEnum.progress
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Update.Project(null))).toEqual(nextState);
    });

    it('should handle POST_PROJECT_PICTURE', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            pictureRequestStatus: RequestStatusEnum.progress
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.CreateOrUpdate.Project(null))).toEqual(nextState);
    });

    it('should handle REQUEST_CURRENT_PROJECT_FULFILLED', () => {
        const currentProject: ProjectResource = MOCK_PROJECT_1;
        const requestCurrentProjectFulfilledAction: Action = new ProjectActions.Request.CurrentProjectFulfilled(currentProject);

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });
        nextState.items = Object.assign([], nextState.items, [currentProject]);

        expect(PROJECT_REDUCER(initialState, requestCurrentProjectFulfilledAction)).toEqual(nextState);
    });

    it('should handle REQUEST_CURRENT_PROJECT_REJECTED', () => {
        const requestCurrentProjectRejectedAction: Action = new ProjectActions.Request.CurrentProjectRejected();

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            dataRequestStatus: RequestStatusEnum.error
        });
        expect(PROJECT_REDUCER(initialState, requestCurrentProjectRejectedAction)).toEqual(nextState);
    });

    it('should handle REQUEST_PROJECTS', () => {
        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Request.Projects())).toEqual(nextState);
    });

    it('should handle REQUEST_PROJECTS_FULFILLED', () => {
        const projectListResource: ProjectListResource = TEST_PROJECT_LIST;
        nextState.items = [MOCK_PROJECT_1, MOCK_PROJECT_2];
        nextState.userActivated = true;

        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            _links: TEST_PROJECT_LIST._links,
            requestStatus: RequestStatusEnum.success,
            ids: ['c575e002-5305-4d7a-bc16-2aa88a991ca3', 'c575e002-5305-4d7a-bc16-2aa88a991ca1']
        });

        expect(PROJECT_REDUCER(initialState, new ProjectActions.Request.ProjectsFulfilled(projectListResource))).toEqual(nextState);
    });

    it('should handle REQUEST_PROJECTS_REJECTED', () => {
        nextState.list = Object.assign(new AbstractList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Request.ProjectsRejected())).toEqual(nextState);
    });

    it('should handle POST_PROJECT_FULFILLED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            dataRequestStatus: RequestStatusEnum.success,
            id: 'c575e002-5305-4d7a-bc16-2aa88a991ca3'
        });
        nextState.items = Object.assign([], nextState.items, [MOCK_PROJECT_1]);

        expect(PROJECT_REDUCER(initialState, new ProjectActions.Create.ProjectFulfilled(MOCK_PROJECT_1))).toEqual(nextState);
    });

    it('should handle POST_PROJECT_PICTURE', () => {
        const saveResource = new SaveProjectPictureResource(null, null);
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            pictureRequestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.CreateOrUpdate.Project(saveResource))).toEqual(nextState);
    });

    it('should handle DELETE_PROJECT_PICTURE', () => {
        nextState.currentItem.pictureRequestStatus = RequestStatusEnum.progress;
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            pictureRequestStatus: RequestStatusEnum.progress,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.Delete.ProjectPicture())).toEqual(nextState);
    });

    it('should handle POST_PROJECT_REJECTED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            dataRequestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Create.ProjectRejected())).toEqual(nextState);
    });

    it('should handle POST_PROJECT_RESET', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            dataRequestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Create.ProjectReset())).toEqual(nextState);
    });

    it('should handle initial state', () => {
        expect(PROJECT_REDUCER(undefined, {type: 'DEFAULT'})).toEqual(initialState);
    });

    it('should handle PUT_PROJECT_FULFILLED', () => {
        const currentProject: ProjectResource = MOCK_PROJECT_PICTURE;

        midState.items = Object.assign([], nextState.items, [MOCK_PROJECT_PICTURE]);
        nextState.items = Object.assign([], nextState.items, [MOCK_PROJECT_PICTURE]);

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            dataRequestStatus: RequestStatusEnum.success,
            id: currentProject.id
        });

        expect(PROJECT_REDUCER(midState, new ProjectActions.Update.ProjectFulfilled(currentProject))).toEqual(nextState);
    });

    it('should handle PUT_PROJECT_REJECTED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            dataRequestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Update.ProjectRejected())).toEqual(nextState);
    });

    it('should handle PUT_PROJECT_RESET', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            pictureRequestStatus: RequestStatusEnum.empty,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectActions.Update.ProjectReset())).toEqual(nextState);
    });

    it('should handle POST_PROJECT_PICTURE_FULFILLED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            pictureRequestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(null))).toEqual(nextState);
    });

    it('should handle POST_PROJECT_PICTURE_REJECTED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            pictureRequestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected())).toEqual(nextState);
    });

    it('should handle DELETE_PROJECT_PICTURE_REJECTED', () => {
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            pictureRequestStatus: RequestStatusEnum.error,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.Delete.ProjectPictureRejected())).toEqual(nextState);
    });

    it('should handle DELETE_PROJECT_PICTURE_FULFILLED', () => {
        const currentProject: ProjectResource = MOCK_PROJECT_2;
        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            pictureRequestStatus: RequestStatusEnum.success,
        });
        expect(PROJECT_REDUCER(initialState, new ProjectPictureActions.Delete.ProjectPictureFulfilled(currentProject.id))).toEqual(nextState);
    });
});
