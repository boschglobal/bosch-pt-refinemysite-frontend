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
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {configuration} from '../../../../../../configurations/configuration';
import {EnvironmentConfig} from '../../../../../../configurations/interfaces/environment-config.interface';
import {EnvironmentHelper} from '../../../../../shared/misc/helpers/environment.helper';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {
    ONE_MB_IN_BYTES,
    ProjectImportUploadCaptureComponent,
} from './project-import-upload-capture.component';

describe('Project Import Upload Capture Component', () => {
    let fixture: ComponentFixture<ProjectImportUploadCaptureComponent>;
    let comp: ProjectImportUploadCaptureComponent;

    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);
    const MOCK_FILE: File = new File([''], '');

    const moduleDef: TestModuleMetadata = {
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectImportUploadCaptureComponent,
        ],
        providers: [
            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelper),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportUploadCaptureComponent);
        comp = fixture.componentInstance;

        when(environmentHelper.getConfiguration()).thenReturn(configuration);

        fixture.detectChanges();
    });

    it('should emit the file when the form value changes', () => {
        spyOn(comp.fileChanged, 'emit').and.callThrough();
        comp.formGroup.get('file').setValue([MOCK_FILE]);
        fixture.detectChanges();

        expect(comp.fileChanged.emit).toHaveBeenCalledWith(MOCK_FILE);
    });

    it('should set maxFileSize and maxFileSizeInMb based on the environment configuration', () => {
        const expectedFileSizeInMb = 200;
        const expectedFileSize = expectedFileSizeInMb * ONE_MB_IN_BYTES;
        const newConfiguration: EnvironmentConfig = {
            ...configuration,
            projectImportMaxFileSize: expectedFileSizeInMb,
        };

        when(environmentHelper.getConfiguration()).thenReturn(newConfiguration);
        comp.ngOnInit();

        expect(comp.maxFileSize).toBe(expectedFileSize);
        expect(comp.maxFileSizeInMb).toBe(expectedFileSizeInMb);
    });
});
