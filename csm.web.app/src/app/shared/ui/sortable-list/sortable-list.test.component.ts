/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {SortableListRecord} from './sortable-list.component';

@Component({
    selector: 'ss-sortable-list-test',
    templateUrl: './sortable-list.test.component.html',
})
export class SortableListTestComponent {

    @Input()
    public records: SortableListRecord[];

    @Input()
    public editIndex: number;
}
