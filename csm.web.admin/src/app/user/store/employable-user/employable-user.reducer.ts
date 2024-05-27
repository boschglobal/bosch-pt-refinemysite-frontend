/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    isEqual,
    unionBy
} from 'lodash';

import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {EmployableUserFilter} from '../../api/resources/employable-user-filter.resource';
import {EmployableUserResource} from '../../api/resources/employable-user.resource';
import {EMPLOYABLE_USER_SLICE_INITIAL_STATE} from './employable-user.initial-state';
import {
    EmployableUserActions,
    EmployableUserActionEnum
} from './employable-user.actions';
import {EmployableUserSlice} from './employable-user.slice';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';

export function employableUserReducer(state: EmployableUserSlice = EMPLOYABLE_USER_SLICE_INITIAL_STATE,
                                      action: EmployableUserActions): EmployableUserSlice {
    switch (action.type) {

        case EmployableUserActionEnum.InitializeFilter:
            const hasFilters = !isEqual(state.list.filter, new EmployableUserFilter());

            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: Object.assign([], hasFilters ? [] : state.list.pages),
                    filter: new EmployableUserFilter(),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    }),
                    sort: EMPLOYABLE_USER_SLICE_INITIAL_STATE.list.sort
                }),
            });

        case EmployableUserActionEnum.RequestPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case EmployableUserActionEnum.RequestPageRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case EmployableUserActionEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case EmployableUserActionEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload
                })
            });

        case EmployableUserActionEnum.RequestPageFulfilled:
            const requestPageFulfilledAction = action;
            return Object.assign({}, state, {
                items: unionBy(requestPageFulfilledAction.payload.items, state.items, item => item.user.id),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: Object.assign([], state.list.pages, {
                        [requestPageFulfilledAction.payload.pageNumber]:
                            requestPageFulfilledAction.payload.items.map((item: EmployableUserResource) => item.user.id)
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination,
                        {totalElements: requestPageFulfilledAction.payload.totalElements}),
                    requestStatus: RequestStatusEnum.Success,
                    _links: requestPageFulfilledAction.payload._links
                })
            });

        case EmployableUserActionEnum.SetPageSize:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageSize: action.payload,
                        pageNumber: 0
                    })
                })
            });

        case EmployableUserActionEnum.SetPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {pageNumber: action.payload})
                })
            });

        case EmployableUserActionEnum.SetSort:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    sort: action.payload
                })
            });

        case EmployableUserActionEnum.SetFilter:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    filter: Object.assign(new EmployableUserFilter(), state.list.filter, action.payload),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    })
                })
            });

        default:
            return state;
    }
}

export const EMPLOYABLE_USER_REDUCER = employableUserReducer;
