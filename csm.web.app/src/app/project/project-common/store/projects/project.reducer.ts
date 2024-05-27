/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Action,
    ActionReducer
} from '@ngrx/store';
import {
    cloneDeep,
    unionBy
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItemWithPicture} from '../../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {ProjectResource} from '../../api/projects/resources/project.resource';
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
} from './project.actions';
import {PROJECT_SLICE_INITIAL_STATE} from './project.initial-state';
import {ProjectSlice} from './project.slice';

const removeProjectPictureAttribute = (project: ProjectResource) => {
    const updatedProject = cloneDeep(project);
    delete updatedProject['_embedded']['projectPicture'];
    return updatedProject;
};

function getProjectEmbedded(project: ProjectResource): any {
    return project.hasOwnProperty('_embedded') ? {_embedded: project._embedded} : null;
}

export function projectReducer(state: ProjectSlice = PROJECT_SLICE_INITIAL_STATE, action: Action): ProjectSlice {
    switch (action.type) {

        case INITIALIZE_PROJECT:
        case INITIALIZE_PROJECT_CREATE:
        case INITIALIZE_PROJECT_EDIT:
            return Object.assign({}, state, {
                currentItem: PROJECT_SLICE_INITIAL_STATE.currentItem
            });

        case SET_CURRENT_PROJECT:
            const setCurrentProjectAction = action as ProjectActions.SetCurrentProject;
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), PROJECT_SLICE_INITIAL_STATE.currentItem, {
                    id: setCurrentProjectAction.payload
                })
            });

        case REQUEST_CURRENT_PROJECT:
            return Object.assign({}, PROJECT_SLICE_INITIAL_STATE, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case POST_PROJECT:
        case PUT_PROJECT:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                    dataRequestStatus: RequestStatusEnum.progress
                })
            });

        case POST_PROJECT_PICTURE:
        case DELETE_PROJECT_PICTURE:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                    pictureRequestStatus: RequestStatusEnum.progress
                })
            });

        case REQUEST_CURRENT_PROJECT_FULFILLED:
            const requestCurrentProjectFulfilled = action as ProjectActions.Request.CurrentProjectFulfilled;
            return Object.assign({}, state, {
                items: [...state.items.filter(item => item.id !== requestCurrentProjectFulfilled.payload.id), requestCurrentProjectFulfilled.payload],
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                })
            });

        case REQUEST_CURRENT_PROJECT_REJECTED:
        case POST_PROJECT_REJECTED:
        case PUT_PROJECT_REJECTED:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                    dataRequestStatus: RequestStatusEnum.error,
                })
            });

        case POST_PROJECT_PICTURE_REJECTED:
        case DELETE_PROJECT_PICTURE_REJECTED:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                    pictureRequestStatus: RequestStatusEnum.error
                })
            });

        case REQUEST_PROJECTS:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case REQUEST_PROJECTS_FULFILLED:
            const requestProjectsFulfilledAction = action as ProjectActions.Request.ProjectsFulfilled;
            return Object.assign({}, state, {
                userActivated: requestProjectsFulfilledAction.payload.userActivated,
                items: unionBy(requestProjectsFulfilledAction.payload.projects, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: requestProjectsFulfilledAction.payload.projects.map((item: ProjectResource) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    _links: requestProjectsFulfilledAction.payload._links
                })
            });

        case REQUEST_PROJECTS_REJECTED:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case POST_PROJECT_FULFILLED:
            const postProjectFulfilledAction = action as ProjectActions.Create.ProjectFulfilled;
            return Object.assign({}, state, {
                items: [...state.items, postProjectFulfilledAction.payload],
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    id: postProjectFulfilledAction.payload.id,
                    requestStatus: state.currentItem.pictureRequestStatus === RequestStatusEnum.progress ? state.currentItem.pictureRequestStatus : RequestStatusEnum.success,
                    dataRequestStatus: RequestStatusEnum.success
                })
            });

        case DELETE_PROJECT_PICTURE_FULFILLED:
        case POST_PROJECT_PICTURE_FULFILLED:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: state.currentItem.dataRequestStatus === RequestStatusEnum.progress ? state.currentItem.pictureRequestStatus : RequestStatusEnum.success,
                    pictureRequestStatus: RequestStatusEnum.success
                })
            });

        case PUT_PROJECT_FULFILLED:
            const putProjectFulfilledAction = action as ProjectActions.Update.ProjectFulfilled;
            return Object.assign({}, state, {
                items: [
                    ...state.items.filter(item => item.id !== putProjectFulfilledAction.payload.id),
                    Object.assign({},
                        removeProjectPictureAttribute(putProjectFulfilledAction.payload),
                        getProjectEmbedded(state.items.find(item => item.id === putProjectFulfilledAction.payload.id))
                    )
                ],
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    id: putProjectFulfilledAction.payload.id,
                    requestStatus: (state.currentItem.pictureRequestStatus === RequestStatusEnum.progress) ? state.currentItem.pictureRequestStatus : RequestStatusEnum.success,
                    dataRequestStatus: RequestStatusEnum.success
                })
            });

        case POST_PROJECT_RESET:
        case PUT_PROJECT_RESET:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItemWithPicture(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                    dataRequestStatus: RequestStatusEnum.empty,
                    pictureRequestStatus: RequestStatusEnum.empty
                })
            });

        default:
            return state;
    }
}

export const PROJECT_REDUCER: ActionReducer<ProjectSlice> = projectReducer;
