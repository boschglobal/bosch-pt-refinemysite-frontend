/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SorterData} from '../../ui/sorter/sorter-data.datastructure';
import {AbstractList} from '../api/datatypes/abstract-list.datatype';
import {HAS_MORE_ITEMS} from './constants/reducers.constants';
import {RequestStatusEnum} from '../enums/request-status.enum';
import {State} from '../../../app.reducers';
import {PaginatorData} from '../../ui/paginator/paginator-data.datastructure';

/**
 * @description Base Class to be used for query classes for a store
 *
 * R: Resource Class (for a single resource)
 * S: The interface describing the slice
 * LL: List Links
 *
 */
export abstract class BaseQueries<R, S, LL> {

    /**
     * @description Name of the Module that the Slice belongs to
     */

    public moduleName?: string;

    /**
     * @description Name of the Slice
     */
    public abstract sliceName: string;

    constructor() {
    }

    /**
     * @description Retrieves query function to get current item of given slice
     * @returns {(state: State) => R}
     */
    public getCurrentItem(): (state: State) => R {
        return (state: State) =>
            this._getSlice(state).items
                .find((item: any) => item.id === this._getSlice(state).currentItem.id);
    }

    /**
     * @description Retrieves query function to get item by id
     * @param {string} id
     * @returns {(state: State) => R}
     */
    public getItemById(id: string): (state: State) => R {
        return (state: State) =>
             this._getSlice(state).items
                 .find((item: any) => item.id === id);
    }

    /**
     * @description Retrieves query function to get id of current item
     * @returns {(state: State) => string}
     */
    public getCurrentItemId(): (state: State) => string {
        return (state: State) => this._getSlice(state).currentItem.id;
    }

    /**
     * @description Retrieves query function to get list of items of given slice
     * @returns {(state: State) => R[]}
     */
    public getList(): (state: State) => R[] {
        return (state: State) =>
            this._getSlice(state).list.ids
                .map((id: string) => this._getSlice(state).items.find((item: any) => item.id === id))
                .filter((item: R) => !!item);
    }

    /**
     * @description Retrieves query function to get current page of given slice
     * @returns {(state: State) => R[]}
     */
    public getCurrentPage(): (state: State) => R[] {
        return (state: State) => {
            const page: number = this._getSlice(state).list.pagination.pageNumber;
            if (this._getSlice(state).list.pages[page]) {
                return this._getSlice(state).list.pages[page]
                    .map((id: string) => this._getSlice(state).items.find((item: any) => item.id === id))
                    .filter(item => !!item);
            } else {
                return [];
            }
        };
    }

    /**
     * @description Retrieves query function to get pagination information
     * @returns {(state: State) => PaginatorData}
     */
    public getListPagination(): (state: State) => PaginatorData {
        return (state: State) => this._getSlice(state).list.pagination;
    }

    /**
     * @description Retrieves query function to get sorting information
     * @returns {(state: State) => SorterData}
     */
    public getListSort(): (state: State) => SorterData {
        return (state: State) => this._getSlice(state).list.sort;
    }

    /**
     * @description Retrieves query function to get initialized state of page
     * @returns {(state:State)=>boolean}
     */
    public getCurrentPageInitialized(): (state: State) => boolean {
        return (state: State) => {
            const page: number = this._getSlice(state).list.pagination.pageNumber;
            return !!this._getSlice(state).list.pages[page];
        };
    }

    /**
     * @description Retrieves query function to get complete slice
     * @returns {(state: State) => R[]}
     */
    public getSlice(): (state: State) => S {
        return (state: State) => this._getSlice(state);
    }

    /**
     * @description Retrieves query function to get current item request status
     * @returns {(state: State) => R[]}
     */
    public getCurrentItemRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).currentItem.requestStatus;
    }

    /**
     * @description Retrieves query function to get list request status
     * @returns {(state: State) => R[]}
     */
    public getListRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).list.requestStatus;
    }

    /**
     * @description Retrieves query function to get if list has more items to be loaded
     * @returns {(state:State) => boolean}
     */
    public getListHasMoreItems(): (state: State) => boolean {
        return (state: State) => {
            const links = this._getSlice(state).list._links;
            return links && links.hasOwnProperty(HAS_MORE_ITEMS);
        };
    }

    /**
     * @description Retrieves query function to get permissions for the resource
     * @returns {(state: State) => LL}
     */
    public getListLinks(): (state: State) => LL {
        return (state: State) => this._getSlice(state).list._links || {};
    }

    /**
     * @description Retrieves query function to get permissions for the resource for given parent
     * @returns {(state: State) => LL}
     */
    public getListLinksByParent(parentId: string): (state: State) => LL {
        return (state: State) => {
            const slice = this._getSlice(state);
            const list = slice.lists ? slice.lists[parentId] : null;

            return list && list.hasOwnProperty('_links') ? list._links : {};
        };
    }

    /**
     * @description Retrieves query function to get list request status for given parent
     * @returns {(state: State) => RequestStatusEnum}
     */
    public getListRequestStatusByParent(parentId: string): (state: State) => RequestStatusEnum {
        return (state: State) => {
            const slice = this._getSlice(state);
            const list = slice.lists ? slice.lists[parentId] : null;

            return list ? list.requestStatus : RequestStatusEnum.Empty;
        };
    }

    /**
     * @description Retrieves query function to get R[] for given parent
     * @returns {(state: State) => R[]}
     */
    public getItemsByParent(parentId: string): (state: State) => R[] {
        return (state: State) => {
            const slice = this._getSlice(state);
            const list = slice.lists ? slice.lists[parentId] : null;

            return list ? slice.lists[parentId].ids
                .map((id: string) => slice.items.find((item: any) => item.id === id))
                .filter((item: R) => !!item) : [];
        };
    }

    /**
     * @description Retrieves query function to get list of R for given parent
     * @returns {(state: State) => AbstractList<LL>}
     */
    public getListByParent(parentId: string): (state: State) => AbstractList<LL> {
        return (state: State) => {
            const slice = this._getSlice(state);
            return slice.lists ? slice.lists[parentId] : null;
        };
    }

    /**
     * @description Retrieves query function to get if list has more items to be loaded for a given parent
     * @returns {(state:State) => boolean}
     */
    public getListHasMoreItemsByParent(parentId: string): (state: State) => boolean {
        return (state: State) => {
            const links = this._getSlice(state).lists[parentId]._links;
            return links && links.hasOwnProperty(HAS_MORE_ITEMS);
        };
    }

    /**
     * @description Retrieves slice
     * @param state
     * @protected
     * @returns {any}
     */
    protected _getSlice(state: State): any {
        return this.moduleName ? state[this.moduleName][this.sliceName] : state[this.sliceName];
    }
}
