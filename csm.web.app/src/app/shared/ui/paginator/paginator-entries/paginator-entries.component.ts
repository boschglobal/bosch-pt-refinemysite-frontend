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
    Input,
    OnChanges,
    OnInit
} from '@angular/core';

@Component({
    selector: 'ss-paginator-entries',
    templateUrl: './paginator-entries.component.html',
    styleUrls: ['./paginator-entries.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorEntriesComponent implements OnInit, OnChanges {
    @Input() public totalEntries: number;
    @Input() public entriesPerPage: number;
    @Input() public currentPage: number;

    public start: number;
    public end: number;

    public width: string;

    ngOnInit() {
        this.setWidth();
        this.setInfo();
    }

    ngOnChanges() {
        this.setWidth();
        this.setInfo();
    }

    private setInfo(): void {
        const {entriesPerPage, currentPage, totalEntries} = this;

        this.start = totalEntries === 0 ? 0 : (entriesPerPage * currentPage) + 1;
        this.end = Math.min(entriesPerPage * (currentPage + 1), totalEntries);
    }

    private setWidth(): void {
        const characterWidth = 9;
        const slashWidth = 7;
        const minusWidth = 5;
        const characterNumber: number = this.totalEntries.toString().length;

        this.width = `${(characterWidth * characterNumber) * 3 + slashWidth + minusWidth}px`;
    }
}
