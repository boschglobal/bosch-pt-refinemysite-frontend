/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {Chip} from '../chip/chip.component';

@Component({
    selector: 'ss-chip-list',
    templateUrl: './chip-list.component.html',
    styleUrls: ['./chip-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipListComponent {

    @Input()
    public items: Chip[];

    @Input()
    public listLabel: string;

    @Input()
    public set maxChipsToShow(value: number) {
        this._maxChipsToShow = value;
        this.currentMaximumChips = this._maxChipsToShow;
    }

    @Input()
    public removeAllLabel: string;

    @Input()
    public showRemoveAll = true;

    @Output()
    public removeAll: EventEmitter<Chip[]> = new EventEmitter<Chip[]>();

    @Output()
    public remove: EventEmitter<Chip> = new EventEmitter<Chip>();

    public get canShowMore(): boolean {
        return this.items.length > this._maxChipsToShow;
    }

    public get chipsCollapsed(): boolean {
        return this.canShowMore && this._chipsCollapsed;
    }

    public currentMaximumChips = 6;

    private _chipsCollapsed = true;

    private _maxChipsToShow = 6;

    public handleRemoveChip(item: Chip): void {
        this.remove.emit(item);
    }

    public handleRemoveAllChips(): void {
        this.removeAll.emit(this.items);
    }

    public trackByFn(index: number, item: Chip): string {
        return item.id;
    }

    public onShowMoreChange(): void {
        this._chipsCollapsed = !this._chipsCollapsed;
        if (!this._chipsCollapsed) {
            this.currentMaximumChips = undefined;
        } else {
            this.currentMaximumChips = this._maxChipsToShow;
        }
    }
}
