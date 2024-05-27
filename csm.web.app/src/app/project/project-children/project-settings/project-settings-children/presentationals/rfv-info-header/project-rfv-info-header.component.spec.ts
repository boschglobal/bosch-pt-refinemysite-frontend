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
import {ProjectRfvInfoHeaderComponent} from './project-rfv-info-header.component';
import {ProjectRfvInfoHeaderTestComponent} from './project-rfv-info-header.test.component';

describe('Project Rfv Info Header Component', () => {
    let fixture: ComponentFixture<ProjectRfvInfoHeaderTestComponent>;
    let testHostComp: ProjectRfvInfoHeaderTestComponent;

    const counterSelector = '[data-automation="project-rfv-info-header-counter"]';
    const tooltipButtonSelector = '[data-automation="project-rfv-info-header-tooltip-button"]';
    const tooltipContentSelector = '[data-automation="project-rfv-info-header-tooltip-content"]';

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
            ProjectRfvInfoHeaderComponent,
            ProjectRfvInfoHeaderTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRfvInfoHeaderTestComponent);
        testHostComp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should change the counters when the values change', () => {
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
