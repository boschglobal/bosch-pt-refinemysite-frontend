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

import {MOCK_LIST_RECORDS} from '../../../../test/mocks/collapsible-list';
import {TranslationModule} from '../../translation/translation.module';
import {
    CollapsibleListComponent,
    CSS_CLASS_HAS_MARKER,
    CSS_CLASS_NOT_SELECTABLE,
    CSS_CLASS_SELECTABLE,
    CSS_CLASS_SELECTED
} from './collapsible-list.component';
import {CollapsibleListTestComponent} from './collapsible-list.test.component';

describe('Collapsible List Component', () => {
    let testHostComp: CollapsibleListTestComponent;
    let comp: CollapsibleListComponent;
    let fixture: ComponentFixture<CollapsibleListTestComponent>;
    let de: DebugElement;

    let firstRowArrowElement: HTMLElement;
    let firstRowSecondaryTemplateElement: DebugElement;
    let firstRowPrimaryTemplateTextContent: string;
    let firstRowSecondaryTemplateTextContent: string;
    let numberOfRenderedSecondaryTemplates: number;
    let numberOfRenderedRows: number;

    const clickEvent: Event = new Event('click');
    const collapsibleListSelector = 'ss-collapsible-list';
    const dataAutomationPrimaryTemplateSelector = '[data-automation="primary-template"]';
    const dataAutomationSecondaryTemplateSelector = '[data-automation="secondary-template"]';
    const dataAutomationFirstRowArrowSelector = '[data-automation="ss-collapsible-list-arrow-0"]';
    const dataAutomationFirstRowSelector = '[data-automation="ss-collapsible-list-row-0"]';
    const dataAutomationNeutralRowSelector = '[data-automation="ss-collapsible-list-row-3"]';
    const dataAutomationErrorRowSelector = '[data-automation="ss-collapsible-list-row-4"]';
    const dataAutomationSuccessRowSelector = '[data-automation="ss-collapsible-list-row-5"]';
    const dataAutomationWarningRowSelector = '[data-automation="ss-collapsible-list-row-6"]';
    const dataAutomationRowSelector = '[data-automation^="ss-collapsible-list-row"]';
    const cssClassHasMarkerNeutral = 'ss-collapsible-list__row--has-marker-neutral';
    const cssClassHasMarkerError = 'ss-collapsible-list__row--has-marker-error';
    const cssClassHasMarkerSuccess = 'ss-collapsible-list__row--has-marker-success';
    const cssClassHasMarkerWarning = 'ss-collapsible-list__row--has-marker-warning';

    const noRowSelectableFunction: Function = () => false;
    const getElement = (selector: string): HTMLElement => de.query((By.css(selector)))?.nativeElement;
    const getTableAreaFieldSelector = (area: string, field: string) => `[data-automation="ss-collapsible-list-${area}-${field}"]`;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            CollapsibleListComponent,
            CollapsibleListTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CollapsibleListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(collapsibleListSelector));
        comp = de.componentInstance;
        testHostComp.records = MOCK_LIST_RECORDS;
        comp.selectedRows = [];

        fixture.detectChanges();
    });

    afterEach(() => {
        firstRowPrimaryTemplateTextContent = '';
        firstRowSecondaryTemplateTextContent = '';
        numberOfRenderedSecondaryTemplates = 0;
        numberOfRenderedRows = 0;
    });

    it('should hide collapsible item when record entry has notCollapsible true', () => {
        testHostComp.records = [
            {
                id: 'mockId',
                isNew: true,
                state: 'success',
                notCollapsible: true,
            }];
        fixture.detectChanges();

        const fetchedArrow = de.query(By.css(dataAutomationFirstRowArrowSelector));

        expect(fetchedArrow).toBeNull();
    });

    it('should uncollapse a row when clicking in the arrow of that row and the row is collapsed', () => {
        firstRowArrowElement = de.query(By.css(dataAutomationFirstRowArrowSelector)).nativeElement;
        firstRowArrowElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        firstRowSecondaryTemplateElement = de.query(By.css(dataAutomationSecondaryTemplateSelector));

        expect(firstRowSecondaryTemplateElement).toBeTruthy();
    });

    it('should collapse a row when clicking in the arrow of that row and the row is uncollapsed', () => {
        comp.recordsCollapsedState[0] = true;
        fixture.detectChanges();
        firstRowArrowElement = de.query(By.css(dataAutomationFirstRowArrowSelector)).nativeElement;
        firstRowArrowElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        firstRowSecondaryTemplateElement = de.query(By.css(dataAutomationSecondaryTemplateSelector));

        expect(firstRowSecondaryTemplateElement).toBeFalsy();
    });

    it('should emit an event after a row is clicked with the information of that row', () => {
        spyOn(comp.clickRow, 'emit').and.callThrough();

        de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.clickRow.emit).toHaveBeenCalled();
        expect(comp.clickRow.emit).toHaveBeenCalledWith(MOCK_LIST_RECORDS[0]);
    });

    it('should collapse all uncollapsed rows after isLoading is set to true', () => {
        testHostComp.records = [
            {
                id: 'mockId',
                isNew: true,
                state: 'success',
                notCollapsible: true,
            }];

        firstRowArrowElement = de.query(By.css(dataAutomationFirstRowArrowSelector)).nativeElement;
        firstRowArrowElement.dispatchEvent(clickEvent);

        fixture.detectChanges();

        numberOfRenderedSecondaryTemplates = de.queryAll(By.css(dataAutomationSecondaryTemplateSelector)).length;
        expect(numberOfRenderedSecondaryTemplates).toBeTruthy();

        testHostComp.isLoading = true;
        fixture.detectChanges();

        numberOfRenderedSecondaryTemplates = de.queryAll(By.css(dataAutomationSecondaryTemplateSelector)).length;
        expect(de.queryAll(By.css(dataAutomationSecondaryTemplateSelector)).length).toBeFalsy();
    });

    it('should render the templates with the row information as context', () => {
        testHostComp.records = MOCK_LIST_RECORDS;

        firstRowArrowElement = de.query(By.css(dataAutomationFirstRowArrowSelector)).nativeElement;
        firstRowArrowElement.dispatchEvent(clickEvent);

        fixture.detectChanges();
        firstRowPrimaryTemplateTextContent = de.query(By.css(dataAutomationPrimaryTemplateSelector)).nativeElement.textContent;
        firstRowSecondaryTemplateTextContent = de.query(By.css(dataAutomationSecondaryTemplateSelector)).nativeElement.textContent;

        expect(firstRowPrimaryTemplateTextContent).toBe(MOCK_LIST_RECORDS[0].a);
        expect(firstRowSecondaryTemplateTextContent).toBe(MOCK_LIST_RECORDS[0].b);
    });

    it('should render one row per record passed in', () => {
        testHostComp.records = MOCK_LIST_RECORDS;
        fixture.detectChanges();
        numberOfRenderedRows = de.queryAll(By.css(dataAutomationRowSelector)).length;

        expect(numberOfRenderedRows).toBe(MOCK_LIST_RECORDS.length);
    });

    it('should render CSS class for selected rows', () => {
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [MOCK_LIST_RECORDS[0].id];
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.classList).toContain(CSS_CLASS_SELECTED);
    });

    it('should render CSS class for new rows', () => {
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.classList).toContain(CSS_CLASS_HAS_MARKER);
    });

    it('should render CSS class for new rows with status NEUTRAL', () => {
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationNeutralRowSelector)).nativeElement.classList).toContain(cssClassHasMarkerNeutral);
    });

    it('should render CSS class for new rows with status ERROR', () => {
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationErrorRowSelector)).nativeElement.classList).toContain(cssClassHasMarkerError);
    });

    it('should render CSS class for new rows with status SUCCESS', () => {
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationSuccessRowSelector)).nativeElement.classList).toContain(cssClassHasMarkerSuccess);
    });

    it('should render CSS class for new rows with status WARNING', () => {
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationWarningRowSelector)).nativeElement.classList).toContain(cssClassHasMarkerWarning);
    });

    it('should render CSS class for selectable rows', () => {
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.classList).toContain(CSS_CLASS_SELECTABLE);
    });

    it('should render CSS class for un-selectable rows', () => {
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        comp.isRowSelectable = noRowSelectableFunction;
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.classList).toContain(CSS_CLASS_NOT_SELECTABLE);
    });

    it('should emit onSelectionChange with selected row', () => {
        spyOn(comp.selectionChange, 'emit');
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        fixture.detectChanges();
        de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.selectionChange.emit).toHaveBeenCalledWith([MOCK_LIST_RECORDS[0].id]);
    });

    it('should un-select selected row on click on that row', () => {
        spyOn(comp.selectionChange, 'emit');
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [MOCK_LIST_RECORDS[0].id];
        fixture.detectChanges();
        de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.selectionChange.emit).toHaveBeenCalledWith([]);
    });

    it('should index selection by specific property', () => {
        spyOn(comp.selectionChange, 'emit');
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        comp.selectBy = 'a';
        fixture.detectChanges();
        de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.selectionChange.emit).toHaveBeenCalledWith([MOCK_LIST_RECORDS[0].a]);
    });

    it('should not select un-selectable rows', () => {
        spyOn(comp.selectionChange, 'emit');
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        testHostComp.isRowSelectable = noRowSelectableFunction;
        fixture.detectChanges();
        de.query(By.css(dataAutomationFirstRowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.selectionChange.emit).not.toHaveBeenCalled();
    });

    it('should not select when clicking in arrow', () => {
        spyOn(comp.selectionChange, 'emit');
        testHostComp.isSelecting = true;
        testHostComp.selectedRows = [];
        fixture.detectChanges();
        de.query(By.css(dataAutomationFirstRowArrowSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.selectionChange.emit).not.toHaveBeenCalled();
    });

    it('should have the select row button disabled when row is not selectable', () => {
        testHostComp.isSelecting = true;
        testHostComp.isRowSelectable = noRowSelectableFunction;

        fixture.detectChanges();

        expect((getElement(`${getTableAreaFieldSelector('row', '0')} button`) as HTMLButtonElement).disabled).toBe(true);
        expect(getElement(`${getTableAreaFieldSelector('row', '0')} button`).attributes['disabled']).toBeDefined();
    });

    it('should not have the select row button disabled when row is selectable', () => {
        testHostComp.isSelecting = true;

        fixture.detectChanges();

        expect((getElement(`${getTableAreaFieldSelector('row', '0')} button`) as HTMLButtonElement).disabled).toBe(false);
        expect(getElement(`${getTableAreaFieldSelector('row', '0')} button`).attributes['disabled']).toBeUndefined();
    });

    describe('Select all', () => {
        const allRowsSelected = ['1', '2', '3', '4', '5', '6', '7'];
        const allButOneRowSelected = ['1', '2', '3'];
        const dataAutomationSelectAllCheckboxContainer = '[data-automation="collapsible-list-select-all-checkbox"]';
        const dataAutomationCheckIcon = '[data-automation="collapsible-list-check-icon"]';
        const dataAutomationIndeterminateIcon = '[data-automation="collapsible-list-indeterminate-icon"]';
        const dataAutomationSelectAllWrapper = '[data-automation="collapsible-list-select-all-wrapper"]';
        const dataAutomationSelectAllCheckboxButton = '[data-automation="collapsible-list-select-all-wrapper"] div button';
        const checkboxDisabledClass = 'ss-collapsible-list__checkbox--disabled';

        beforeEach(() => {
            testHostComp.isSelecting = true;

            fixture.detectChanges();
        });

        it('should select all rows when click on select all checkbox', () => {
            spyOn(comp.selectionChange, 'emit');

            testHostComp.selectedRows = [];
            fixture.detectChanges();

            getElement(dataAutomationSelectAllCheckboxContainer).dispatchEvent(clickEvent);

            expect(comp.selectionChange.emit).toHaveBeenCalledWith(allRowsSelected);
        });

        it('should unselect all rows when they are all selected and the selectAll checkbox is clicked', () => {
            testHostComp.selectedRows = allRowsSelected;
            fixture.detectChanges();

            spyOn(comp.selectionChange, 'emit');
            getElement(dataAutomationSelectAllCheckboxContainer).dispatchEvent(clickEvent);

            expect(comp.selectionChange.emit).toHaveBeenCalledWith([]);
        });

        it('should select all rows when it has indeterminate state and selectAll checkbox is clicked', () => {
            testHostComp.selectedRows = allButOneRowSelected;
            fixture.detectChanges();

            spyOn(comp.selectionChange, 'emit');

            getElement(dataAutomationSelectAllCheckboxContainer).dispatchEvent(clickEvent);

            expect(comp.selectionChange.emit).toHaveBeenCalledWith(allRowsSelected);
        });

        describe('Checkbox/Icons behaviour', () => {
            it('should not have selectAll checkbox when isSelecting is false', () => {
                testHostComp.isSelecting = false;

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllWrapper)).not.toBeDefined();
            });

            it('should not have selectAll checkbox when there are no rows', () => {
                expect(getElement(dataAutomationSelectAllWrapper)).not.toBeDefined();
            });

            it('should have selectAll checkbox when there are rows and isSelecting is true', () => {
                testHostComp.isSelecting = true;
                testHostComp.records = MOCK_LIST_RECORDS;
                testHostComp.selectedRows = [];

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllWrapper)).toBeDefined();
            });

            it('should have the modifier disabled class when no rows are selectable', () => {
                testHostComp.selectedRows = [];
                comp.isRowSelectable = noRowSelectableFunction;

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContainer).classList).toContain(checkboxDisabledClass);
            });

            it('should not have the modifier disabled class when rows are selectable', () => {
                testHostComp.selectedRows = [];

                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxContainer).classList).not.toContain(checkboxDisabledClass);
            });

            it('should have the selectAll button disabled when no rows are selectable', () => {
                testHostComp.isRowSelectable = noRowSelectableFunction;
                testHostComp.selectedRows = [];

                fixture.detectChanges();

                expect((getElement(dataAutomationSelectAllCheckboxButton) as HTMLButtonElement).disabled).toBe(true);
                expect(getElement(dataAutomationSelectAllCheckboxButton).attributes['disabled']).toBeDefined();
            });

            it('should not have the selectAll button disabled when there are rows and they are selectable', () => {
                testHostComp.selectedRows = [];
                fixture.detectChanges();

                expect(getElement(dataAutomationSelectAllCheckboxButton)).toBeDefined();
                expect((getElement(dataAutomationSelectAllCheckboxButton) as HTMLButtonElement).disabled).toBe(false);
                expect(getElement(dataAutomationSelectAllCheckboxButton).attributes['disabled']).toBeUndefined();
            });

            it('should have check icon when clicked on select all', () => {
                testHostComp.isSelecting = true;
                testHostComp.selectedRows = [];
                fixture.detectChanges();

                getElement(dataAutomationSelectAllCheckboxContainer).dispatchEvent(clickEvent);

                fixture.detectChanges();

                expect(getElement(dataAutomationCheckIcon)).toBeDefined();
            });

            it('should change to check icon when it has indeterminate icon and its clicked', () => {
                testHostComp.selectedRows = allButOneRowSelected;
                fixture.detectChanges();

                getElement(dataAutomationSelectAllCheckboxContainer).dispatchEvent(clickEvent);
                fixture.detectChanges();

                expect(getElement(dataAutomationCheckIcon)).toBeDefined();
            });

            it('should set indeterminate icon when there is at least one row selected, but not all', () => {
                testHostComp.selectedRows = allRowsSelected;
                fixture.detectChanges();

                const firstRowElement = getElement(getTableAreaFieldSelector('row', '1'));
                firstRowElement.dispatchEvent(clickEvent);
                fixture.detectChanges();

                expect(getElement(dataAutomationIndeterminateIcon)).toBeDefined();
                expect(getElement(dataAutomationCheckIcon)).not.toBeDefined();
            });

            describe('Change page behavior', () => {
                it('should not have indeterminate nor check icon when no rows are selected', () => {
                    expect(getElement(dataAutomationCheckIcon)).not.toBeDefined();
                    expect(getElement(dataAutomationIndeterminateIcon)).not.toBeDefined();
                });

                it('should have check icon when it starts with all rows selected', () => {
                    testHostComp.selectedRows = allRowsSelected;

                    fixture.detectChanges();

                    expect(getElement(dataAutomationCheckIcon)).toBeDefined();
                });

                it('should have indeterminate icon when it starts with at least one row selected, but not all', () => {
                    testHostComp.selectedRows = allButOneRowSelected;

                    fixture.detectChanges();

                    expect(getElement(dataAutomationIndeterminateIcon)).toBeDefined();
                });
            });
        });
    });
});
