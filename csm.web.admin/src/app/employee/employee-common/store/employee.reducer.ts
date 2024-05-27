/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {unionBy} from 'lodash';

import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../shared/ui/paginator/paginator-data.datastructure';
import {
    EmployeeActions,
    EmployeeActionsEnum
} from './employee.actions';
import {
    EMPLOYEE_SLICE_INITIAL_STATE,
    EmployeeSlice
} from './employee.slice';

export function employeeReducer(state: EmployeeSlice = EMPLOYEE_SLICE_INITIAL_STATE, action: EmployeeActions): EmployeeSlice {
    switch (action.type) {
        case EmployeeActionsEnum.InitializeAll:
            return EMPLOYEE_SLICE_INITIAL_STATE;

        case EmployeeActionsEnum.InitializeCurrent:
            return Object.assign({}, state, {
                currentItem: new AbstractItem()
            });

        case EmployeeActionsEnum.RequestPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case EmployeeActionsEnum.RequestOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.id,
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case EmployeeActionsEnum.CreateOne:
        case EmployeeActionsEnum.DeleteOne:
        case EmployeeActionsEnum.UpdateOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Progress
                })
            });

        case EmployeeActionsEnum.CreateOneReset:
        case EmployeeActionsEnum.DeleteOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Empty
                })
            });

        case EmployeeActionsEnum.RequestPageRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case EmployeeActionsEnum.CreateOneRejected:
        case EmployeeActionsEnum.DeleteOneRejected:
        case EmployeeActionsEnum.RequestOneRejected:
        case EmployeeActionsEnum.UpdateOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Error
                })
            });

        case EmployeeActionsEnum.CreateOneFulfilled:
        case EmployeeActionsEnum.RequestOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload.id ,
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case EmployeeActionsEnum.DeleteOneFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter(item => item.id !== action.employeeId),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case EmployeeActionsEnum.UpdateOneFulfilled:
            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.Success
                })
            });

        case EmployeeActionsEnum.RequestPageFulfilled:
            const requestEmployeesFulfilledAction = action;
            return Object.assign({}, state, {
                items: unionBy(requestEmployeesFulfilledAction.payload.items, state.items, 'id'),
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: Object.assign([], state.list.pages, {
                        [requestEmployeesFulfilledAction.payload.pageNumber]:
                            requestEmployeesFulfilledAction.payload.items.map((item) => item.id)
                    }),
                    pagination: Object.assign(new PaginatorData(), state.list.pagination,
                        {totalElements: requestEmployeesFulfilledAction.payload.totalElements}),
                    requestStatus: RequestStatusEnum.Success,
                    _links: requestEmployeesFulfilledAction.payload._links,
                })
            });

        case EmployeeActionsEnum.SetCurrent:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    id: action.payload
                })
            });

        case EmployeeActionsEnum.SetPage:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {pageNumber: action.payload})
                })
            });

        case EmployeeActionsEnum.SetPageSize:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractPageableList(), state.list, {
                    pages: [],
                    pagination: Object.assign(new PaginatorData(), state.list.pagination, {
                      pageSize: action.payload,
                      pageNumber: 0
                    })
                  })
            });

        case EmployeeActionsEnum.SetSort:
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

export const EMPLOYEE_REDUCER = employeeReducer;
