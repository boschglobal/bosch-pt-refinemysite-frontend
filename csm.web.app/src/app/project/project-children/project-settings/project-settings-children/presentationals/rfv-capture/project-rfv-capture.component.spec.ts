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
import {ProjectRfvCaptureComponent} from './project-rfv-capture.component';

describe('Project Rfv Capture Component', () => {
    let component: ProjectRfvCaptureComponent;
    let fixture: ComponentFixture<ProjectRfvCaptureComponent>;
    let el: HTMLElement;

    const defaultValue = '';
    const projectRfvCaptureEditClass = 'ss-project-rfv-capture--edit';

    const cancelButtonSelector = '[data-automation="cancel"]';
    const projectRfvCaptureSelector = '[data-automation="project-rfv-capture"]';
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
        declarations: [ProjectRfvCaptureComponent],
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
        fixture = TestBed.createComponent(ProjectRfvCaptureComponent);
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

    it('should allow to submit a rfv when the name is filled', () => {
        const rfvName = '123';
        spyOn(component.submitForm, 'emit').and.callThrough();

        component.form.get('name').setValue(rfvName);
        fixture.detectChanges();

        getElement(submitButtonSelector).click();
        fixture.detectChanges();

        expect(component.submitForm.emit).toHaveBeenCalledWith(rfvName);
    });

    it('should not allow to submit a rfv when the name is not filled', () => {
        spyOn(component.submitForm, 'emit').and.callThrough();

        getElement(submitButtonSelector).click();
        fixture.detectChanges();

        expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should emit cancelForm when cancel button is clicked', () => {
        spyOn(component.cancelForm, 'emit').and.callThrough();

        getElement(cancelButtonSelector).click();
        fixture.detectChanges();

        expect(component.cancelForm.emit).toHaveBeenCalled();
    });

    it('should change the rfv name input when the default value is provided', () => {
        const rfvName = '123';

        expect(component.form.get('name').value).toBe(defaultValue);

        component.defaultValue = rfvName;
        fixture.detectChanges();

        expect(component.form.get('name').value).toBe(rfvName);
    });

    it('should not add ss-project-rfv-capture--edit css class when the capture is in create mode', () => {
        expect(getElement(projectRfvCaptureSelector).classList.contains(projectRfvCaptureEditClass)).toBeFalsy();
    });

    it('should add ss-project-rfv-capture--edit css class when the capture is in edit mode', () => {
        component.mode = CaptureModeEnum.update;
        fixture.detectChanges();

        expect(getElement(projectRfvCaptureSelector).classList.contains(projectRfvCaptureEditClass)).toBeTruthy();
    });

    it('should show the Generic_Add label in the submit button when the capture is in create mode', () => {
        expect(getElement(submitButtonSelector).innerText).toBe('Generic_Add');
    });

    it('should show the Generic_Save label in the submit button when the capture is in edit mode', () => {
        component.mode = CaptureModeEnum.update;
        fixture.detectChanges();

        expect(getElement(submitButtonSelector).innerText).toBe('Generic_Save');
    });

    it('should call input setFocus when setFocus is called', () => {
        spyOn(component.rfvInput, 'setFocus');

        component.setFocus();

        expect(component.rfvInput.setFocus).toHaveBeenCalled();
    });

    it('should reset the form when resetForm is called and the form was already setup', () => {
        const rfvName = '123';

        component.form.get('name').setValue(rfvName);
        component.resetForm();

        expect(component.form.get('name').value).not.toBe(rfvName);
    });

    it('should not reset the form when resetForm is called and the form was noy yet setup', () => {
        component.form = null;
        component.resetForm();

        expect(component.form).toBeNull();
    });
});
