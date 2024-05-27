/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MOCK_PAT_RESOURCE} from '../../../../../../test/mocks/pat';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {PATExpirationEnum} from '../../../../user-common/enums/patExpiration.enum';
import {
    PAT_FORM_DEFAULT_VALUE,
    PatCaptureComponent,
    PATFormData
} from './pat-capture.component';

describe('Pat Capture Component', () => {
    let component: PatCaptureComponent;
    let fixture: ComponentFixture<PatCaptureComponent>;
    let el: HTMLElement;

    const submitButtonSelector = '[data-automation="submit"]';

    const getElement = (selector: string): HTMLElement => el.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            PatCaptureComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatCaptureComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement.nativeElement;

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('it should set PAT form with the correct default values', () => {
        expect(component.form.value).toEqual(PAT_FORM_DEFAULT_VALUE);
    });

    it('should set a new form value when PAT input is provided', () => {
        const validDefaultValues: PATFormData = {
            description: MOCK_PAT_RESOURCE.description,
            expiresAt: null,
            scope: MOCK_PAT_RESOURCE.scopes,
        };

        component.defaultValue = validDefaultValues;

        expect(component.form.value).toEqual(validDefaultValues);
    });

    it('should trigger canceled emit when handleCancel is called', () => {
        spyOn(component.canceled, 'emit').and.callThrough();

        component.handleCancel();

        expect(component.canceled.emit).toHaveBeenCalled();
    });

    it('should trigger submitted emit when handleSubmit is called', () => {
        const defaultValue: PATFormData = {
            description: MOCK_PAT_RESOURCE.description,
            expiresAt: PATExpirationEnum.ThirtyDays,
            scope: MOCK_PAT_RESOURCE.scopes,
        };

        spyOn(component.submitted, 'emit').and.callThrough();

        component.defaultValue = defaultValue;
        component.handleSubmit();

        expect(component.submitted.emit).toHaveBeenCalledWith(defaultValue);
    });

    it('should show submit button enabled when the form status changed to valid values', () => {
        component.defaultValue = {
            description: 'test',
            expiresAt: PATExpirationEnum.ThirtyDays,
            scope: MOCK_PAT_RESOURCE.scopes,
        };

        expect(getElement(submitButtonSelector).outerHTML.includes('disabled')).toBeFalsy();
    });

    it('should show submit button disabled when the form status changed to invalid values', () => {
        component.defaultValue = null;

        expect(getElement(submitButtonSelector).outerHTML.includes('disabled')).toBeTruthy();
    });

    it(`should set submit button label with 'Generic_Create' when mode is provided with ${CaptureModeEnum.create}`, () => {
        component.mode = CaptureModeEnum.create;

        expect(component.submitButtonLabel).toBe('Generic_Create');
    });

    it(`should set submit button label with 'Generic_Update' when mode is provided with ${CaptureModeEnum.update}`, () => {
        component.mode = CaptureModeEnum.update;

        expect(component.submitButtonLabel).toBe('Generic_Update');
    });

    it('should call the name input setFocus when set a form', () => {
        spyOn(component.nameInput, 'setFocus');

        component.ngOnInit();

        expect(component.nameInput.setFocus).toHaveBeenCalled();
    });
});
