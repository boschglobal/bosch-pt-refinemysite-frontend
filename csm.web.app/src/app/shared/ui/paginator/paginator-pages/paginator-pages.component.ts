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
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {range} from 'lodash';

@Component({
    selector: 'ss-paginator-pages',
    templateUrl: './paginator-pages.component.html',
    styleUrls: ['./paginator-pages.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorPagesComponent implements OnInit, OnChanges {

    @Input() public itemsPerPage: number;

    @Input() public totalItems: number;

    @Input() public currentPage: number;

    @Output() public changePage: EventEmitter<number> = new EventEmitter();

    public hasLeftEllipsis = false;

    public hasRightEllipsis = false;

    public pages: number[];

    public totalPages: number;

    private _maxPages = 5;

    private _rangeLimit = 4;

    private _maximumVisiblePages = 7;

    constructor() { }

    ngOnInit() {
        this._setTotalPages();
        this._setPages();
    }

    ngOnChanges(changes: SimpleChanges) {
        this._setTotalPages();
        this._setPages();
        if (this._itemsPerPageWasChanged(changes)) {
            this._handleInternalChange();
        }
    }

    public get hasFirstPage(): boolean {
        const {hasLeftEllipsis, currentPage, _rangeLimit, totalPages, _maximumVisiblePages} = this;
        return hasLeftEllipsis || (totalPages > _maximumVisiblePages && currentPage === _rangeLimit);
    }

    public get hasLastPage(): boolean {
        const {hasRightEllipsis, currentPage, _rangeLimit, totalPages, _maximumVisiblePages} = this;
        return hasRightEllipsis || (totalPages > _maximumVisiblePages && currentPage + 1 === (totalPages - _rangeLimit));
    }

    public selectPage(page: number, event: Event): void {
        event.preventDefault();
        if (page === this.currentPage) {
            return;
        }
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this._setPages();
            this._handleInternalChange();
        }
    }

    private _setPages() {
        let pages: number[];
        const {totalPages, currentPage, _rangeLimit} = this;
        const {start, end} = this._getPageBoundaries();

        pages = range(start, end + 1);
        if (currentPage + 1 === _rangeLimit) {
            pages = range(start - 1, end);
        }
        if (currentPage + 1 === (totalPages - _rangeLimit) + 1) {
            pages = range(start + 1, end + 2);
        }
        if (totalPages < this._maximumVisiblePages) {
            pages = range(0, totalPages);
        }

        this.hasLeftEllipsis = pages.indexOf(0) === -1;
        if (currentPage + 1 === _rangeLimit) {
            this.hasLeftEllipsis = false;
        }
        if (totalPages < this._maximumVisiblePages) {
            this.hasLeftEllipsis = false;
        }

        this.hasRightEllipsis = pages.indexOf(totalPages - 1) === -1;
        if (currentPage === (totalPages - _rangeLimit)) {
            this.hasRightEllipsis = false;
        }
        if (totalPages < this._maximumVisiblePages) {
            this.hasRightEllipsis = false;
        }

        this.pages = pages;

        if (totalPages > 0) {
            this.currentPage = currentPage > totalPages ? totalPages : currentPage;
        }
    }

    private _getPageBoundaries() {
        this._setRange();
        const numberOfPages = this.totalPages;
        const visiblePages = Math.min(this._maxPages, numberOfPages);
        let start = Math.max(0, Math.ceil((this.currentPage) - ((visiblePages) / 2)));
        const end = Math.min(numberOfPages - 1, start + visiblePages - 1);
        const delta = this._maxPages - (end - start + 1);

        start = Math.max(0, start - delta);

        return {
            start,
            end
        };
    }

    private _setRange(): void {
        const {totalPages, currentPage, _rangeLimit} = this;
        this._maxPages = currentPage + 1 > _rangeLimit && currentPage + 1 < (totalPages - _rangeLimit) + 1 ? 3 : 5;
    }

    private _setTotalPages(): void {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    }

    private _itemsPerPageWasChanged(changes: SimpleChanges) {
        return changes.hasOwnProperty('itemsPerPage') && typeof changes['itemsPerPage'].previousValue === 'number';
    }

    private _handleInternalChange(): void {
        this.changePage.emit(this.currentPage);
    }
}
