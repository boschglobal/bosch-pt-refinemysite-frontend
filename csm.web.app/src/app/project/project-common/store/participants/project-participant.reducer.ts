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
import {AbstractPageableList} from '../../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {
    ParticipantActionEnum,
    ProjectParticipantActions
} from './project-participant.actions';
import {PROJECT_PARTICIPANT_SLICE_INITIAL_STATE} from './project-participant.initial-state';
import {ProjectParticipantSlice} from './project-participant.slice';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

export function projectParticipantReducer(state: ProjectParticipantSlice = PROJECT_PARTICIPANT_SLICE_INITIAL_STATE, action: ProjectParticipantActions): ProjectParticipantSlice {
    switch (action.type) {

        case ParticipantActionEnum.InitializeAll:
            return PROJECT_PARTICIPANT_SLICE_INITIAL_STATE;

        case ParticipantActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case ParticipantActionEnum.DeleteOne:
        case ParticipantActionEnum.RequestPage:
        case ParticipantActionEnum.UpdateOne:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case ParticipantActionEnum.RequestAllActive:
            return Object.assign({}, state, {
                fullList: Object.assign(new AbstractList(), state.fullList, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case ParticipantActionEnum.DeleteOneFulfilled:
            const deleteParticipantId = action.payload;

            return Object.assign({}, state, {
                items: state.items.filter(participant => participant.id !== deleteParticipantId),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case ParticipantActionEnum.DeleteOneReset:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.empty
                })
            });

        case ParticipantActionEnum.UpdateOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case ParticipantActionEnum.DeleteOneRejected:
        case ParticipantActionEnum.RequestPageRejected:
        case ParticipantActionEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case ParticipantActionEnum.RequestAllActiveRejected:
            return Object.assign({}, state, {
                fullList: Object.assign(new AbstractList(), state.fullList, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case ParticipantActionEnum.RequestPageFulfilled: {
            const {payload: {items, pageNumber, totalElements, _links}} = action;

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    _links,
                    pages: Object.assign([], state.list.pages, {
                        [pageNumber]: items.map((item: any) => item.id),
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {entries: totalElements}),
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case ParticipantActionEnum.RequestAllActiveFulfilled: {
            const requestParticipantsFulfilledAction = action;

            return Object.assign({}, state, {
                items: unionBy(requestParticipantsFulfilledAction.payload.items, state.items, 'id'),
                fullList: Object.assign(new AbstractList(), state.fullList, {
                    ids: requestParticipantsFulfilledAction.payload.items.map(participant => participant.id),
                    requestStatus: RequestStatusEnum.success,
                    _links: requestParticipantsFulfilledAction.payload._links,
                })
            });
        }

        case ParticipantActionEnum.RequestCurrent:
        case ParticipantActionEnum.CreateOne:
        case ParticipantActionEnum.RequestResendInvitation:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case ParticipantActionEnum.RequestCurrentFulfilled:
            const requestCurrentFulfilledAction = action;
            return Object.assign({}, state, {
                items: unionBy([requestCurrentFulfilledAction.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success
                })
            });

        case ParticipantActionEnum.CreateOneRejected:
        case ParticipantActionEnum.RequestCurrentRejected:
        case ParticipantActionEnum.RequestResendInvitationRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case ParticipantActionEnum.RequestOneFulfilled:
            const requestParticipantFulfilledAction = action;
            return Object.assign({}, state, {
                items: unionBy([requestParticipantFulfilledAction.payload], state.items, 'id')
            });

        case ParticipantActionEnum.RequestResendInvitationFulfilled:
        case ParticipantActionEnum.CreateOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case ParticipantActionEnum.CreateOneReset:
        case ParticipantActionEnum.RequestResendInvitationReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        case ParticipantActionEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload
                })
            });

        case ParticipantActionEnum.SetPage:
            const setParticipantsPageAction = action;
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {page: setParticipantsPageAction.payload})
                })
            });

        case ParticipantActionEnum.SetItems:
            const setParticipantsItemsAction = action;
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {items: setParticipantsItemsAction.payload})
                })
            });

        case ParticipantActionEnum.SetSort:
            const setParticipantsSortAction = action;
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    sort: setParticipantsSortAction.payload
                })
            });

        case ParticipantActionEnum.SetListFilters:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    filters: Object.assign(new ProjectParticipantFilters(), state.list.filters, {...action.payload}),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {page: 0}),
                    pages: [],
                }),
            });

        case ParticipantActionEnum.RequestActiveByRoleFulfilled:
            return Object.assign({}, state, {
                items: unionBy(action.payload.items, state.items, 'id'),
            });

        default:
            return state;
    }
}

export const PROJECT_PARTICIPANT_REDUCER: ActionReducer<ProjectParticipantSlice> = projectParticipantReducer;
