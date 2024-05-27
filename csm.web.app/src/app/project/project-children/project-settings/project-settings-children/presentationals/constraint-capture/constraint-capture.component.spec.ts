/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {ConstraintCaptureComponent} from './constraint-capture.component';

describe('Constraint Capture Component', () => {
    let component: ConstraintCaptureComponent;
    let fixture: ComponentFixture<ConstraintCaptureComponent>;
    let el: HTMLElement;

    const defaultValue = '';
    const constraintCaptureEditClass = 'ss-constraint-capture--edit';

    const cancelButtonSelector = '[data-automation="cancel"]';
    const constraintCaptureSelector = '[data-automation="constraint-capture"]';
    const submitButtonSelector = '[data-automation="submit"]';

    const getElement = (selector: string): HTMLElement => el.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [ConstraintCaptureComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConstraintCaptureComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement.nativeElement;

        component.mode = CaptureModeEnum.create;
        component.defaultValue = defaultValue;
        fixture.detectChanges();
    });

    it('should set form after ngOnInit()', () => {
        component.form = null;
        component.ngOnInit();

        expect(component.form).toBeDefined();
    });

    it('should allow to submit a constraint when the name is filled', () => {
        const constraintName = '123';
        spyOn(component.submitForm, 'emit').and.callThrough();

        component.form.get('name').setValue(constraintName);
        fixture.detectChanges();

        getElement(submitButtonSelector).click();
        fixture.detectChanges();

        expect(component.submitForm.emit).toHaveBeenCalledWith(constraintName);
    });

    it('should not allow to submit a constraint when the name is not filled', () => {
        spyOn(component.submitForm, 'emit').and.callThrough();

        getElement(submitButtonSelector).click();
        fixture.detectChanges();

        expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should emit cancelForm when cancel btn is clicked', () => {
        spyOn(component.cancelForm, 'emit').and.callThrough();

        getElement(cancelButtonSelector).click();
        fixture.detectChanges();

        expect(component.cancelForm.emit).toHaveBeenCalled();
    });

    it('should change the constraint name input when the default value is provided', () => {
        const constraintName = '123';

        expect(component.form.get('name').value).toBe(defaultValue);

        component.defaultValue = constraintName;
        fixture.detectChanges();

        expect(component.form.get('name').value).toBe(constraintName);
    });

    it('should not add ss-constraint-capture--edit css class when the capture is in create mode', () => {
        expect(getElement(constraintCaptureSelector).classList.contains(constraintCaptureEditClass)).toBeFalsy();
    });

    it('should add ss-constraint-capture--edit css class when the capture is in edit mode', () => {
        component.mode = CaptureModeEnum.update;
        fixture.detectChanges();

        expect(getElement(constraintCaptureSelector).classList.contains(constraintCaptureEditClass)).toBeTruthy();
    });

    it('should show the Generic_Add label in the submit button when component is in create mode', () => {
        expect(getElement(submitButtonSelector).innerText).toBe('Generic_Add');
    });

    it('should show the Generic_Save label in the submit button when component is in edit mode', () => {
        component.mode = CaptureModeEnum.update;
        fixture.detectChanges();

        expect(getElement(submitButtonSelector).innerText).toBe('Generic_Save');
    });

    it('should call the inputs setFocus when setFocus is called', () => {
        spyOn(component.constraintInput, 'setFocus');

        component.setFocus();

        expect(component.constraintInput.setFocus).toHaveBeenCalled();
    });

    it('should reset the form when resetForm is called and form was already setup', () => {
        const constraintName = '123';

        component.form.get('name').setValue(constraintName);
        component.resetForm();

        expect(component.form.get('name').value).not.toBe(constraintName);
    });

    it('should not reset the form when resetForm is called and the form was not yet setup', () => {
        component.form = null;
        component.resetForm();

        expect(component.form).toBeNull();
    });
});
