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

import {PaginatorPagesComponent} from './paginator-pages.component';

describe('Paginator Pages Component', () => {
    let fixture: ComponentFixture<PaginatorPagesComponent>;
    let comp: PaginatorPagesComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const paginatorPointsLeft = '.ss-paginator-pages__points--left';
    const paginatorPointsRight = '.ss-paginator-pages__points--right';
    const paginatorPageActive = '.ss-paginator-pages__page--active';
    const previousPage = '.ss-paginator-pages__shortcut--previous';
    const nextPage = '.ss-paginator-pages__shortcut--next';
    const disabledPaginator = 'ss-paginator-pages__shortcut--disabled';

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        declarations: [
            PaginatorPagesComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginatorPagesComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.totalItems = 10;
        comp.itemsPerPage = 1;
    });

    function setPageAndInitComponent(page: number) {
        comp.currentPage = page;
        comp.ngOnInit();
        fixture.detectChanges();
    }

    it('should not render left ... if current page is the first', () => {
        setPageAndInitComponent(0);
        expect(el.querySelector(paginatorPointsLeft)).toBe(null);
    });

    it('should not render left ... if current page 2 is units below the range limit', () => {
        setPageAndInitComponent(2);
        expect(comp.hasLeftEllipsis).toBe(false);
    });

    it('should not render left ... if current page is the second', () => {
        setPageAndInitComponent(1);
        expect(el.querySelector(paginatorPointsLeft)).toBe(null);
    });

    it('should not render right ... if current page is the previous to the last', () => {
        setPageAndInitComponent(8);
        expect(el.querySelector(paginatorPointsRight)).toBe(null);
    });

    it('should not render right ... if current page is equal to the range limit less three', () => {
        setPageAndInitComponent(6);
        expect(comp.hasRightEllipsis).toBe(false);
    });

    it('should not render right ... if current page is the last', () => {
        setPageAndInitComponent(10);
        expect(el.querySelector(paginatorPointsRight)).toBe(null);
    });

    it('should render left&right ... if current page is not 1st/2nd/previous to last/last', () => {
        setPageAndInitComponent(5);
        expect(el.querySelector(paginatorPointsLeft)).not.toBe(null);
        expect(el.querySelector(paginatorPointsRight)).not.toBe(null);
    });

    it('should change active page when clicking on a page number button', () => {
        const expectedActivePageNumber = '5';

        setPageAndInitComponent(0);

        el.querySelector('.ss-paginator-pages__page-wrapper').lastElementChild.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(el.querySelector(paginatorPageActive).textContent.trim()).toBe(expectedActivePageNumber);
    });

    it('should not navigate to previous if current page is the first', () => {
        const expectedActivePageNumber = '1';

        setPageAndInitComponent(1);
        el.querySelector(previousPage).dispatchEvent(clickEvent);
        fixture.detectChanges();
        el.querySelector(previousPage).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(el.querySelector(paginatorPageActive).textContent.trim()).toBe(expectedActivePageNumber);
        expect(el.querySelector(previousPage).classList.contains(disabledPaginator)).toBe(true);
    });

    it('should not navigate to next if current page is the last', () => {
        const expectedActivePageNumber = '10';

        setPageAndInitComponent(8);
        el.querySelector(nextPage).dispatchEvent(clickEvent);
        fixture.detectChanges();
        el.querySelector(nextPage).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(el.querySelector(paginatorPageActive).textContent.trim()).toBe(expectedActivePageNumber);
        expect(el.querySelector(nextPage).classList.contains(disabledPaginator)).toBe(true);
    });

    it('should emit an event when selecting a page', waitForAsync(() => {
        let selectedPage: number;

        setPageAndInitComponent(0);
        comp.changePage.subscribe((pageChangeEvent: number) => selectedPage = pageChangeEvent);
        el.querySelector('.ss-paginator-pages__page-wrapper').lastElementChild.dispatchEvent(clickEvent);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(selectedPage).toEqual(4);
        });
    }));

    it('should not emit an event when selecting the current page', waitForAsync(() => {
        let selectedPage: number;

        setPageAndInitComponent(0);
        comp.changePage.subscribe((pageChangeEvent: number) => selectedPage = pageChangeEvent);
        el.querySelector(paginatorPageActive).dispatchEvent(clickEvent);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(selectedPage).toBe(undefined);
        });
    }));

    it('should set the current page to the last one if total pages is lower than the current page', () => {
        setPageAndInitComponent(9);
        comp.itemsPerPage = 4;
        fixture.detectChanges();
        comp.ngOnChanges({});
        expect(comp.currentPage).toBe(3);
    });

    it('should have a range of 3 when first and last pages are outside range', () => {
        setPageAndInitComponent(5);
        expect(comp.pages.length).toEqual(3);
    });

    it('should have a range of 5 when first or last pages are inside range', () => {
        setPageAndInitComponent(2);
        expect(comp.pages.length).toEqual(5);
        setPageAndInitComponent(8);
        expect(comp.pages.length).toEqual(5);
    });
});
