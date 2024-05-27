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

import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {
    CompanyActions,
    CompanyActionsEnum
} from './company.actions';
import {CompanyFilterData} from '../api/resources/company-filter.resource';
import {
    COMPANY_SLICE_INITIAL_STATE,
    CompanySlice
} from './company.slice';

export function companyReducer(state: CompanySlice = COMPANY_SLICE_INITIAL_STATE, action: CompanyActions): CompanySlice {
    switch (action.type) {
        case CompanyActionsEnum.InitializeAll:
            return COMPANY_SLICE_INITIAL_STATE;

        case CompanyActionsEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case CompanyActionsEnum.RequestPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case CompanyActionsEnum.CreateOne:
        case CompanyActionsEnum.DeleteOne:
        case CompanyActionsEnum.RequestOne:
        case CompanyActionsEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case CompanyActionsEnum.DeleteOneFulfilled:
            const deleteCompanyId = action.id;
            return Object.assign({}, state, {
                items: state.items.filter(company => company.id !== deleteCompanyId),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case CompanyActionsEnum.CreateOneReset:
        case CompanyActionsEnum.DeleteOneReset:
        case CompanyActionsEnum.UpdateOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Empty
                })
            });

        case CompanyActionsEnum.RequestPageRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case CompanyActionsEnum.CreateOneRejected:
        case CompanyActionsEnum.DeleteOneRejected:
        case CompanyActionsEnum.RequestOneRejected:
        case CompanyActionsEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case CompanyActionsEnum.CreateOneFulfilled:
        case CompanyActionsEnum.UpdateOneFulfilled:
        case CompanyActionsEnum.RequestOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case CompanyActionsEnum.RequestSuggestionsFulfilled:
            return Object.assign({}, state, {
                suggestions: Object.assign([], action.payload.items)
            });

        case CompanyActionsEnum.RequestPageFulfilled:
            const requestCraftPageFulfilledAction = action;
            return Object.assign({}, state, {
                items: unionBy(requestCraftPageFulfilledAction.payload.items, state.items, 'id'),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: Object.assign([], state.list.pages, {
                        [requestCraftPageFulfilledAction.payload.pageNumber]:
                            requestCraftPageFulfilledAction.payload.items.map((item: any) => item.id)
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination,
                        {totalElements: requestCraftPageFulfilledAction.payload.totalElements}),
                    requestStatus: RequestStatusEnum.Success,
                    _links: requestCraftPageFulfilledAction.payload._links
                })
            });

        case CompanyActionsEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload
                })
            });

        case CompanyActionsEnum.SetPageSize:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageSize: action.payload,
                        pageNumber: 0
                    })
                })
            });

        case CompanyActionsEnum.SetPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {pageNumber: action.payload})
                })
            });

        case CompanyActionsEnum.SetFilter:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    filter: Object.assign(new CompanyFilterData(), action.payload),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    })
                }),
            });

        case CompanyActionsEnum.InitializeFilter:
            const hasFilters = !isEqual(state.list.filter, new CompanyFilterData());

            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: Object.assign([], hasFilters ? [] : state.list.pages),
                    filter: new CompanyFilterData(),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                        pageNumber: 0
                    })
                }),
            });

        case CompanyActionsEnum.SetSort:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    sort: action.payload
                })
            });

        default:
            return state;
    }
}

export const COMPANY_REDUCER = companyReducer;
