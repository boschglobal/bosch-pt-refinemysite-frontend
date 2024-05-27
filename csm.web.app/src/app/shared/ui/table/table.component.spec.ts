/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {TranslationModule} from '../../translation/translation.module';
import {SortDirectionEnum} from '../sorter/sort-direction.enum';
import {
    CSS_CLASS_HAS_MARKER,
    CSS_CLASS_NOT_SELECTABLE,
    CSS_CLASS_SELECTABLE,
    CSS_CLASS_SELECTED,
    TableComponent,
    TableSettings,
    TableSettingsHeader
} from './table.component';
import {TableTestComponent} from './table.test.component.spec';
import {TableCellComponent} from './table-cell.component';

describe('Table Component', () => {
    let fixture: ComponentFixture<TableTestComponent>;
    let comp: TableTestComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let testHostComp: TableComponent;

    let testHeader: TableSettingsHeader;
    const testCSSClass = 'test-class';

    const dataAutomationSelectorTestHeader = '[data-automation="table-header-a"]';
    const dataAutomationSelectorTestRow = '[data-automation="table-row-0"]';
    const dataAutomationSelectorTestCell = '[data-automation*="table-cell-1-1"]';

    const rotateTop = 90;
    const rotateBottom = 270;

    const clickEvent: Event = new Event('click');

    const mockRecords: any[] = [
        {
            id: '1',
            a: 'a1',
            b: 'b1',
            c: 'c1',
            isNew: true,
        },
        {
            id: '2',
            a: 'a2',
            b: 'b2',
            c: 'c2',
        },
        {
            id: '3',
            a: 'a3',
            b: 'b3',
            c: 'c3',
        },
        {
            id: '4',
            a: 'a4',
            b: 'b4',
            c: 'c4',
        },
    ];
    const mockSettings: TableSettings = {
        headers: [
            {
                title: 'a',
                field: 'a',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 25,
            },
            {
                title: 'b',
                field: 'b',
                sortable: {
                    enabled: true,
                    direction: SortDirectionEnum.neutral,
                },
                width: 25,
            },
            {
                title: 'c',
                field: 'c',
                sortable: {
                    enabled: false,
                    direction: SortDirectionEnum.neutral,
                },
                width: 25,
            },
            {
                title: 'd',
                field: 'd',
                sortable: {
                    enabled: false,
                    direction: SortDirectionEnum.neutral,
                },
                width: 25,
            },
        ],
        messages: {
            empty: 'Generic_NoRecordsFound',
            loading: 'Generic_LoadingRecords',
        },
        allowMultipleSort: false,
        allowNeutralSort: false,
    };

    const noRowSelectableFunction: Function = () => false;
    const getElement = (selector: string): HTMLElement => de.query((By.css(selector)))?.nativeElement;
    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="table-${area}-${field}"]`;

    function getIconStyles(selector: string): string {
        return el.querySelector(selector).getAttribute('style');
    }

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TableComponent,
            TableCellComponent,
            TableTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(TableTestComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        testHostComp = fixture.debugElement.children[0].componentInstance;

        comp.records = mockRecords;
        comp.settings = mockSettings;
        comp.selectedRows = [];

        testHeader = comp.settings.headers[0];
    }));

    it('should not trigger handleSort() on click when header is not sortable', () => {
        spyOn(testHostComp, 'handleSort').and.callThrough();
        testHeader.sortable.enabled = false;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestHeader).dispatchEvent(clickEvent);
        expect(testHostComp.handleSort).not.toHaveBeenCalled();
    });

    it('should trigger handleSort() on click when header is sortable', () => {
        spyOn(testHostComp, 'handleSort').and.callThrough();
        testHeader.sortable.enabled = true;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestHeader).dispatchEvent(clickEvent);
        expect(testHostComp.handleSort).toHaveBeenCalled();
    });

    it('should trigger handleSort() on click with right params when header is sortable', () => {
        spyOn(testHostComp, 'handleSort').and.callThrough();
        testHeader.sortable.enabled = true;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestHeader).dispatchEvent(clickEvent);
        expect(testHostComp.handleSort).toHaveBeenCalledWith(clickEvent, testHeader);
    });

    it('should be sorting when header direction is asc', () => {
        testHeader.sortable.direction = SortDirectionEnum.asc;
        fixture.detectChanges();
        expect(testHostComp.isSorting(testHeader)).toBe(true);
    });

    it('should be sorting when header direction is desc', () => {
        testHeader.sortable.direction = SortDirectionEnum.desc;
        fixture.detectChanges();
        expect(testHostComp.isSorting(testHeader)).toBe(true);
    });

    it('should be sorting if header direction is neutral', () => {
        testHeader.sortable.direction = SortDirectionEnum.neutral;
        fixture.detectChanges();
        expect(testHostComp.isSorting(testHeader)).toBe(false);
    });

    it('should return instantiated headers', () => {
        fixture.detectChanges();
        expect(testHostComp.getHeaders()).toBe(comp.settings.headers);
    });

    it('should set ss-icon arrow rotate to top when header direction is asc', () => {
        testHeader.sortable.enabled = true;
        testHeader.sortable.direction = SortDirectionEnum.asc;
        fixture.detectChanges();

        expect(testHostComp.getArrowRotation(testHeader)).toEqual(rotateTop);
    });

    it('should not set ss-icon arrow rotate to top when header direction is not asc', () => {
        testHeader.sortable.enabled = true;
        testHeader.sortable.direction = SortDirectionEnum.desc;
        fixture.detectChanges();

        expect(testHostComp.getArrowRotation(testHeader)).not.toEqual(rotateTop);
    });

    it('should set ss-icon arrow rotate to bottom when header direction is desc', () => {
        testHeader.sortable.enabled = true;
        testHeader.sortable.direction = SortDirectionEnum.desc;
        fixture.detectChanges();

        expect(testHostComp.getArrowRotation(testHeader)).toEqual(rotateBottom);
    });

    it('should not set ss-icon arrow rotate to bottom when header direction is not desc', () => {
        testHeader.sortable.enabled = true;
        testHeader.sortable.direction = SortDirectionEnum.asc;
        fixture.detectChanges();
        expect(testHostComp.getArrowRotation(testHeader)).not.toEqual(rotateBottom);
    });

    it('should render additional css classes passed on settings', () => {
        testHeader.headerClass = testCSSClass;
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestHeader + '.' + testCSSClass)).toBeDefined();
    });

    it('should not render additional css classes passed on settings', () => {
        testHeader.headerClass = null;
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestHeader + '.' + testCSSClass)).toBeNull();
    });

    it('should emit onClickRow with right params when row is clicked', () => {
        const mockedRow: Object = mockRecords[0];
        spyOn(testHostComp.clickRow, 'emit');
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestRow).dispatchEvent(clickEvent);
        expect(testHostComp.clickRow.emit).toHaveBeenCalledWith(mockedRow);
    });

    it('should emit onClickCell with right params when cell is clicked', () => {
        const mockedCell: Object = {
            value: 'b2',
            field: 'b',
            row: 1,
            cell: 1,
        };
        spyOn(testHostComp.clickCell, 'emit');
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestCell).dispatchEvent(clickEvent);
        expect(testHostComp.clickCell.emit).toHaveBeenCalledWith(mockedCell);
    });

    it('should not set widths for header without widths', () => {
        testHeader.width = null;
        fixture.detectChanges();
        testHostComp.ngAfterContentInit();
        expect(getIconStyles(dataAutomationSelectorTestHeader)).toBe(null);
    });

    it('should set sort direction desc on click header when direction is asc', () => {
        testHeader.sortable.direction = SortDirectionEnum.asc;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestHeader).dispatchEvent(clickEvent);
        expect(testHeader.sortable.direction as SortDirectionEnum).toBe(SortDirectionEnum.desc);
    });

    it('should set sort direction asc on click header when direction is desc', () => {
        testHeader.sortable.direction = SortDirectionEnum.desc;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestHeader).dispatchEvent(clickEvent);
        expect(testHeader.sortable.direction as SortDirectionEnum).toBe(SortDirectionEnum.asc);
    });

    it('should render CSS class for selected rows', () => {
        comp.isSelecting = true;
        comp.selectedRows = [mockRecords[0].id];
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestRow).classList).toContain(CSS_CLASS_SELECTED);
    });

    it('should render CSS class for new rows', () => {
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestRow).classList).toContain(CSS_CLASS_HAS_MARKER);
    });

    it('should render CSS class for selectable rows', () => {
        comp.isSelecting = true;
        comp.selectedRows = [];
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestRow).classList).toContain(CSS_CLASS_SELECTABLE);
    });

    it('should render CSS class for un-selectable rows', () => {
        comp.isSelecting = true;
        comp.selectedRows = [];
        testHostComp.isRowSelectable = noRowSelectableFunction;
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorTestRow).classList).toContain(CSS_CLASS_NOT_SELECTABLE);
    });

    it('should emit onSelectionChange with selected row', () => {
        spyOn(testHostComp.selectionChange, 'emit');
        comp.isSelecting = true;
        comp.selectedRows = [];
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestRow).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith([mockRecords[0].id]);
    });

    it('should un-select selected row on click on that row', () => {
        spyOn(testHostComp.selectionChange, 'emit');
        comp.isSelecting = true;
        comp.selectedRows = [mockRecords[0].id];
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestRow).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith([]);
    });

    it('should index selection by specific property', () => {
        spyOn(testHostComp.selectionChange, 'emit');
        comp.isSelecting = true;
        comp.selectedRows = [];
        testHostComp.selectBy = 'a';
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestRow).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith([mockRecords[0].a]);
    });

    it('should not select un-selectable rows', () => {
        spyOn(testHostComp.selectionChange, 'emit');
        comp.isSelecting = true;
        comp.selectedRows = [];
        testHostComp.isRowSelectable = noRowSelectableFunction;
        fixture.detectChanges();
        el.querySelector(dataAutomationSelectorTestRow).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(testHostComp.selectionChange.emit).not.toHaveBeenCalled();
    });

    it('should have the select row button disabled when row is not selectable', () => {
        comp.isSelecting = true;
        comp.selectedRows = [];
        testHostComp.isRowSelectable = noRowSelectableFunction;

        fixture.detectChanges();

        expect((getElement(`${getTableAreaFieldSelector('row', '0')} button`) as HTMLButtonElement).disabled).toBe(true);
        expect(getElement(`${getTableAreaFieldSelector('row', '0')} button`).attributes['disabled']).toBeDefined();
    });

    it('should not have the select row button disabled when row is selectable', () => {
        comp.isSelecting = true;
        comp.selectedRows = [];

        fixture.detectChanges();

        expect((getElement(`${getTableAreaFieldSelector('row', '0')} button`) as HTMLButtonElement).disabled).toBe(false);
        expect(getElement(`${getTableAreaFieldSelector('row', '0')} button`).attributes['disabled']).toBeUndefined();
    });

    it('should render an empty cell when cell value is null', () => {
        const dataAutomationSelectorTestEmptyCell = '[data-automation*="table-cell-4-0"]';

        comp.records = [
            ...mockRecords,
            {
                id: '5',
                a: null,
                b: 'b5',
                c: 'c5',
            },
        ]

        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorTestEmptyCell).innerText).toBe("-");
    });

    it('should render an empty cell when cell value is undefined', () => {
        const dataAutomationSelectorTestEmptyCell = '[data-automation*="table-cell-4-0"]';

        comp.records = [
            ...mockRecords,
            {
                id: '5',
                a: undefined,
                b: 'b5',
                c: 'c5',
            },
        ]

        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorTestEmptyCell).innerText).toBe("-");
    });

    describe('Select all', () => {
        const allRowsSelected = ['1', '2', '3', '4'];
        const allButOneRowSelected = ['1', '2', '3'];
        const dataAutomationSelectAllCheckboxButton = '[data-automation="table-select-all-checkbox-wrapper"]';
        const dataAutomationSelectAllButtonCheckedState = '[data-automation="table-select-all-button-checked-state"]';
        const dataAutomationSelectAllButtonIndeterminateState = '[data-automation="table-select-all-button-indeterminate-state"]';
        const dataAutomationSelectAllCheckboxContent = '[data-automation="table-select-all-checkbox-content"]';
        const checkboxDisabledClass = 'ss-table__checkbox--disabled';

        beforeEach(waitForAsync(() => {
            comp.isSelecting = true;
            fixture.detectChanges();
        }));

        it('should select all rows when click on select all checkbox', () => {
            spyOn(testHostComp.selectionChange, 'emit');

            getElement(dataAutomationSelectAllCheckboxButton).dispatchEvent(clickEvent);

            expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith(allRowsSelected);
        });

        it('should unselect all rows when they are all selected and the selectAll checkbox is clicked', () => {
            comp.selectedRows = allRowsSelected;
            fixture.detectChanges();

            spyOn(testHostComp.selectionChange, 'emit');
            getElement(dataAutomationSelectAllCheckboxButton).dispatchEvent(clickEvent);

            expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith([]);
        });

        it('should select all rows when it has indeterminate state and selectAll checkbox is clicked', () => {
            comp.selectedRows = allButOneRowSelected;
            fixture.detectChanges();

            spyOn(testHostComp.selectionChange, 'emit');
            getElement(dataAutomationSelectAllCheckboxButton).dispatchEvent(clickEvent);

            expect(testHostComp.selectionChange.emit).toHaveBeenCalledWith(allRowsSelected);
        });

        describe('Checkbox/Icons behaviour', () => {
            it('should not have selectAll checkbox when isSelecting is false', () => {
                comp.isSelecting = false;

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContent)).not.toBeDefined();
            });

            it('should have selectAll checkbox when isSelecting is true', ()=> {
                comp.isSelecting = true;

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContent)).toBeDefined();
            });

            it('should have the selectAll button disabled when there are no rows', ()=> {
                comp.records = [];

                fixture.detectChanges();

                expect((getElement(dataAutomationSelectAllCheckboxButton) as HTMLButtonElement).disabled).toBe(true);
                expect(getElement(dataAutomationSelectAllCheckboxButton).attributes['disabled']).toBeDefined();
            });

            it('should have the selectAll button disabled when no rows are selectable', ()=> {
                comp.selectedRows = [];
                testHostComp.isRowSelectable = noRowSelectableFunction;

                fixture.detectChanges();

                expect((getElement(dataAutomationSelectAllCheckboxButton) as HTMLButtonElement).disabled).toBe(true);
                expect(getElement(dataAutomationSelectAllCheckboxButton).attributes['disabled']).toBeDefined();
            });

            it('should not have the selectAll button disabled when there are rows and they are selectable', ()=> {
                expect(getElement(dataAutomationSelectAllCheckboxButton)).toBeDefined();
                expect((getElement(dataAutomationSelectAllCheckboxButton) as HTMLButtonElement).disabled).toBe(false);
                expect(getElement(dataAutomationSelectAllCheckboxButton).attributes['disabled']).toBeUndefined();
            });

            it('should have the modifier disabled class when no rows are selectable', ()=> {
                comp.selectedRows = [];
                testHostComp.isRowSelectable = noRowSelectableFunction;

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContent).classList).toContain(checkboxDisabledClass);
            });

            it('should not have the modifier disabled class when rows are selectable', ()=> {
                comp.selectedRows = [];

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContent).classList).not.toContain(checkboxDisabledClass);
            });

            it('should have check icon when clicked on select all', () => {
                getElement(dataAutomationSelectAllCheckboxButton).dispatchEvent(clickEvent);

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllButtonCheckedState)).toBeDefined();
            });

            it('should change to check icon when it has indeterminate icon and its clicked', () => {
                comp.selectedRows = allButOneRowSelected;
                fixture.detectChanges();

                getElement(dataAutomationSelectAllCheckboxButton).dispatchEvent(clickEvent);
                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllButtonCheckedState)).toBeDefined();
            });

            it('should set indeterminate icon when there is at least one row selected, but not all', () => {
                comp.selectedRows = allRowsSelected;
                fixture.detectChanges();

                const lastRowElement = getElement(getTableAreaFieldSelector('row', '3'));
                lastRowElement.dispatchEvent(clickEvent);
                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllButtonIndeterminateState)).toBeDefined();
                expect(getElement(dataAutomationSelectAllButtonCheckedState)).not.toBeDefined();
            });

            describe('Change page behavior', () => {
                it('should not have indeterminate nor check icon when no rows are selected', () => {
                    expect(getElement(dataAutomationSelectAllButtonCheckedState)).not.toBeDefined();
                    expect(getElement(dataAutomationSelectAllButtonIndeterminateState)).not.toBeDefined();
                });

                it('should have check icon when it starts with all rows selected', () => {
                    comp.selectedRows = allRowsSelected;

                    fixture.detectChanges();

                    expect(getElement(dataAutomationSelectAllButtonCheckedState)).toBeDefined();
                });

                it('should have indeterminate icon when it starts with at least one row selected, but not all', () => {
                    comp.selectedRows = allButOneRowSelected;

                    fixture.detectChanges();

                    expect(getElement(dataAutomationSelectAllButtonIndeterminateState)).toBeDefined();
                });
            });
        });
    });
});
