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
    waitForAsync
} from '@angular/core/testing';

import {
    BASE_BUTTON_CSS_CLASS,
    ButtonComponent
} from './button.component';

describe('Button Component', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [ButtonComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;

        component.buttonActive = false;
        component.buttonNoPadding = false;

        fixture.detectChanges();
    });

    it('should set the css classes depending on the button style', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--secondary-black`;

        component.buttonStyle = 'secondary-black';

        expect(component.class).toContain(expectedClass);
    });

    it('should set the css classes depending on the button size', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--large`;

        component.buttonSize = 'large';

        expect(component.class).toContain(expectedClass);
    });

    it('should add the active css class when button is active', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--active`;

        component.buttonActive = true;

        expect(component.class).toContain(expectedClass);
    });

    it('should not add the active css class when button is not active', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--active`;

        component.buttonActive = false;

        expect(component.class).not.toContain(expectedClass);
    });

    it('should add the circular css class when button is circular', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--circular`;

        component.buttonCircular = true;

        expect(component.class).toContain(expectedClass);
    });

    it('should not add the circular css class when button is not circular', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--circular`;

        component.buttonCircular = false;

        expect(component.class).not.toContain(expectedClass);
    });

    it('should add the no-padding css class when button has the no-padding flag as true', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--no-padding`;

        component.buttonNoPadding = true;

        expect(component.class).toContain(expectedClass);
    });

    it('should not add the no-padding css class when button has the no-padding flag as false', () => {
        const expectedClass = `${BASE_BUTTON_CSS_CLASS}--no-padding`;

        component.buttonNoPadding = false;

        expect(component.class).not.toContain(expectedClass);
    });
});
