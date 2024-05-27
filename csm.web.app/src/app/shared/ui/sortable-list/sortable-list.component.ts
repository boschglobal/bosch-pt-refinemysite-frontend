/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDragDrop,
    DragStartDelay
} from '@angular/cdk/drag-drop';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    TemplateRef,
} from '@angular/core';

const SORTABLE_LIST_DRAG_START_DELAY_TOUCH = 100;

@Component({
    selector: 'ss-sortable-list',
    templateUrl: './sortable-list.component.html',
    styleUrls: ['./sortable-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListComponent implements OnChanges {

    @Input()
    public records: SortableListRecord[];

    @Input()
    public editIndex: number;

    @Output()
    public sort: EventEmitter<SortableListSort> = new EventEmitter<SortableListSort>();

    @ContentChild('template')
    public template: TemplateRef<any>;

    public dragStartDelay: DragStartDelay = {
        mouse: 0,
        touch: SORTABLE_LIST_DRAG_START_DELAY_TOUCH,
    };

    public parsedRecords: SortableListRecord[];

    ngOnChanges(): void {
        this._setParsedRecords();
    }

    public handleDrop(event: CdkDragDrop<any>): void {
        const {previousIndex, currentIndex} = event;
        const item = this.parsedRecords[previousIndex];

        if (previousIndex !== currentIndex) {
            this.sort.emit({
                currentIndex,
                item,
                previousIndex,
            });
        }
    }

    public trackByFn(index: number, item: any): number {
        return item.id;
    }

    private _canDrag(record: SortableListRecord): boolean {
        return record.drag && this.editIndex == null;
    }

    private _setParsedRecords(): void {
        this.parsedRecords = this.records.map((record: SortableListRecord) => ({
            ...record,
            drag: this._canDrag(record),
        }));
    }
}

export interface SortableListSort {
    item: any;
    previousIndex: number;
    currentIndex;
}

export interface SortableListRecord {
    drag: boolean;
}
