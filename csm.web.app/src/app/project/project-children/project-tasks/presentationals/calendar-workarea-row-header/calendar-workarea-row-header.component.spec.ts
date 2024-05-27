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

import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {
    CalendarWorkareaRowHeaderComponent,
    CalendarWorkareaRowHeaderModel
} from './calendar-workarea-row-header.component';
import {CalendarWorkareaRowHeaderTestComponent} from './calendar-workarea-row-header.test.component';

describe('Calendar Workarea Row Header Component', () => {
    let testHostComp: CalendarWorkareaRowHeaderTestComponent;
    let fixture: ComponentFixture<CalendarWorkareaRowHeaderTestComponent>;
    let comp: CalendarWorkareaRowHeaderComponent;
    let de: DebugElement;

    const workarea: CalendarWorkareaRowHeaderModel = {
        id: '123',
        name: 'workarea',
        position: 1,
    };

    const calendarWorkareaRowHeaderComponentSelector = 'ss-calendar-workarea-row-header';
    const workareaTitleSelector = '[data-automation="ss-calendar-workarea-row-header-title"]';

    const getElement = (selector): HTMLElement => de.query((By.css(selector)))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [TranslationModule.forRoot()],
        declarations: [
            CalendarWorkareaRowHeaderTestComponent,
            CalendarWorkareaRowHeaderComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalendarWorkareaRowHeaderTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement;
        comp = de.query(By.css(calendarWorkareaRowHeaderComponentSelector)).componentInstance;

        testHostComp.workarea = workarea;
    });

    it('should show the title with position if available', () => {
        const expectedResultWithPosition = ` ${workarea.position}. ${workarea.name} `;

        fixture.detectChanges();

        expect(getElement(workareaTitleSelector).innerHTML).toBe(expectedResultWithPosition);
    });

    it('should show the title without position if workarea has none', () => {
        const expectedResultWithoutPosition = ` ${workarea.name} `;

        testHostComp.workarea = {
            ...workarea,
            position: undefined,
        };
        fixture.detectChanges();

        expect(getElement(workareaTitleSelector).innerHTML).toBe(expectedResultWithoutPosition);
    });
});
