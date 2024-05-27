/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {unionBy} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {
    ProjectCraftActions,
    ProjectCraftsActionEnum
} from './project-craft.actions';
import {PROJECT_CRAFT_SLICE_INITIAL_STATE} from './project-craft.initial-state';
import {ProjectCraftSlice} from './project-craft.slice';

const getProjectCraftsWithPosition = (projectCrafts: ProjectCraftResource[]) =>
    projectCrafts.map((projectCraft: ProjectCraftResource, index: number) => Object.assign({}, projectCraft, {position: index + 1}));

export function projectCraftReducer(
    state: ProjectCraftSlice = PROJECT_CRAFT_SLICE_INITIAL_STATE,
    action: ProjectCraftActions): ProjectCraftSlice {

    switch (action.type) {
        case ProjectCraftsActionEnum.InitializeAll:
            return PROJECT_CRAFT_SLICE_INITIAL_STATE;

        case ProjectCraftsActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: PROJECT_CRAFT_SLICE_INITIAL_STATE.currentItem,
            });

        case ProjectCraftsActionEnum.InitializeList:
            return Object.assign({}, state, {
                list: PROJECT_CRAFT_SLICE_INITIAL_STATE.list,
            });

        case ProjectCraftsActionEnum.DeleteOne:
        case ProjectCraftsActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case ProjectCraftsActionEnum.DeleteOneRejected:
        case ProjectCraftsActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case ProjectCraftsActionEnum.UpdateListFulfilled:
        case ProjectCraftsActionEnum.RequestAllFulfilled:
        case ProjectCraftsActionEnum.DeleteOneFulfilled: {
            return Object.assign({}, state, {
                items: getProjectCraftsWithPosition(action.payload.projectCrafts),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: action.payload.projectCrafts.map((item: ProjectCraftResource) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    version: action.payload.version,
                    _links: action.payload._links,
                }),
            });
        }

        case ProjectCraftsActionEnum.DeleteOneReset:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case ProjectCraftsActionEnum.CreateOne:
        case ProjectCraftsActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case ProjectCraftsActionEnum.CreateOneRejected:
        case ProjectCraftsActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case ProjectCraftsActionEnum.CreateOneReset:
        case ProjectCraftsActionEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case ProjectCraftsActionEnum.CreateOneFulfilled: {
            return Object.assign({}, state, {
                items: unionBy(getProjectCraftsWithPosition(action.payload.projectCrafts), state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: action.payload.projectCrafts.map((item: ProjectCraftResource) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    version: action.payload.version,
                    _links: action.payload._links,
                }),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case ProjectCraftsActionEnum.UpdateOneFulfilled: {
            const oldProjectCraft = state.items.find((projectCraft: ProjectCraftResource) => projectCraft.id === action.payload.id);
            const updatedProjectCraft = Object.assign({}, action.payload, {position: oldProjectCraft.position});

            return Object.assign({}, state, {
                items: unionBy([updatedProjectCraft], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case ProjectCraftsActionEnum.UpdateList: {
            const {projectCraftId, saveProjectCraft} = action.payload;
            const currentProjectCraft: ProjectCraftResource = state.items.find(
                (projectCraft: ProjectCraftResource) => projectCraft.id === projectCraftId);
            const oldPosition: number = currentProjectCraft.position;
            const newPosition: number = saveProjectCraft.position;

            const updatedCurrentProjectCraft: ProjectCraftResource = Object.assign(
                new ProjectCraftResource(),
                currentProjectCraft,
                {position: newPosition}
            );
            let origin: number = oldPosition;
            let target: number = newPosition;
            let increment = 1;

            if (oldPosition < newPosition) {
                origin = newPosition;
                target = oldPosition;
                increment = -1;
            }

            const updatedProjectCraft = state.items
                .filter((projectCraft: ProjectCraftResource) => projectCraft.id !== projectCraftId)
                .map((projectCraft: ProjectCraftResource) => {
                    const position: number = projectCraft.position;
                    return (position < origin && position >= target) || position === newPosition ? Object.assign(
                        new ProjectCraftResource(),
                        projectCraft,
                        {position: position + increment}
                    ) : projectCraft;
                })
                .concat([updatedCurrentProjectCraft])
                .sort((w1: ProjectCraftResource, w2: ProjectCraftResource) => w1.position - w2.position);

            const ids: string[] = updatedProjectCraft.map((projectCraft: ProjectCraftResource) => projectCraft.id);

            return Object.assign({}, state, {
                items: unionBy(updatedProjectCraft, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids,
                    version: state.list.version + 1,
                }),
            });
        }

        default:
            return state;
    }
}

export const PROJECT_CRAFT_REDUCER: ActionReducer<ProjectCraftSlice> = projectCraftReducer;
