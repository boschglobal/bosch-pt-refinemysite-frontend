/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef
} from '@angular/core';
import {
    uniq,
    xor
} from 'lodash';

import {COLORS} from '../constants/colors.constant';
import {SortDirectionEnum} from '../sorter/sort-direction.enum';
import {SorterData} from '../sorter/sorter-data.datastructure';
import {TableCellComponent} from './table-cell.component';

export const CSS_CLASS_NOT_SELECTABLE = 'ss-table__body-row--not-selectable';
export const CSS_CLASS_SELECTABLE = 'ss-table__body-row--selectable';
export const CSS_CLASS_SELECTED = 'ss-table__body-row--selected';
export const CSS_CLASS_HAS_MARKER = 'ss-table__body-row--has-marker';
export const CSS_CLASS_IS_LINK = 'ss-table__body-row--has-link';

export interface TableItem {
    id: string;
    isNew?: boolean;
    hasLink?: boolean;
}

export const DEFAULT_TABLE_SETTINGS: TableSettings = {
    headers: [],
    messages: {
        empty: 'Generic_NoRecordsFound',
        loading: 'Generic_LoadingRecords',
    },
    allowMultipleSort: true,
    allowNeutralSort: true,
};

@Component({
    selector: 'ss-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterContentInit, OnChanges {
    /**
     * @description Sets table settings
     * @param {TableSettings} settings
     */
    @Input()
    public set settings(settings: TableSettings) {
        this._settings = Object.assign({}, DEFAULT_TABLE_SETTINGS, settings);
    }

    /**
     * @description Sets list of selected rows
     * @param {string[]} selectedRows
     */
    @Input()
    public set selectedRows(selectedRows: string[]) {
        this._selectedRows = selectedRows;
    }

    /**
     * @description Define if table is in selecting mode
     * @param {boolean} isSelecting
     */
    @Input()
    public isSelecting: boolean;

    /**
     * @description Unique identifier for selection
     * @type {string}
     */
    @Input() public selectBy = 'id';

    /**
     * @description Property injected with the records to render the table
     */
    @Input() public records: TableItem[];

    /**
     * @description Function that validates if row can be selected
     * @type {boolean}
     */
    @Input() public isRowSelectable: Function = (): boolean => true;

    /**
     * @description Triggered when a single cell is clicked
     * @type {EventEmitter<Object>}
     */
    @Output() public clickCell: EventEmitter<Object> = new EventEmitter<Object>();

    /**
     * @description Triggered when a row is clicked
     * @type {EventEmitter<TableItem>}
     */
    @Output() public clickRow: EventEmitter<TableItem> = new EventEmitter<TableItem>();

    /**
     * @description Triggered when selection changes
     * @type {EventEmitter<string[]>}
     */
    @Output() public selectionChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * @description Triggered when a single header is sorted
     * @type {EventEmitter<SorterData>}
     */
    @Output() public sort: EventEmitter<SorterData> = new EventEmitter<SorterData>();

    /**
     * @description Identify the templates inside the table
     */
    @ContentChildren(TableCellComponent) public templateCells: QueryList<TableCellComponent>;

    /**
     * @description Shortcut to handle template cells as an array
     */
    public cells: TableCellComponent[];

    /**
     * @description Property for icon check color
     * @type {string}
     */
    public iconCheckColor: string = COLORS.dark_grey;

    /**
     * @description Define if the checkbox is enabled
     * @type {boolean}
     */
    public isSelectAllCheckboxDisabled: boolean;

    /**
     * @description Define if the checkbox has indeterminate state
     * @type {boolean}
     */
    public isIndeterminate: boolean;

    /**
     * @description Define if the checkbox has selectAll state
     * @type {boolean}
     */
    public isSelectAllToggled: boolean;

    private _numberOfSelectableRows: number;

    private _numberOfSelectedRows: number;

    private _selectedRows: string[] = [];

    private _settings: TableSettings = DEFAULT_TABLE_SETTINGS;

    ngAfterContentInit() {
        this._setCells();
        this._sortCells();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.records || changes.selectedRows) {
            this._handleSelectAllCheckboxState();
        }
    }

    /**
     * @description Check if a single header as the sortable option enabled
     * @param {TableSettingsHeader} header
     * @returns {boolean}
     */
    public isSortable(header: TableSettingsHeader): boolean {
        return header.sortable.enabled;
    }

    /**
     * @description Check if a single header is being sorted
     * @param {TableSettingsHeader} header
     * @returns {boolean}
     */
    public isSorting(header: TableSettingsHeader): boolean {
        return header.sortable.direction !== SortDirectionEnum.neutral;
    }

    /**
     * @description Retrieve header settings
     * @returns {TableSettingsHeader[]}
     */
    public getHeaders(): TableSettingsHeader[] {
        return this._settings.headers;
    }

    /**
     * @description Retrieve if arrow should be shown or not
     * @param {TableSettingsHeader} header
     * @returns {boolean}
     */
    public isArrowVisible(header: TableSettingsHeader): boolean {
        return !this.isSorting(header) || !this._checkSortDirection(header, SortDirectionEnum.neutral);
    }

    /**
     * @description Retrieve arrow rotation - top or bottom
     * @param {TableSettingsHeader} header
     * @returns {number}
     */
    public getArrowRotation(header: TableSettingsHeader): number {
        let rotation = 90;

        if (this._checkSortDirection(header, SortDirectionEnum.desc)) {
            rotation = 270;
        }

        return rotation;
    }

    /**
     * @description Retrieve css classes for header
     * @param {TableSettingsHeader} header
     * @returns {Object}
     */
    public getHeaderSortClasses(header: TableSettingsHeader): Object {
        return {
            'ss-table__header-cell--sortable': this.isSortable(header),
            'ss-table__header-cell--sorting': this.isSorting(header),
            [header.headerClass ? header.headerClass : '']: true,
        };
    }

    /**
     * @description Triggered when single table header is clicked
     * @description Set all the different header to false and check the right order to table header
     * @param {Event} event
     * @param {TableSettingsHeader} header
     */
    public handleSort(event: Event, header: TableSettingsHeader): void {
        event.preventDefault();

        this._settings.headers.forEach((item: TableSettingsHeader) => {
            item.sortable.direction = item.field !== header.field ? SortDirectionEnum.neutral : this._getNextSortDirection(item);
        });

        this.sort.emit(
            new SorterData(header.field, header.sortable.direction)
        );
    }

    /**
     * @description Triggered when table row is clicked
     * @param {Event} event
     * @param {TableItem} row
     */
    public handleRow(event: Event, row: TableItem): void {
        if (this.isSelecting) {
            this._toggleRowSelection(row);
        } else {
            this.clickRow.emit(row);
        }
    }

    /**
     * @description Triggered when single table cell is clicked
     * @param {Event} event
     * @param {string} field
     * @param {number} row
     * @param {number} cell
     */
    public handleCell(event: Event, field: string, row: number, cell: number): void {
        this.clickCell.emit({value: this.records[row][field], field, row, cell});
    }

    /**
     * @description Returns the TemplateRef for the table cell or the default TemplateRef if none is passed
     * @param {TableCellComponent} cell
     * @returns {TemplateRef<any>}
     */
    public getCellTemplate(cell: TableCellComponent): TemplateRef<any> {
        return cell.templateRef || cell.defaultTemplateRef;
    }

    /**
     * @description Returns data-automation attribute by params received
     * @param {string} area
     * @param {string} value
     * @returns {string}
     */
    public getAttrDataAutomation(area: string, value: string): string {
        return `table-${area}-${value}`;
    }

    /**
     * @description Check if a single header has an width option and if so get it
     * @param {TableSettingsHeader} header
     * @returns {string}
     */
    public getWidth(header: TableSettingsHeader): string | null {
        return header.width ? `${header.width}%` : null;
    }

    /**
     * @description Retrieves row NgClasses
     * @param {TableItem} row
     * @returns {Object}
     */
    public getRowClasses(row: TableItem): Object {
        const isSelectable: boolean = this.isRowSelectable(row);

        return {
            [CSS_CLASS_NOT_SELECTABLE]: this.isSelecting && !isSelectable,
            [CSS_CLASS_SELECTABLE]: this.isSelecting && isSelectable,
            [CSS_CLASS_SELECTED]: this.isSelecting && this.isRowSelected(row),
            [CSS_CLASS_HAS_MARKER]: row.isNew,
            [CSS_CLASS_IS_LINK]: row.hasLink,
        };
    }

    public trackByFn(index: number, item: TableItem): string {
        return item.id;
    }

    public trackByCellFn(rowId: string, index: number, item: TableCellComponent): string {
        return item.field + rowId + index;
    }

    /**
     * @description Retrieves whether the row is selected or not
     * @param {TableItem} row
     * @returns {boolean}
     */
    public isRowSelected(row: TableItem): boolean {
        return this._selectedRows.indexOf(row[this.selectBy]) !== -1;
    }

    /**
     * @description handle selectAll checkbox state
     * @param {boolean} toggleSelectAllState
     */
    public handleSelectAll(toggleSelectAllState: boolean): void {
        this.isSelectAllToggled = toggleSelectAllState;
        this._toggleSelectedRows();
        this._handleSelectAllCheckboxState();
        this.selectionChange.emit(this._selectedRows);
    }

    private _toggleSelectedRows(): void {
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

        this.isSelectAllCheckboxDisabled = this._isSelectAllCheckBoxDisabled();
        this.isIndeterminate = this._isCheckboxIndeterminate();
        this.isSelectAllToggled = this._isSelectAllToggled();
    }

    private _isSelectAllCheckBoxDisabled(): boolean {
        return !this._numberOfSelectableRows;
    }

    private _isCheckboxIndeterminate(): boolean {
        return !!this._numberOfSelectedRows && this._numberOfSelectedRows !== this._numberOfSelectableRows;
    }

    private _isSelectAllToggled(): boolean {
        return !!this._numberOfSelectableRows && this._numberOfSelectedRows === this._numberOfSelectableRows;
    }

    private _toggleRowSelection(row: TableItem): void {
        if (!this.isRowSelectable(row)) {
            return;
        }
        this._selectedRows = xor(this._selectedRows, [row[this.selectBy]]);
        this._handleSelectAllCheckboxState();
        this.selectionChange.emit(this._selectedRows);
    }

    private _checkSortDirection(header: TableSettingsHeader, direction: SortDirectionEnum): boolean {
        return header.sortable.direction === direction;
    }

    private _getNextSortDirection(header: TableSettingsHeader): SortDirectionEnum | undefined {
        switch (header.sortable.direction) {
            case SortDirectionEnum.asc:
                return SortDirectionEnum.desc;
            case SortDirectionEnum.desc:
                return this._settings.allowNeutralSort ? SortDirectionEnum.neutral : SortDirectionEnum.asc;
            case SortDirectionEnum.neutral:
                return SortDirectionEnum.asc;
            default:
                break;
        }
    }

    private _setCells(): any {
        this.cells = this.templateCells.toArray();
    }

    private _sortCells(): void {
        const parseHeader: Object = {};
        const parseCells: any[] = [];
        this._settings.headers.forEach((header: TableSettingsHeader, key: number) => parseHeader[header.field] = key);
        this.cells.forEach((cell: TableCellComponent) => parseCells[parseHeader[cell.field]] = cell);
        this.cells = parseCells;
    }
}

export interface TableSettings {
    headers: TableSettingsHeader[];
    messages?: {
        empty?: string;
        loading?: string;
    };
    allowMultipleSort?: boolean;
    allowNeutralSort?: boolean;
}

export interface TableSettingsHeader {
    title: string;
    field: string;
    sortable: {
        enabled: boolean;
        direction: SortDirectionEnum;
    };
    width?: number;
    headerClass?: string;
    headerStyle?: {
        [key: string]: string;
    };
}
