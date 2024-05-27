/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DIMENSIONS} from '../../../../../../shared/ui/constants/dimensions.constant';
import {TrafficLightWithLabelComponent} from '../../../../../../shared/ui/traffic-light/traffic-light-with-label.component';
import {PROJECT_KPIS_COLOR_RANGES} from '../../../../../project-common/constants/project-kpis-color-ranges.constant';
import {PpcGroupedTableComponent} from './ppc-grouped-table.component';

describe('PpcGroupedTableComponent', () => {
    let comp: PpcGroupedTableComponent;
    let fixture: ComponentFixture<PpcGroupedTableComponent>;
    let debugElement: DebugElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            PpcGroupedTableComponent,
            TrafficLightWithLabelComponent
        ]
    };

    const ROWS = [
        {
            title: 'row 1 title',
            subtitle: 'row 1 subtitle',
            cells: [
                {
                    ppc: 11,
                    reasons: [],
                    week: '11'
                },
                {
                    ppc: 12,
                    reasons: [],
                    week: '12'
                },
                {
                    ppc: 13,
                    reasons: [],
                    week: '13'
                }
            ]
        },
        {
            title: 'row 2 title',
            subtitle: 'row 2 subtitle',
            cells: [
                {
                    ppc: 21,
                    reasons: [],
                    week: '21'
                },
                {
                    ppc: 22,
                    reasons: [],
                    week: '22'
                },
                {
                    ppc: 23,
                    reasons: [],
                    week: '23'
                }
            ]
        }
    ];

    const COLUMNS = [
        {
            title: 'column 1 title',
            subtitle: 'column 1 subtitle'
        },
        {
            title: 'column 2 title',
            subtitle: 'column 2 subtitle'
        },
        {
            title: 'column 3 title',
            subtitle: 'column 3 subtitle'
        }
    ];

    const getColumnHeaders = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-header"]'));
    const getColumnHeaderTitles = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-header-title"]'));
    const getColumnHeaderSubTitles = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-header-subtitle"]'));
    const getRowTitles = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-row-title"]'));
    const getRowSubtitles = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-row-subtitle"]'));
    const getRowHeaders = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-row-header"]'));
    const getRows = () => debugElement.queryAll(By.css('[data-automation="ppc-grouped-table-row"]'));
    const getCells = (el) => el.querySelectorAll('[data-automation="ppc-grouped-table-cell"]');

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PpcGroupedTableComponent);
        comp = fixture.componentInstance;
        debugElement = fixture.debugElement;

        comp.trafficLightSettings = {
            size: DIMENSIONS.base_dimension__x2,
            ranges: PROJECT_KPIS_COLOR_RANGES,
            valueFormatter: v => v
        };

        comp.columns = COLUMNS;
        comp.rows = ROWS;
        comp.showTotalsColumn = false;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    it('should display all the header columns with the correct content', () => {
        const headerTitles = getColumnHeaderTitles();
        const headerSubtitles = getColumnHeaderSubTitles();

        for (let i = 0; i < COLUMNS.length; i++) {
            expect(headerTitles[i].nativeElement.textContent).toEqual(COLUMNS[i].title);
            expect(headerSubtitles[i].nativeElement.textContent).toEqual(COLUMNS[i].subtitle);
        }
    });

    it('should display all the header columns with the correct classes', () => {
        const headerClasses = getColumnHeaders();

        for (let i = 0; i < COLUMNS.length; i++) {
            expect(headerClasses[i].nativeElement.classList.contains('ss-ppc-grouped-table__header')).toBeTruthy();
            expect(headerClasses[i].nativeElement.classList.contains('ss-ppc-grouped-table__header--total')).toBeFalsy();
        }

        comp.showTotalsColumn = true;
        fixture.detectChanges();

        for (let i = 0; i < COLUMNS.length; i++) {
            expect(headerClasses[i].nativeElement.classList.contains('ss-ppc-grouped-table__header')).toBeTruthy();
            expect(headerClasses[i].nativeElement.classList.contains('ss-ppc-grouped-table__header--total')).toEqual(i === COLUMNS.length - 1);
        }
    });

    it('should display all row titles with the correct content', () => {
        const rowTitles = getRowTitles();
        const rowSubtitles = getRowSubtitles();

        for (let i = 0; i < ROWS.length; i++) {
            expect(rowTitles[i].nativeElement.textContent).toEqual(ROWS[i].title);
            expect(rowSubtitles[i].nativeElement.textContent).toEqual(ROWS[i].subtitle);
        }
    });

    it('should display all row headers with the correct number of cells', () => {
        const rows = getRowHeaders();

        for (let i = 0; i < ROWS.length; i++) {
            const cells = rows[i].nativeElement.querySelectorAll('td');

            expect(cells.length).toBe(1);
            expect(cells[0].getAttribute('colspan')).toEqual(COLUMNS.length.toString());
            expect(cells[0].classList.contains('ss-ppc-grouped-table__cell--total')).toBeFalsy();
        }

        comp.showTotalsColumn = true;
        fixture.detectChanges();

        for (let i = 0; i < ROWS.length; i++) {
            const cells = rows[i].nativeElement.querySelectorAll('td');

            expect(cells.length).toBe(2);
            expect(cells[0].getAttribute('colspan')).toEqual((COLUMNS.length - 1).toString());
            expect(cells[0].classList.contains('ss-ppc-grouped-table__cell--total')).toBeFalsy();
            expect(cells[1].classList.contains('ss-ppc-grouped-table__cell--total')).toBeTruthy();
        }
    });

    it('should display all the cells with the correct classes', () => {
        const rows = getRows();

        for (let i = 0; i < ROWS.length; i++) {
            const cells = getCells(rows[i].nativeElement);
            for (let j = 0; j < COLUMNS.length; j++) {
                expect(cells[j].classList.contains('ss-ppc-grouped-table__cell--total')).toBeFalsy();
            }
        }

        comp.showTotalsColumn = true;
        fixture.detectChanges();

        for (let i = 0; i < ROWS.length; i++) {
            const cells = getCells(rows[i].nativeElement);
            for (let j = 0; j < COLUMNS.length; j++) {
                expect(cells[j].classList.contains('ss-ppc-grouped-table__cell--total')).toEqual(j === COLUMNS.length - 1);
            }
        }
    });
});
