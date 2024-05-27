/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    unionBy,
    isEqual,
} from 'lodash';

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {ProjectFiltersResource} from '../api/resources/project-filters.resource';
import {ProjectResource} from '../api/resources/project.resource';
import {
    ProjectActions,
    ProjectActionsEnum,
} from './project.actions';
import {
    ProjectList,
    ProjectSlice,
} from './project.slice';
import {PROJECT_SLICE_INITIAL_STATE} from './project.initial-state';

export function projectReducer(state: ProjectSlice = PROJECT_SLICE_INITIAL_STATE, action: ProjectActions): ProjectSlice {
    switch (action.type) {
        case ProjectActionsEnum.InitializeAll:
            return PROJECT_SLICE_INITIAL_STATE;

        case ProjectActionsEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case ProjectActionsEnum.InitializeFilters:
            const hasFilters = !isEqual(state.list.filters, new ProjectFiltersResource());

            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    pages: Object.assign([], hasFilters ? [] : state.list.pages),
                    filters: new ProjectFiltersResource(),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    })
                }),
            });

        case ProjectActionsEnum.DeleteOne:
        case ProjectActionsEnum.RequestOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case ProjectActionsEnum.DeleteOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Empty
                })
            });

        case ProjectActionsEnum.DeleteOneRejected:
        case ProjectActionsEnum.RequestOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case ProjectActionsEnum.DeleteOneFulfilled:
            const deletedProjectId = action.id;

            return Object.assign({}, state, {
                items: state.items.filter(project => project.id !== deletedProjectId),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case ProjectActionsEnum.RequestOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case ProjectActionsEnum.RequestPage:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case ProjectActionsEnum.RequestPageRejected:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case ProjectActionsEnum.RequestPageFulfilled:
            const {projects, pageNumber, totalElements, totalPages, _links, userActivated} = action.payload;

            return Object.assign({}, state, {
                userActivated,
                items: unionBy(projects, state.items, 'id'),
                list: Object.assign(new ProjectList(), state.list, {
                    pages: Object.assign([], state.list.pages, {
                        [pageNumber]: projects.map((item: ProjectResource) => item.id)
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {totalElements, totalPages}),
                    requestStatus: RequestStatusEnum.Success,
                    _links
                })
            });

        case ProjectActionsEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload
                })
            });

        case ProjectActionsEnum.SetFilters:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    pages: [],
                    filters: Object.assign(new ProjectFiltersResource(), action.payload),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    })
                }),
            });

        case ProjectActionsEnum.SetPage:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {pageNumber: action.payload})
                })
            });

        case ProjectActionsEnum.SetPageSize:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageSize: action.payload,
                        pageNumber: 0
                    })
                })
            });

        case ProjectActionsEnum.SetSort:
            return Object.assign({}, state, {
                list: Object.assign(new ProjectList(), state.list, {
                    pages: [],
                    sort: action.payload
                })
            });

        default:
            return state;
    }
}

export const PROJECT_REDUCER = projectReducer;
