/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    NgClass,
    NgStyle
} from '@angular/common';
import {
    Component,
    ContentChild,
    Input,
    TemplateRef,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'ss-table-cell',
    templateUrl: './table-cell.component.html',
})
export class TableCellComponent {
    /**
     * @description Identifies the property to be displayed on the current cell
     */
    @Input()
    public field: string;

    /**
     * @description NgStyles to bind to the cell
     */
    @Input()
    public cellStyle: NgStyle;

    /**
     * @description NgClass to bind to the cell
     */
    @Input()
    public cellClass: NgClass;

    /**
     * @description Boolean to define if display or not tooltip
     */
    @Input()
    public showTooltip = false;

    /**
     * @description Child template TemplateRef
     */
    @ContentChild(TemplateRef, {static: true})
    public templateRef: TemplateRef<any>;

    /**
     * @description Default TemplateRef to use in case no template is passed in
     */
    @ViewChild('defaultTemplate', {static: true})
    public defaultTemplateRef: TemplateRef<any>;
}
