/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {unionBy} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {
    WorkareaActionEnum,
    WorkareaActions
} from './workarea.actions';
import {WORKAREA_SLICE_INITIAL_STATE} from './workarea.initial-state';
import {WorkareaSlice} from './workarea.slice';

const getWorkareasWithPosition = (workAreas: WorkareaResource[]) => {
    return workAreas.map((workarea: WorkareaResource, index: number) => Object.assign({}, workarea, {position: index + 1}));
};

export function workareaReducer(state: WorkareaSlice = WORKAREA_SLICE_INITIAL_STATE, action: WorkareaActions): WorkareaSlice {

    switch (action.type) {
        case WorkareaActionEnum.InitializeAll:
            return WORKAREA_SLICE_INITIAL_STATE;

        case WorkareaActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case WorkareaActionEnum.InitializeList:
            return Object.assign({}, state, {
                list: new AbstractList()
            });

        case WorkareaActionEnum.DeleteOne:
        case WorkareaActionEnum.RequestAll:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case WorkareaActionEnum.DeleteOneRejected:
        case WorkareaActionEnum.RequestAllRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case WorkareaActionEnum.DeleteOneFulfilled:
                const deleteOneWorkareaFulfilledAction = action;

                return Object.assign({}, state, {
                    items: getWorkareasWithPosition(deleteOneWorkareaFulfilledAction.payload.workAreas),
                    list: Object.assign(new AbstractList(), state.list, {
                        ids: deleteOneWorkareaFulfilledAction.payload.workAreas.map((item: WorkareaResource) => item.id),
                        requestStatus: RequestStatusEnum.success,
                        version: deleteOneWorkareaFulfilledAction.payload.version,
                        _links: deleteOneWorkareaFulfilledAction.payload._links
                    })
                });

        case WorkareaActionEnum.DeleteOneReset:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case WorkareaActionEnum.RequestAllFulfilled:
            const requestAllWorkareasFulfilledAction = action;

            return Object.assign({}, state, {
                items: unionBy(getWorkareasWithPosition(requestAllWorkareasFulfilledAction.payload.workAreas), state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: requestAllWorkareasFulfilledAction.payload.workAreas.map((item: WorkareaResource) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    version: requestAllWorkareasFulfilledAction.payload.version,
                    _links: requestAllWorkareasFulfilledAction.payload._links
                })
            });

        case WorkareaActionEnum.CreateOne:
        case WorkareaActionEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case WorkareaActionEnum.CreateOneRejected:
        case WorkareaActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case WorkareaActionEnum.CreateOneReset:
        case WorkareaActionEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case WorkareaActionEnum.CreateOneFulfilled:
            const workareaPostFulfilledAction = action;

            return Object.assign({}, state, {
                items: unionBy(getWorkareasWithPosition(workareaPostFulfilledAction.payload.workAreas), state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: workareaPostFulfilledAction.payload.workAreas.map((item: any) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    version: workareaPostFulfilledAction.payload.version,
                    _links: workareaPostFulfilledAction.payload._links
                }),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case WorkareaActionEnum.UpdateListFulfilled:
            const workareaListFulfilledAction = action;

            return Object.assign({}, state, {
                items: unionBy(getWorkareasWithPosition(workareaListFulfilledAction.payload.workAreas), state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: workareaListFulfilledAction.payload.workAreas.map((item: any) => item.id),
                    requestStatus: RequestStatusEnum.success,
                    version: workareaListFulfilledAction.payload.version,
                    _links: workareaListFulfilledAction.payload._links
                })
            });

        case WorkareaActionEnum.UpdateOneFulfilled:
            const oldWorkarea = state.items.find((workarea: WorkareaResource) => workarea.id === action.payload.id);
            const updatedWorkarea = Object.assign({}, action.payload, {position: oldWorkarea.position});

            return Object.assign({}, state, {
                items: unionBy([updatedWorkarea], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case WorkareaActionEnum.UpdateList:
            const putWorkareaListAction: WorkareaActions.Update.List = action;
            const {workareaId, saveWorkarea} = putWorkareaListAction.payload;
            const currentWorkarea: WorkareaResource = state.items.find((workarea: WorkareaResource) => workarea.id === workareaId);
            const oldPosition: number = currentWorkarea.position;
            const newPosition: number = saveWorkarea.position;

            const updatedCurrentWorkarea: WorkareaResource = Object.assign(
                new WorkareaResource(),
                currentWorkarea,
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

            const updatedWorareas = state.items
                .filter((workarea: WorkareaResource) => workarea.id !== workareaId)
                .map((workarea: WorkareaResource) => {
                    const position: number = workarea.position;
                    return (position < origin && position >= target) || position === newPosition ? Object.assign(
                        new WorkareaResource(),
                        workarea,
                        {position: position + increment}
                    ) : workarea;
                })
                .concat([updatedCurrentWorkarea])
                .sort((w1: WorkareaResource, w2: WorkareaResource) => w1.position - w2.position);

            const ids: string[] = updatedWorareas.map((workarea: WorkareaResource) => workarea.id);

            return Object.assign({}, state, {
                items: unionBy(updatedWorareas, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids,
                    version: state.list.version + 1
                }),
            });

        default:
            return state;
    }
}

export const WORKAREA_REDUCER: ActionReducer<WorkareaSlice> = workareaReducer;
