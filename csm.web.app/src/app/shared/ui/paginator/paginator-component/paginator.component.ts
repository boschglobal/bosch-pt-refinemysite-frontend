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

import {PaginatorData} from '../paginator-data.datastructure';

@Component({
    selector: 'ss-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {

    @Input()
    public page = 1;

    @Input()
    public paginatorData: PaginatorData;

    @Output()
    public pageChangedEvent = new EventEmitter<number>();

    @Output()
    public itemsPerPageChangedEvent = new EventEmitter<number>();

    @Input()
    public pageSizes: number[] = [];

    public onPaginatorPagesChange(page: number): void {
        this.pageChangedEvent.emit(page);
    }

    public onPaginatorItemsChange(items: number): void {
        this.itemsPerPageChangedEvent.emit(items);
    }
}
