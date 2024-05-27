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

@Component({
    selector: 'ss-collapsible-list-test',
    templateUrl: './collapsible-list.test.component.html',
})
export class CollapsibleListTestComponent {
    @Input() public records: any[];
    @Input() public isLoading: boolean;
    @Input() public selectedRows: string[] = [];
    @Input() public isSelecting: boolean;
    @Input() public isRowSelectable: Function = (): boolean => true;
}
