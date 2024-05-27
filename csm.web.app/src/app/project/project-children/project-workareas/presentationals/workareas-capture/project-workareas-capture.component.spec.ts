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
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {
    ProjectWorkareasCapture,
    ProjectWorkareasCaptureComponent
} from './project-workareas-capture.component';

describe('Project Workareas Capture Component', () => {
    let fixture: ComponentFixture<ProjectWorkareasCaptureComponent>;
    let comp: ProjectWorkareasCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const clickEvent: Event = new Event('click');

    const dataAutomationSelectorCancel = '[data-automation="cancel"]';
    const projectWorkareasCaptureValue: ProjectWorkareasCapture = {
        name: 'Foo',
        position: 1
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule
        ],
        declarations: [ProjectWorkareasCaptureComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectWorkareasCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        fixture.detectChanges();
        comp.ngOnInit();
    });

    it('should set craft capture form after ngOnInit()', () => {
        comp.form = null;
        comp.ngOnInit();
        expect(comp.form).toBeDefined();
    });

    it('should trigger onSubmit emit when form is submitted', () => {
        spyOn(comp.onSubmit, 'emit').and.callThrough();
        comp.handleSubmit();
        expect(comp.onSubmit.emit).toHaveBeenCalled();
    });

    it('should call handleCancel when clicking cancel', () => {
        spyOn(comp, 'handleCancel').and.callThrough();

        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should retrieve the position of the workarea with (.) in the end', () => {
        const expectedValue = '0.';

        comp.getPositionInEdit();
        expect(comp.getPositionInEdit()).toBe(expectedValue);
    });

    it('should setup form when resetForm() is triggered', () => {
        const workareaName = 'my workArea';

        comp.form.get('name').setValue(workareaName);

        expect(comp.form.get('name').value).toBe(workareaName);
        comp.resetForm();

        expect(comp.form.get('name').value).toBe('');
    });

    it('should call setFocus and focus input', () => {
        spyOn(comp, 'setFocus').and.callThrough();

        fixture.detectChanges();
        comp.setFocus();

        expect(comp.workareaInput.input.nativeElement.focus).toBeTruthy();
    });

    it('should retrieve the right submitKey depending on the edit mode', () => {
        comp.mode = CaptureModeEnum.update;
        let response = comp.submitKey;

        fixture.detectChanges();

        expect(response).toBe('Generic_Save');

        comp.mode = CaptureModeEnum.create;
        response = comp.submitKey;

        expect(response).toBe('Generic_Add');
    });

    it('should set up form if reset form is called and form is null', () => {
        comp.form = null;
        comp.resetForm();
        expect(comp.form).toBeDefined();
    });

    it('should set default values and not override the form value', () => {
        const defaultValues: ProjectWorkareasCapture = {
            name: 'Foo',
            position: 1
        };

        comp.defaultValues = projectWorkareasCaptureValue;
        expect(comp.form.value).toEqual(projectWorkareasCaptureValue);
        comp.form.get('position').setValue(2);

        comp.defaultValues = defaultValues;
        expect(comp.form.value).not.toEqual(defaultValues);
    });
});
