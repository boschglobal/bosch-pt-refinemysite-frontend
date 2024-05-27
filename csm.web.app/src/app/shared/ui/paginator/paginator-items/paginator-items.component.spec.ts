/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {PaginatorItemsComponent} from './paginator-items.component';

describe('Paginator Items Component', () => {
    let fixture: ComponentFixture<PaginatorItemsComponent>;
    let comp: PaginatorItemsComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const paginatorItemsContainer = '.ss-paginator-items__items-wrapper';
    const defaultItems: number[] = [100, 200, 500];

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        declarations: [PaginatorItemsComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginatorItemsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    function initializeComponent(totalItems: number, currentItem?: number, items: number[] = defaultItems) {
        comp.totalItems = totalItems;
        comp.currentItem = currentItem;
        comp.items = items;
        fixture.detectChanges();
    }

    it('should emit an event with the selected length when clicking a button', waitForAsync(() => {
        let selectedItem: number;
        const lastElementIndex = 2;
        const totalItems = 1000;

        initializeComponent(totalItems);
        comp.change.subscribe((itemChangeEvent: number) => selectedItem = itemChangeEvent);
        el.querySelector(paginatorItemsContainer).lastElementChild.dispatchEvent(clickEvent);

        fixture.whenStable().then(() => {
            expect(selectedItem).toBe(defaultItems[lastElementIndex]);
        });
    }));

    it('should not emit an event if total items is less than the items of the clicked button', waitForAsync(() => {
        let selectedItem: number;
        const totalItems = 99;

        initializeComponent(totalItems);
        comp.change.subscribe((itemChangeEvent: number) => selectedItem = itemChangeEvent);
        el.querySelector(paginatorItemsContainer).lastElementChild.dispatchEvent(clickEvent);

        fixture.whenStable().then(() => {
            expect(selectedItem).toBe(undefined);
        });
    }));

    it('should not emit an event if the button clicked is the current selected length', waitForAsync(() => {
        let selectedItem: number;
        const totalItems = 1000;
        const currentItem = 500;

        initializeComponent(totalItems, currentItem);
        comp.change.subscribe((itemChangeEvent: number) => selectedItem = itemChangeEvent);
        el.querySelector(paginatorItemsContainer).lastElementChild.dispatchEvent(clickEvent);

        fixture.whenStable().then(() => {
            expect(selectedItem).toBe(undefined);
        });
    }));
});
