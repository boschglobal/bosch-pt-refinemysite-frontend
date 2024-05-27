/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

@Component({
    selector: 'ss-paginator-items',
    templateUrl: './paginator-items.component.html',
    styleUrls: ['./paginator-items.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorItemsComponent {

    /**
     * @description Selectable items per page options
     * @type {number[]}
     */
    @Input() public items: number[] = [10, 20, 50];

    /**
     * @description Current number of items per page
     * @type {number}
     */
    @Input() public currentItem = 0;

    /**
     * @description Number of total items to be paged
     * @type {number}
     */
    @Input() public totalItems = 0;

    /**
     * @description Emits when items per page change
     * @type {EventEmitter}
     */
    @Output() public change: EventEmitter<number> = new EventEmitter();

    /**
     * @description Handles the selection of the item with pageSizeIndex passed in
     * @param pageSizeIndex
     * @param event
     */
    public selectItem(pageSizeIndex: number, event: Event): void {
        event.preventDefault();
        if (this._isActive(pageSizeIndex) || this._isDisabled(pageSizeIndex)) {
            return;
        }
        this.currentItem = this.items[pageSizeIndex];
        this.change.emit(this.currentItem);
    }

    /**
     * @description Retrieves NgClasses for the item with pageSizeIndex passed in
     * @param pageSizeIndex
     * @returns {Object}
     */
    public getClasses(pageSizeIndex: number): Object {
        return {
            'ss-paginator-items__item--active': this._isActive(pageSizeIndex),
            'ss-paginator-items__item--disabled': this._isDisabled(pageSizeIndex)
        };
    }

    private _isActive(pageSizeIndex: number): boolean {
        return this.items[pageSizeIndex] === this.currentItem;
    }

    private _isDisabled(pageSizeIndex: number): boolean {
        return this._isPageSizeGreaterThanOrEqualToTotalItems(pageSizeIndex)
            && this._isPageSizeGreaterThanOrEqualToTotalItems(pageSizeIndex - 1)
            && !this._isActive(pageSizeIndex);
    }

    private _isPageSizeGreaterThanOrEqualToTotalItems(pageSizeIndex: number): boolean {
        return this.items[Math.max(0, pageSizeIndex)] >= this.totalItems;
    }
}
