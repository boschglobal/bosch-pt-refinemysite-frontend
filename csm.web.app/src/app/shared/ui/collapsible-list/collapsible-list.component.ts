/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    TemplateRef
} from '@angular/core';
import {
    uniq,
    xor
} from 'lodash';

import {COLORS} from '../constants/colors.constant';

export const CSS_CLASS_NOT_SELECTABLE = 'ss-collapsible-list__row--not-selectable';
export const CSS_CLASS_SELECTABLE = 'ss-collapsible-list__row--selectable';
export const CSS_CLASS_SELECTED = 'ss-collapsible-list__row--selected';
export const CSS_CLASS_UNCOLLAPSED = 'ss-collapsible-list__row--uncollapsed';
export const CSS_CLASS_HAS_MARKER = 'ss-collapsible-list__row--has-marker';

export type CollapsibleListItemState = 'error' | 'neutral' | 'success' | 'warning';

export interface CollapsibleListItem {
    id: string;
    isNew?: boolean;
    state?: CollapsibleListItemState;
    notCollapsible?: boolean;
}

@Component({
    selector: 'ss-collapsible-list',
    templateUrl: './collapsible-list.component.html',
    styleUrls: ['./collapsible-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleListComponent implements OnChanges {
    /**
     * @description Records to be displayed on the list
     * @type {CollapsibleListItem[]}
     */
    @Input() public records: CollapsibleListItem[];

    /**
     * @description Sets list of selected rows
     * @param {string[]} selectedRows
     */
    @Input()
    public set selectedRows(selectedRows: string[]) {
        this._selectedRows = selectedRows;
    }

    /**
     * @description Property that define if list is being loaded
     * @type {boolean}
     */
    @Input() public isLoading: boolean;

    /**
     * @description Property injected to define if table is in selecting mode
     */
    @Input() public isSelecting: boolean;

    /**
     * @description Function that validates if row can be selected
     * @description Default all rows are selectable
     */
    @Input() public isRowSelectable: Function = (): boolean => true;

    /**
     * @description Unique identifier for selection
     * @type {string}
     */
    @Input() public selectBy = 'id';

    /**
     * @description Triggered when a row is clicked
     * @type {EventEmitter<CollapsibleListItem>}
     */
    @Output() public clickRow: EventEmitter<CollapsibleListItem> = new EventEmitter<CollapsibleListItem>();

    /**
     * @description Triggered when selection changes
     * @type {EventEmitter<string[]>}
     */
    @Output() public selectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * @description Actions template TemplateRef
     * @type {TemplateRef<any>}
     */
    @ContentChild('actionsTemplate')
    public actionsTemplate: TemplateRef<any>;

    /**
     * @description Child primary template TemplateRef
     * @type {TemplateRef<any>}
     */
    @ContentChild('primaryTemplate')
    public primaryTemplate: TemplateRef<any>;

    /**
     * @description Child secondary template TemplateRef
     * @type {TemplateRef<any>}
     */
    @ContentChild('secondaryTemplate')
    public secondaryTemplate: TemplateRef<any>;

    /**
     * @description Property for icon check color
     * @type {string}
     */
    public iconCheckColor: string = COLORS.dark_grey;

    /**
     * @description Define if the checkbox has indeterminate state
     * @type {boolean}
     */
    public isIndeterminate: boolean;

    /**
     * @description Define if the checkbox is enabled
     * @type {boolean}
     */
    public isSelectAllCheckboxDisabled: boolean;

    /**
     * @description Define if the checkbox has selectAll state
     * @type {boolean}
     */
    public isSelectAllToggled: boolean;

    /**
     * @description Hold the collapsed state of each row
     * @type {Array}
     */
    public recordsCollapsedState: boolean[] = [];

    /**
     * @description Define if the checkbox and select all text are available
     * @type {boolean}
     */
    public showSelectAllCheckbox: boolean;

    /**
     * @description Shows the number of rows that can be selected
     * @type {number}
     */
    private _numberOfSelectableRows: number;

    /**
     * @description Shows the number of selected rows
     * @type {number}
     */
    private _numberOfSelectedRows: number;

    private _selectedRows: string[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this._resetCollapsedRows(changes);

        if (changes.records || changes.selectedRows) {
            this._handleSelectAllCheckboxState();
        }
    }

    /**
     * @description Toggles the collapse state of a raw with index = rowIndex
     * @param {Event} event
     * @param {number} rowIndex
     */
    public toggleVisibility(event: Event, rowIndex: number): void {
        event.stopPropagation();
        this.recordsCollapsedState[rowIndex] = !this.recordsCollapsedState[rowIndex];
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Handle the click on a row
     * @param {CollapsibleListItem} row
     */
    public handleClickRow(row: CollapsibleListItem): void {
        if (this.isSelecting) {
            this._toggleRowSelection(row);
        } else {
            this.clickRow.emit(row);
        }
    }

    /**
     * @description Returns true if a row with index = rowIndex is collapsed
     * @param {number} rowIndex
     * @returns {boolean}
     */
    public isRowCollapsed(rowIndex: number): boolean {
        return this.recordsCollapsedState[rowIndex];
    }

    /**
     * @description Retrieves data-automation with the index and area
     * @param {string} area
     * @param {string} value
     * @returns {string}
     */
    public getAttrDataAutomation(area: string, value: string): string {
        return `ss-collapsible-list-${area}-${value}`;
    }

    /**
     * @description Retrieves row NgClasses
     * @param {CollapsibleListItem} row
     * @param {number} rowIndex
     * @returns {Object}
     */
    public getRowClasses(row: CollapsibleListItem, rowIndex: number): Object {
        const isSelectable: boolean = this.isRowSelectable(row);
        return {
            [CSS_CLASS_NOT_SELECTABLE]: this.isSelecting && !isSelectable,
            [CSS_CLASS_SELECTABLE]: this.isSelecting && isSelectable,
            [CSS_CLASS_SELECTED]: this.isSelecting && this.isRowSelected(row),
            [CSS_CLASS_UNCOLLAPSED]: this.isRowCollapsed(rowIndex),
            [CSS_CLASS_HAS_MARKER]: row.isNew,
            [`${CSS_CLASS_HAS_MARKER}-${row.state}`]: !!row.state,
        };
    }

    /**
     * @description Retrieves whether the row is selected or not
     * @param {Object} row
     * @returns {boolean}
     */
    public isRowSelected(row: CollapsibleListItem): boolean {
        return this._selectedRows.indexOf(row[this.selectBy]) !== -1;
    }

    /**
     * @description handle selectAll checkbox state
     * @param {boolean} toggleSelectAllState
     */
    public handleSelectAll(toggleSelectAllState: boolean): void {
        this.isSelectAllToggled = toggleSelectAllState;
        this._toggleSelectAllRows();
        this._handleSelectAllCheckboxState();
        this.selectionChange.emit(this._selectedRows);
    }

    private _toggleSelectAllRows(): void {
        this._selectedRows = this.isSelectAllToggled
            ? uniq([
                ...this._selectedRows,
                ...this.records
                    .filter(record => this.isRowSelectable(record))
                    .map(record => record.id),
            ])
            : [
                ...this._selectedRows.filter(selectedRowId =>
                    !this.records.some(record => record.id === selectedRowId)),
            ];
    }

    private _handleSelectAllCheckboxState(): void {
        this._numberOfSelectableRows = this.records.length - this.records.filter(eaRow => !this.isRowSelectable(eaRow)).length;
        this._numberOfSelectedRows = this.records.filter(eaRow => this.isRowSelected(eaRow)).length;

        this.showSelectAllCheckbox = this._isSelectAllCheckboxAvailable();
        this.isSelectAllCheckboxDisabled = this._isSelectAllCheckboxDisabled();
        this.isIndeterminate = this._isCheckboxIndeterminate();
        this.isSelectAllToggled = this._isSelectAllToggled();
    }

    private _isSelectAllCheckboxAvailable(): boolean {
        return this.isSelecting && !!this.records.length;
    }

    private _isSelectAllCheckboxDisabled(): boolean {
        return !this._numberOfSelectableRows;
    }

    private _isCheckboxIndeterminate(): boolean {
        return !!this._numberOfSelectedRows && this._numberOfSelectedRows !== this._numberOfSelectableRows;
    }

    private _isSelectAllToggled(): boolean {
        return !!this._numberOfSelectableRows && this._numberOfSelectedRows === this._numberOfSelectableRows;
    }

    public trackByFn(index: number, item: CollapsibleListItem): string {
        return item.id;
    }

    private _toggleRowSelection(row: CollapsibleListItem): void {
        if (!this.isRowSelectable(row)) {
            return;
        }
        this._selectedRows = xor(this._selectedRows, [row[this.selectBy]]);
        this._handleSelectAllCheckboxState();
        this.selectionChange.emit(this._selectedRows);
    }

    private _resetCollapsedRows(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('isLoading') && changes['isLoading'].currentValue) {
            this.recordsCollapsedState = [];
        }
    }
}
