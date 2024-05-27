/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {FlyoutDirective} from '../../../../../../shared/ui/flyout/directive/flyout.directive';
import {ConstraintInfoHeaderComponent} from './constraint-info-header.component';
import {ConstraintInfoHeaderTestComponent} from './constraint-info-header.test.component';

describe('Constraint Info Header Component', () => {
    let fixture: ComponentFixture<ConstraintInfoHeaderTestComponent>;
    let testHostComp: ConstraintInfoHeaderTestComponent;

    const counterSelector = '[data-automation="constraint-info-header-counter"]';
    const tooltipButtonSelector = '[data-automation="constraint-info-header-tooltip-button"]';
    const tooltipContentSelector = '[data-automation="constraint-info-header-tooltip-content"]';

    const clickEvent: Event = new Event('click');

    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;
    const getTooltipContent = () => document.querySelector(tooltipContentSelector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            FlyoutDirective,
            ConstraintInfoHeaderComponent,
            ConstraintInfoHeaderTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConstraintInfoHeaderTestComponent);
        testHostComp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should change the counters when the values are changed', () => {
        const expectedInitialResult = 'Generic_Active: 0/0';
        const expectedEndResult = 'Generic_Active: 4/20';

        expect(getElement(counterSelector).innerText).toBe(expectedInitialResult);

        testHostComp.activeItems = 4;
        testHostComp.totalItems = 20;
        fixture.detectChanges();

        expect(getElement(counterSelector).innerText).toBe(expectedEndResult);
    });

    it('should show the tooltip content when user clicks in the tooltip button', () => {
        getElement(tooltipButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getTooltipContent()).toBeTruthy();
    });
});
