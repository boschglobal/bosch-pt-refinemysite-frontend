/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListResource} from '../../api/projects/resources/project-list.resource';
import {ProjectPictureResource} from '../../api/projects/resources/project-picture.resource';
import {SaveProjectResource} from '../../api/projects/resources/save-project.resource';
import {SaveProjectPictureResource} from '../../api/projects/resources/save-project-picture.resource';

export const INITIALIZE_PROJECT = 'INITIALIZE_PROJECT';
export const INITIALIZE_PROJECT_EDIT = 'INITIALIZE_PROJECT_EDIT';
export const INITIALIZE_PROJECT_CREATE = 'INITIALIZE_PROJECT_CREATE';

export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT';

export const REQUEST_CURRENT_PROJECT = 'REQUEST_CURRENT_PROJECT';
export const REQUEST_CURRENT_PROJECT_FULFILLED = 'REQUEST_CURRENT_PROJECT_FULFILLED';
export const REQUEST_CURRENT_PROJECT_REJECTED = 'REQUEST_CURRENT_PROJECT_REJECTED';

export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const REQUEST_PROJECTS_FULFILLED = 'REQUEST_PROJECTS_FULFILLED';
export const REQUEST_PROJECTS_REJECTED = 'REQUEST_PROJECTS_REJECTED';

export const POST_PROJECT = 'POST_PROJECT';
export const POST_PROJECT_FULFILLED = 'POST_PROJECT_FULFILLED';
export const POST_PROJECT_REJECTED = 'POST_PROJECT_REJECTED';
export const POST_PROJECT_RESET = 'POST_PROJECT_RESET';

export const PUT_PROJECT = 'PUT_PROJECT';
export const PUT_PROJECT_FULFILLED = 'PUT_PROJECT_FULFILLED';
export const PUT_PROJECT_REJECTED = 'PUT_PROJECT_REJECTED';
export const PUT_PROJECT_RESET = 'PUT_PROJECT_RESET';

export const POST_PROJECT_PICTURE = 'POST_PROJECT_PICTURE';
export const POST_PROJECT_PICTURE_FULFILLED = 'POST_PROJECT_PICTURE_FULFILLED';
export const POST_PROJECT_PICTURE_REJECTED = 'POST_PROJECT_PICTURE_REJECTED';

export const DELETE_PROJECT_PICTURE = 'DELETE_PROJECT_PICTURE';
export const DELETE_PROJECT_PICTURE_FULFILLED = 'DELETE_PROJECT_PICTURE_FULFILLED';
export const DELETE_PROJECT_PICTURE_REJECTED = 'DELETE_PROJECT_PICTURE_REJECTED';
export const DELETE_PROJECT_PICTURE_RESET = 'DELETE_PROJECT_PICTURE_RESET';

export namespace ProjectActions {

    export namespace Initialize {
        export class Project implements Action {
            type = INITIALIZE_PROJECT;

            constructor() {
            }
        }

        export class ProjectEdit implements Action {
            type = INITIALIZE_PROJECT_EDIT;

            constructor() {
            }
        }

        export class ProjectCreate implements Action {
            type = INITIALIZE_PROJECT_CREATE;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class CurrentProject implements Action {
            type = REQUEST_CURRENT_PROJECT;

            constructor() {
            }
        }

        export class CurrentProjectFulfilled implements Action {
            type = REQUEST_CURRENT_PROJECT_FULFILLED;

            constructor(public payload: ProjectResource) {
            }
        }

        export class CurrentProjectRejected implements Action {
            type = REQUEST_CURRENT_PROJECT_REJECTED;
        }

        export class Projects implements Action {
            type = REQUEST_PROJECTS;

            constructor() {
            }
        }

        export class ProjectsFulfilled implements Action {
            type = REQUEST_PROJECTS_FULFILLED;

            constructor(public payload: ProjectListResource) {
            }
        }

        export class ProjectsRejected implements Action {
            type = REQUEST_PROJECTS_REJECTED;
        }
    }

    export namespace Create {
        export class Project implements Action {
            type = POST_PROJECT;

            constructor(public payload: { project: SaveProjectResource, picture: File }) {
            }
        }

        export class ProjectFulfilled implements Action {
            type = POST_PROJECT_FULFILLED;

            constructor(public payload: ProjectResource) {
            }
        }

        export class ProjectRejected implements Action {
            type = POST_PROJECT_REJECTED;

            constructor() {
            }
        }

        export class ProjectReset implements Action {
            type = POST_PROJECT_RESET;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class Project implements Action {
            type = PUT_PROJECT;

            constructor(public payload: SaveProjectResource) {
            }
        }

        export class ProjectFulfilled implements Action {
            type = PUT_PROJECT_FULFILLED;

            constructor(public payload: ProjectResource) {
            }
        }

        export class ProjectRejected implements Action {
            type = PUT_PROJECT_REJECTED;

            constructor() {
            }
        }

        export class ProjectReset implements Action {
            type = PUT_PROJECT_RESET;

            constructor() {
            }
        }
    }

    export class SetCurrentProject implements Action {
        type = SET_CURRENT_PROJECT;

        constructor(public payload: string) {
        }
    }
}

export namespace ProjectPictureActions {

    export namespace CreateOrUpdate {

        export class Project implements Action {
            type = POST_PROJECT_PICTURE;

            constructor(public payload: SaveProjectPictureResource, public isProjectEdited = false) {
            }
        }

        export class ProjectPictureFulfilled implements Action {
            type = POST_PROJECT_PICTURE_FULFILLED;

            constructor(public payload: ProjectPictureResource, public isProjectEdited = false) {
            }
        }

        export class ProjectPictureRejected implements Action {
            type = POST_PROJECT_PICTURE_REJECTED;

            constructor() {
            }
        }
    }

    export namespace Delete {

        export class ProjectPicture implements Action {
            type = DELETE_PROJECT_PICTURE;

            constructor(public isProjectEdited = false) {
            }
        }

        export class ProjectPictureFulfilled implements Action {
            type = DELETE_PROJECT_PICTURE_FULFILLED;

            constructor(public payload: string, public isProjectEdited = false) {
            }
        }

        export class ProjectPictureRejected implements Action {
            type = DELETE_PROJECT_PICTURE_REJECTED;

            constructor() {
            }
        }
    }
}
