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
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {InputSelectDropdownComponent} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {RadioButtonComponent} from '../../../../../shared/ui/forms/radio-button/radio-button.component';
import {ProjectImportColumnResource} from '../../../../project-common/api/project-import/resources/project-import-column.resource';
import {
    ProjectImportWorkareaCapture,
    ProjectImportWorkareaCaptureComponent,
} from './project-import-workarea-capture.component';

describe('Project Import Workarea Capture Component', () => {
    let component: ProjectImportWorkareaCaptureComponent;
    let fixture: ComponentFixture<ProjectImportWorkareaCaptureComponent>;
    let de: DebugElement;

    const projectImportWorkeareaMapImageSelector = '[data-automation="project-import-workarea-map-image"]';
    const projectImportWorkeareaBreakdownImageSelector = '[data-automation="project-import-workarea-breakdown-image"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const defaultValue: ProjectImportWorkareaCapture = {
        readWorkAreasHierarchically: false,
        workAreaColumn: null,
    };
    const mockWorkAreaColumn: ProjectImportColumnResource = {
        fieldType: 'foo',
        columnType: 'bar',
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectImportWorkareaCaptureComponent,
            RadioButtonComponent,
            InputSelectDropdownComponent,
        ],
        providers: [],
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportWorkareaCaptureComponent);
        component = fixture.componentInstance;
        component.options = [];
        de = fixture.debugElement;

        component.ngOnInit();
    });

    it('should set the form after ngOnInit', () => {
        component.form = undefined;
        component.ngOnInit();

        expect(component.form).toBeDefined();
    });

    it('should set the form when defaultValue is provided', () => {
        component.form = undefined;
        component.defaultValue = defaultValue;

        expect(component.form).toBeDefined();
    });

    it('should set the form when defaultValue has a different value as the form', () => {
        const currentFormGroup = component.form;

        component.form.get('workAreaColumn').setValue(mockWorkAreaColumn);
        component.defaultValue = defaultValue;

        expect(component.form).not.toBe(currentFormGroup);
    });

    it('should not set the form when defaultValue is provided with nullish value', () => {
        const currentFormGroup = component.form;
        component.defaultValue = null;

        expect(component.form).toBe(currentFormGroup);
    });

    it('should not set the form when defaultValue has the same value as the form', () => {
        const currentFormGroup = component.form;
        const newFormValue: ProjectImportWorkareaCapture = {
            readWorkAreasHierarchically: false,
            workAreaColumn: mockWorkAreaColumn,
        };

        component.form.get('workAreaColumn').setValue(mockWorkAreaColumn);
        component.defaultValue = newFormValue;

        expect(component.form).toBe(currentFormGroup);
    });

    it('should change the form value when defaultValue is provided', () => {
        const newValue: ProjectImportWorkareaCapture = {
            readWorkAreasHierarchically: false,
            workAreaColumn: mockWorkAreaColumn,
        };

        component.defaultValue = newValue;

        expect(component.form.get('readWorkAreasHierarchically').value).toBe(newValue.readWorkAreasHierarchically);
        expect(component.form.get('workAreaColumn').value).toEqual(newValue.workAreaColumn);
    });

    it('should disable the dropdown input when readWorkAreasHierarchically is true', () => {
        component.form.get('readWorkAreasHierarchically').setValue(true);

        expect(component.form.get('workAreaColumn').disabled).toBeTruthy();
    });

    it('should enable the dropdown input when readWorkAreasHierarchically is false', () => {
        component.form.get('readWorkAreasHierarchically').setValue(false);

        expect(component.form.get('workAreaColumn').disabled).toBeFalsy();
    });

    it('should emit valueChanged with workAreaColumn when readWorkAreasHierarchically is false and workAreaColumn was set', () => {
        const expectedPayload: ProjectImportWorkareaCapture = {
            readWorkAreasHierarchically: false,
            workAreaColumn: mockWorkAreaColumn,
        };

        spyOn(component.valueChanged, 'emit');

        component.ngOnInit();
        component.form.get('workAreaColumn').setValue(mockWorkAreaColumn);
        component.form.get('readWorkAreasHierarchically').setValue(false);

        expect(component.valueChanged.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit valueChanged without workAreaColumn when readWorkAreasHierarchically is true and workAreaColumn was set', () => {
        const expectedPayload: ProjectImportWorkareaCapture = {
            readWorkAreasHierarchically: true,
        };

        spyOn(component.valueChanged, 'emit');

        component.ngOnInit();
        component.form.get('workAreaColumn').setValue(mockWorkAreaColumn);
        component.form.get('readWorkAreasHierarchically').setValue(true);

        expect(component.valueChanged.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit valueChanged with null workAreaColumn when readWorkAreasHierarchically is false and workAreaColumn ' +
        'was not set', () => {
        const expectedPayload: ProjectImportWorkareaCapture = {
            readWorkAreasHierarchically: false,
            workAreaColumn: null,
        };

        spyOn(component.valueChanged, 'emit');

        component.ngOnInit();
        component.form.get('workAreaColumn').setValue(null);
        component.form.get('readWorkAreasHierarchically').setValue(false);

        expect(component.valueChanged.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should show the correct image if the dropdown is not disabled', () => {
        component.ngOnInit();
        component.form.get('workAreaColumn').setValue(null);
        component.form.get('readWorkAreasHierarchically').setValue(false);

        expect(getElement(projectImportWorkeareaMapImageSelector)).toBeTruthy();
        expect(getElement(projectImportWorkeareaBreakdownImageSelector)).toBeFalsy();
    });

    it('should show the correct image if the dropdown is disabled', () => {
        component.ngOnInit();
        component.form.get('workAreaColumn').setValue(null);
        component.form.get('readWorkAreasHierarchically').setValue(true);

        expect(getElement(projectImportWorkeareaMapImageSelector)).toBeFalsy();
        expect(getElement(projectImportWorkeareaBreakdownImageSelector)).toBeTruthy();
    });
});
