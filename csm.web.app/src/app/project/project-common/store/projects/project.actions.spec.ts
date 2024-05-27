/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DELETE_PROJECT_PICTURE,
    DELETE_PROJECT_PICTURE_FULFILLED,
    DELETE_PROJECT_PICTURE_REJECTED,
    INITIALIZE_PROJECT,
    INITIALIZE_PROJECT_CREATE,
    INITIALIZE_PROJECT_EDIT,
    POST_PROJECT,
    POST_PROJECT_FULFILLED,
    POST_PROJECT_PICTURE,
    POST_PROJECT_PICTURE_FULFILLED,
    POST_PROJECT_PICTURE_REJECTED,
    POST_PROJECT_REJECTED,
    POST_PROJECT_RESET,
    ProjectActions,
    ProjectPictureActions,
    PUT_PROJECT,
    PUT_PROJECT_FULFILLED,
    PUT_PROJECT_REJECTED,
    PUT_PROJECT_RESET,
    REQUEST_CURRENT_PROJECT,
    REQUEST_CURRENT_PROJECT_FULFILLED,
    REQUEST_CURRENT_PROJECT_REJECTED,
    REQUEST_PROJECTS,
    REQUEST_PROJECTS_FULFILLED,
    REQUEST_PROJECTS_REJECTED,
    SET_CURRENT_PROJECT
} from '../../../../../app/project/project-common/store/projects/project.actions';

describe('Project Actions', () => {
    it('should check ProjectActions.Initialize.Project() type', () => {
        expect(new ProjectActions.Initialize.Project().type).toBe(INITIALIZE_PROJECT);
    });

    it('should check ProjectActions.SetCurrentProject() type', () => {
        expect(new ProjectActions.SetCurrentProject(null).type).toBe(SET_CURRENT_PROJECT);
    });

    it('should check ProjectActions.Initialize.ProjectCreate() type', () => {
        expect(new ProjectActions.Initialize.ProjectCreate().type).toBe(INITIALIZE_PROJECT_CREATE);
    });

    it('should check ProjectActions.Create.Project() type', () => {
        expect(new ProjectActions.Create.Project(null).type).toBe(POST_PROJECT);
    });

    it('should check ProjectPictureActions.CreateOrUpdate.Project() type', () => {
        expect(new ProjectPictureActions.CreateOrUpdate.Project(null).type).toBe(POST_PROJECT_PICTURE);
    });

    it('should check ProjectActions.Create.ProjectFulfilled() type', () => {
        expect(new ProjectActions.Create.ProjectFulfilled(null).type).toBe(POST_PROJECT_FULFILLED);
    });

    it('should check ProjectActions.Create.ProjectRejected() type', () => {
        expect(new ProjectActions.Create.ProjectRejected().type).toBe(POST_PROJECT_REJECTED);
    });

    it('should check ProjectActions.Create.ProjectReset() type', () => {
        expect(new ProjectActions.Create.ProjectReset().type).toBe(POST_PROJECT_RESET);
    });

    it('should check ProjectActions.Initialize.ProjectEdit() type', () => {
        expect(new ProjectActions.Initialize.ProjectEdit().type).toBe(INITIALIZE_PROJECT_EDIT);
    });

    it('should check ProjectActions.Update.Project() type', () => {
        expect(new ProjectActions.Update.Project(null).type).toBe((PUT_PROJECT));
    });

    it('should check ProjectActions.Update.ProjectFulfille() type', () => {
        expect(new ProjectActions.Update.ProjectFulfilled(null).type).toBe((PUT_PROJECT_FULFILLED));
    });

    it('should check ProjectActions.Update.ProjectRejected() type', () => {
        expect(new ProjectActions.Update.ProjectRejected().type).toBe((PUT_PROJECT_REJECTED));
    });

    it('should check ProjectActions.Update.ProjectReset() type', () => {
        expect(new ProjectActions.Update.ProjectReset().type).toBe((PUT_PROJECT_RESET));
    });

    it('should check ProjectPictureActions.Delete.ProjectPicture() type', () => {
        expect(new ProjectPictureActions.Delete.ProjectPicture().type).toBe((DELETE_PROJECT_PICTURE));
    });

    it('should check ProjectPictureActions.Delete.ProjectPictureFulfilled() type', () => {
        expect(new ProjectPictureActions.Delete.ProjectPictureFulfilled(null).type).toBe((DELETE_PROJECT_PICTURE_FULFILLED));
    });

    it('should check ProjectPictureActions.Delete.ProjectPictureRejected() type', () => {
        expect(new ProjectPictureActions.Delete.ProjectPictureRejected().type).toBe((DELETE_PROJECT_PICTURE_REJECTED));
    });

    it('should check ProjectActions.Request.CurrentProject() type', () => {
        expect(new ProjectActions.Request.CurrentProject().type).toBe((REQUEST_CURRENT_PROJECT));
    });

    it('should check ProjectActions.Request.CurrentProjectFulfilled() type', () => {
        expect(new ProjectActions.Request.CurrentProjectFulfilled(null).type).toBe((REQUEST_CURRENT_PROJECT_FULFILLED));
    });

    it('should check ProjectActions.Request.CurrentProjectRejected() type', () => {
        expect(new ProjectActions.Request.CurrentProjectRejected().type).toBe((REQUEST_CURRENT_PROJECT_REJECTED));
    });

    it('should check ProjectActions.Request.Projects() type', () => {
        expect(new ProjectActions.Request.Projects().type).toBe((REQUEST_PROJECTS));
    });

    it('should check ProjectActions.Request.ProjectsFulfilled() type', () => {
        expect(new ProjectActions.Request.ProjectsFulfilled(null).type).toBe((REQUEST_PROJECTS_FULFILLED));
    });

    it('should check ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled() type', () => {
        expect(new ProjectPictureActions.CreateOrUpdate.ProjectPictureFulfilled(null).type).toBe((POST_PROJECT_PICTURE_FULFILLED));
    });

    it('should check ProjectActions.Request.ProjectsRejected() type', () => {
        expect(new ProjectActions.Request.ProjectsRejected().type).toBe((REQUEST_PROJECTS_REJECTED));
    });

    it('should check ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected() type', () => {
        expect(new ProjectPictureActions.CreateOrUpdate.ProjectPictureRejected().type).toBe((POST_PROJECT_PICTURE_REJECTED));
    });
});
