/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {
    Chip,
    ChipComponent
} from '../chip/chip.component';
import {ChipListComponent} from './chip-list.component';
import {ChipListTestComponent} from './chip-list.test.component';

describe('Chip List Component', () => {
    let fixture: ComponentFixture<ChipListTestComponent>;
    let testHostComp: ChipListTestComponent;
    let comp: ChipListComponent;
    let de: DebugElement;

    const chipListHostSelector = 'ss-chip-list';
    const chipListSelector = '[data-automation="chip-list"]';
    const chipListLabelSelector = '[data-automation="chip-list-label"]';
    const chipListItemSelector = '[data-automation="chip-list-item"]';
    const removeAllButtonSelector = '[data-automation="chip-list-remove-all"]';
    const removeButtonSelector = `[data-automation^="chip-remove-"]`;

    const chipItems: Chip[] = [
        {id: '1', text: 'item'},
        {id: '2', text: 'item two'},
        {id: '3', text: 'Chicken Here'},
        {id: '4', text: 'From: 2017-09-01'},
    ];

    const moreChipsItems: Chip[] = [
        {id: '1', text: 'item'},
        {id: '2', text: 'item two'},
        {id: '3', text: 'Chicken Here'},
        {id: '4', text: 'From: 2017-09-01'},
        {id: '5', text: 'item'},
        {id: '6', text: 'item two'},
        {id: '7', text: 'Chicken Here'},
        {id: '8', text: 'From: 2017-09-01'},
    ];

    const listLabel = 'Task_Filter_AppliedFilters';
    const removeAllLabel = 'Generic_ClearAll';

    const clickEvent: Event = new Event('click');

    const getNativeElement = (selector: string) => fixture.debugElement.query(By.css(selector))?.nativeElement;

    const getAllElements = (selector: string) => fixture.debugElement.queryAll(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ChipComponent,
            ChipListComponent,
            ChipListTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChipListTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(chipListHostSelector));
        comp = de.componentInstance;

        testHostComp.items = chipItems;
        testHostComp.removeAllLabel = removeAllLabel;
        testHostComp.listLabel = listLabel;
        fixture.detectChanges();
    });

    it('should render chip list', () => {
        expect(getNativeElement(chipListSelector)).toBeTruthy();
    });

    it('should not render chip list when there are no chips', () => {
        testHostComp.items = [];
        fixture.detectChanges();

        expect(getNativeElement(chipListSelector)).toBeFalsy();
    });

    it('should render one chip per each item', () => {
        expect(getAllElements(chipListItemSelector).length).toBe(chipItems.length);
    });

    it('should set right label for remove all button', () => {
        expect(getNativeElement(removeAllButtonSelector).textContent.trim()).toBe(removeAllLabel);
    });

    it('should set right label for list', () => {
        expect(getNativeElement(chipListLabelSelector).textContent.trim()).toBe(listLabel);
    });

    it('should emit removeAll event when clicking on the remove all button', () => {
        spyOn(comp.removeAll, 'emit');

        getNativeElement(removeAllButtonSelector).dispatchEvent(clickEvent);

        expect(comp.removeAll.emit).toHaveBeenCalledWith(chipItems);
    });

    it('should emit remove event when clicking on chip\'s remove button', () => {
        spyOn(comp.remove, 'emit');

        getNativeElement(removeButtonSelector).dispatchEvent(clickEvent);

        expect(comp.remove.emit).toHaveBeenCalledWith(chipItems[0]);
    });

    it('should show the remove all button when showRemoveAll is true', () => {
        testHostComp.showRemoveAll = true;
        fixture.detectChanges();

        expect(getNativeElement(removeAllButtonSelector)).toBeTruthy();
    });

    it('should not show the remove all button when showRemoveAll is false', () => {
        testHostComp.showRemoveAll = false;
        fixture.detectChanges();

        expect(getNativeElement(removeAllButtonSelector)).toBeFalsy();
    });

    it('should show only 6 chips when list of chips is more than 6', () => {
        comp.items = moreChipsItems;

        expect(comp.currentMaximumChips).toBe(6);
    });

    it('should show only 2 chips when list of chips is more than 2, and maxChipsShow is defined to 2', () => {
        comp.maxChipsToShow = 2;
        comp.items = moreChipsItems;

        expect(comp.currentMaximumChips).toBe(2);
    });

    it('should set canShowMore to true when maxChipsToShow is defined and items length is ' +
        'bigger than macChipsToShow', () => {
        comp.maxChipsToShow = 6;
        comp.items = moreChipsItems;

        expect(comp.canShowMore).toBeTruthy();
    });

    it('should set canShowMore to true when maxChipsToShow is defined and items length is ' +
        'smaller than macChipsToShow', () => {
        comp.maxChipsToShow = 6;
        comp.items = chipItems;

        expect(comp.canShowMore).toBeFalsy();
    });

    it('should set chipsCollapsed to true when canShowMore and _ChipsCollapsed are set to true ', () => {
        comp.maxChipsToShow = 6;
        comp.items = moreChipsItems;

        expect(comp.chipsCollapsed).toBeTruthy();
    });

    it('should set chipsCollapsed to false when canShowMore is set to false and _ChipsCollapsed is set to true', () => {
        comp.maxChipsToShow = 6;
        comp.items = chipItems;

        expect(comp.chipsCollapsed).toBeFalsy();
    });

    it('should set chipsCollapsed to false when canShowMore is set to true and _ChipsCollapsed is set to false', () => {
        comp.maxChipsToShow = 6;
        comp.items = moreChipsItems;

        comp.onShowMoreChange();

        expect(comp.chipsCollapsed).toBeFalsy();
    });
});
