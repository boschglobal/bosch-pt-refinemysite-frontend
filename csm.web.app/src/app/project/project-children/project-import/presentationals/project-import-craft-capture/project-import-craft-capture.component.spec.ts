/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';

import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {ProjectImportColumnResource} from '../../../../project-common/api/project-import/resources/project-import-column.resource';
import {
    ProjectImportCraftCapture,
    ProjectImportCraftCaptureComponent
} from './project-import-craft-capture.component';

describe('Project Import Craft Capture Component', () => {
    let component: ProjectImportCraftCaptureComponent;
    let fixture: ComponentFixture<ProjectImportCraftCaptureComponent>;

    const defaultValue: ProjectImportCraftCapture = {
        craftColumn: null,
    };

    const mockCraftColumn: ProjectImportColumnResource = {
        fieldType: 'foo',
        columnType: 'bar',
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectImportCraftCaptureComponent,
        ],
        providers: [],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportCraftCaptureComponent);
        component = fixture.componentInstance;

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

        component.form.get('craftColumn').setValue(mockCraftColumn);
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
        const newFormValue: ProjectImportCraftCapture = {
            craftColumn: mockCraftColumn,
        };

        component.form.get('craftColumn').setValue(mockCraftColumn);
        component.defaultValue = newFormValue;

        expect(component.form).toBe(currentFormGroup);
    });

    it('should emit valueChanged with craftColumn when craftColumn is set', () => {
        const expectedPayload: ProjectImportCraftCapture = {
            craftColumn: mockCraftColumn,
        };

        spyOn(component.valueChanged, 'emit');

        component.ngOnInit();
        component.form.get('craftColumn').setValue(mockCraftColumn);

        expect(component.valueChanged.emit).toHaveBeenCalledWith(expectedPayload);
    });
});
