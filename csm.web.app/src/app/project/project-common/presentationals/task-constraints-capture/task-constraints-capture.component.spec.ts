/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION
} from '../../../../../test/mocks/constraints';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {CalloutComponent} from '../../../../shared/alert/presentationals/callout/callout.component';
import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {CheckboxButtonComponent} from '../../../../shared/ui/forms/checkbox-button/checkbox-button.component';
import {InputPictureComponent} from '../../../../shared/ui/forms/input-picture/input-picture.component';
import {
    ConstraintKey,
    ConstraintResource
} from '../../api/constraints/resources/constraint.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {TaskConstraintsCaptureComponent} from './task-constraints-capture.component';

describe('TasksConstraintsCaptureComponent', () => {
    let comp: TaskConstraintsCaptureComponent;
    let fixture: ComponentFixture<TaskConstraintsCaptureComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const disabledConstraintsWarningSelector = '[data-automation="constraint-disabled-warning"]';

    const getElement = (selector: string) => el.querySelector((selector));

    const mockConstraintList: ConstraintResource[] = [
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION,
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION,
    ];
    const mockConstraintEntityList: ConstraintEntity[] =
        mockConstraintList.map(constraint => ConstraintEntity.fromConstraintResource(constraint));

    const taskConstraints: NamedEnumReference<ConstraintKey>[] = [{key: 'INFORMATION', name: 'INFORMATION'}];

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            CheckboxButtonComponent,
            InputPictureComponent,
            TaskConstraintsCaptureComponent,
            CalloutComponent,
        ],
        providers: [
            UntypedFormBuilder,
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
        fixture = TestBed.createComponent(TaskConstraintsCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.projectActiveConstraints = mockConstraintEntityList;
        comp.mismatchedConstraints = '';

        fixture.detectChanges();
    });

    it('should setup the form controls correctly', () => {
        comp.ngOnInit();
        fixture.detectChanges();

        const formGroup = comp.form.get('constraints') as UntypedFormGroup;

        expect(formGroup.contains('INFORMATION')).toBeTruthy();
        expect(formGroup.contains('RESOURCES')).toBeTruthy();
        expect(comp.mismatchedConstraints).toBeFalsy();
    });

    it('should trigger close event on handleCancel being called', () => {
        spyOn(comp.closeCapture, 'emit').and.callThrough();
        comp.handleCancel();
        fixture.detectChanges();
        expect(comp.closeCapture.emit).toHaveBeenCalled();
    });

    it('should set form data when the listConstraints has data', () => {
        const expectedResult = {
            [MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION.key]: false,
            [MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION.key]: false,
        };

        comp.ngOnInit();

        expect(comp.form.controls.constraints).toBeDefined();
        expect(comp.form.controls.constraints.value).toEqual(expectedResult);
    });

    it('should set form data when the listConstraints has data and set the constraint as checked', () => {
        comp.taskConstraints = taskConstraints;
        comp.ngOnInit();
        fixture.detectChanges();

        expect(comp.form.controls.constraints).toBeDefined();
        expect(JSON.stringify(comp.form.controls.constraints.value)).toBe(JSON.stringify({
            [MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION.key]: true,
            [MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION.key]: false,
        }));
    });

    it('should submit values that are set as checked', () => {
        comp.taskConstraints = taskConstraints;
        comp.ngOnInit();
        fixture.detectChanges();
        spyOn(comp.submitCapture, 'emit').and.callThrough();

        comp.onSubmitForm();
        fixture.detectChanges();
        expect(comp.submitCapture.emit).toHaveBeenCalledWith([mockConstraintEntityList[0].key]);
    });

    it('should show warning if hasMismatch is true', () => {
        comp.mismatchedConstraints = '';
        comp.taskConstraints = taskConstraints;
        fixture.detectChanges();

        expect(getElement(disabledConstraintsWarningSelector)).toBeNull();

        comp.mismatchedConstraints = 'mismatch1, mismatch2';
        comp.ngOnInit();
        fixture.detectChanges();

        expect(getElement(disabledConstraintsWarningSelector)).not.toBeNull();
        spyOn(comp.submitCapture, 'emit').and.callThrough();
    });

    it('should reset the form', () => {
        comp.taskConstraints = taskConstraints;
        comp.form.controls.constraints.markAsDirty();
        expect(comp.form.controls.constraints.pristine).toBeFalsy();

        const spyReset = spyOn(comp.form, 'reset');
        const spyValidity = spyOn(comp.form, 'updateValueAndValidity');

        comp.resetForm();
        expect(comp.form.controls.constraints.pristine).toBeTruthy();
        expect(spyReset).toHaveBeenCalled();
        expect(spyValidity).toHaveBeenCalled();
    });
});
