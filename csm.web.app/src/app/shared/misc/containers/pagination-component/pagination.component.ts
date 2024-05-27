/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {PaginatorData} from '../../../ui/paginator/paginator-data.datastructure';

export type SetPageActionType = (page: number) => Action;
export type SetItemsPerPageActionType = (items: number) => Action;

@Component({
    selector: 'ss-pagination',
    templateUrl: './pagination.component.html',
})
export class PaginationComponent implements OnInit, OnDestroy {

    private _paginatorSubscription: Subscription;

    /**
     * @description State of paginator (page, items per page and number of entries
     * @type {PaginatorData}
     */
    public paginatorData: PaginatorData = new PaginatorData();

    /**
     * @description Input for function to query the store for the paginator data
     */
    @Input()
    public paginatorDataSelectorFunction: (state: any) => {};

    /**
     * @description Input for creator class of the set page action
     */
    @Input()
    public setPageAction: SetPageActionType;

    /**
     * @description Input for creator class for the set items per page action
     */
    @Input()
    public setItemsPerPageAction: SetItemsPerPageActionType;

    @Input()
    public pageSizes: number[] = [];

    constructor(private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Event triggered when a page is changed
     * @param page
     */
    public onPageChange(page: number): void {
        this._store.dispatch(this.setPageAction(page));
    }

    /**
     * @description Event triggered when an item is changed
     * @param items
     */
    public onItemsPerPageChange(items: number): void {
        this._store.dispatch(this.setItemsPerPageAction(items));
    }

    private _setSubscriptions(): void {
        this._paginatorSubscription = this._store
            .pipe(
                select(this.paginatorDataSelectorFunction))
            .subscribe(this._updatePaginationModel.bind(this));
    }

    private _unsetSubscriptions(): void {
        this._paginatorSubscription.unsubscribe();
    }

    private _updatePaginationModel(paginatorData: PaginatorData): void {
        this.paginatorData = paginatorData;
    }
}
