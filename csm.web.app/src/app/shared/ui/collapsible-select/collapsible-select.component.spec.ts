/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */
import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {TranslationModule} from '../../translation/translation.module';
import {CheckboxButtonComponent} from '../forms/checkbox-button/checkbox-button.component';
import {CollapsibleSelectComponent} from './collapsible-select.component';
import {CollapsibleSelectTestComponent} from './collapsible-select.test.component';

describe('Collapsible Select Component', () => {
    let component: CollapsibleSelectComponent;
    let testComponent: CollapsibleSelectTestComponent;
    let fixture: ComponentFixture<CollapsibleSelectTestComponent>;
    let de: DebugElement;

    const query = (selector: string): DebugElement => de.query(By.css(selector));

    const dataAutomationCollapsibleSelect = '[data-automation="collapsible-select"]';
    const dataAutomationToggleSectionButton = '[data-automation="button-toggle-section"]';
    const dataAutomationTopCheckbox = '[data-automation="top-checkbox"]';

    const clickEvent = new Event('click');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            imports: [TranslationModule.forRoot()],
            declarations: [
                CheckboxButtonComponent,
                CollapsibleSelectTestComponent,
                CollapsibleSelectComponent,
            ],
        })
            .compileComponents();

        fixture = TestBed.createComponent(CollapsibleSelectTestComponent);
        de = fixture.debugElement;
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        component = query(dataAutomationCollapsibleSelect).componentInstance;
    });

    it('should expand the section on click on the toggle section button and apply the aria-expanded attribute accordingly', () => {
        const toggleButton = query(dataAutomationToggleSectionButton).nativeElement;
        spyOn(component, 'toggleSection').and.callThrough();
        spyOn(component.clickExpandButton, 'emit');

        toggleButton.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.toggleSection).toHaveBeenCalled();
        expect(component.clickExpandButton.emit).toHaveBeenCalledWith(true);
        expect(component.expanded).toBeTruthy();
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('true');
    });

    it('should collapse the section on click at the toggle section button', () => {
        const toggleButton = query(dataAutomationToggleSectionButton).nativeElement;
        spyOn(component, 'toggleSection').and.callThrough();
        spyOn(component.clickExpandButton, 'emit');
        component.expanded = true;
        fixture.detectChanges();

        toggleButton.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.toggleSection).toHaveBeenCalled();
        expect(component.clickExpandButton.emit).toHaveBeenCalledWith(false);
        expect(component.expanded).toBeFalsy();
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false');
    });

    it('should emit the selectAll output when checking the checkbox', () => {
        const topCheckbox = query(dataAutomationTopCheckbox).nativeElement;

        spyOn(component, 'handleClickCheckbox').and.callThrough();
        spyOn(component.selectAll, 'emit').and.callThrough();
        spyOn(testComponent, 'handleSelectAll').and.callThrough();
        fixture.detectChanges();

        topCheckbox.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleClickCheckbox).toHaveBeenCalled();
        expect(component.selectAll.emit).toHaveBeenCalled();
        expect(testComponent.handleSelectAll).toHaveBeenCalled();
    });

    it('should emit the deselectAll output when unchecking the checkbox', () => {
        const topCheckbox = query(dataAutomationTopCheckbox).nativeElement;

        component.value = true;
        spyOn(component, 'handleClickCheckbox').and.callThrough();
        spyOn(component.deselectAll, 'emit').and.callThrough();
        spyOn(testComponent, 'handleDeselectAll').and.callThrough();
        fixture.detectChanges();

        topCheckbox.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleClickCheckbox).toHaveBeenCalled();
        expect(component.deselectAll.emit).toHaveBeenCalled();
        expect(testComponent.handleDeselectAll).toHaveBeenCalled();
    });
});
