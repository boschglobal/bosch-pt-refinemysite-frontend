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

import {PaginatorEntriesComponent} from './paginator-entries.component';

describe('Paginator Entries Component', () => {
    let fixture: ComponentFixture<PaginatorEntriesComponent>;
    let comp: PaginatorEntriesComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const paginatorEntriesSelector = '.ss-paginator-entries span';
    const totalEntries = 20;
    const entriesPerPage = 2;
    const currentPage = 0;

    const moduleDef: TestModuleMetadata = {
        declarations: [PaginatorEntriesComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginatorEntriesComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.totalEntries = totalEntries;
        comp.entriesPerPage = entriesPerPage;
        comp.currentPage = currentPage;

        fixture.detectChanges();
    });

    it('should render component with the format start-end/totalItems', () => {
        const expectedContent: string = (currentPage + 1).toString() + '-' + entriesPerPage.toString() + '/' + totalEntries.toString();
        expect(el.querySelector(paginatorEntriesSelector).textContent.trim()).toBe(expectedContent);
    });

});
