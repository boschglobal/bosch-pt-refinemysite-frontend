/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../configurations/configuration';
import {EnvironmentHelper} from '../../../shared/misc/helpers/environment.helper';
import {TranslationModule} from '../../../shared/translation/translation.module';
import {UIModule} from '../../../shared/ui/ui.module';
import {ProjectToolbarComponent} from './project-toolbar.component';

describe('ProjectToolbarComponent', () => {
    let component: ProjectToolbarComponent;
    let fixture: ComponentFixture<ProjectToolbarComponent>;
    let de: DebugElement;

    const dataAutomationCreateProjectSelector = '[data-automation="create-project"]';
    const dataAutomationDownloadTemplateSelector = '[data-automation="download-template"]';

    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectToolbarComponent,
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
        fixture = TestBed.createComponent(ProjectToolbarComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        when(environmentHelper.getConfiguration()).thenReturn(configuration);

        fixture.detectChanges();
    });

    it('should render create button if user has permission', () => {
        component.showCreateButton = true;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCreateProjectSelector))).not.toBeNull();
    });

    it('should not render create button if showCreateButton is false', () => {
        component.showCreateButton = false;
        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCreateProjectSelector))).toBeNull();
    });

    it('should render download button if there is an available link for the environment', () => {
        const configWithUrl = {...configuration, projectExportExcelTemplateUrl: 'export-url'};
        when(environmentHelper.getConfiguration()).thenReturn(configWithUrl);

        component.ngOnInit();

        fixture.detectChanges();

        expect(component.downloadProjectsExcelTemplateUrl).toBe(configWithUrl.projectExportExcelTemplateUrl);
        expect(de.query(By.css(dataAutomationDownloadTemplateSelector))).not.toBeNull();
    });

    it('should not render download button if there is not an available link for the environment', () => {
        const configWithoutUrl = {...configuration, projectExportExcelTemplateUrl: null};
        when(environmentHelper.getConfiguration()).thenReturn(configWithoutUrl);

        component.ngOnInit();

        fixture.detectChanges();

        expect(component.downloadProjectsExcelTemplateUrl).toBeNull();
        expect(de.query(By.css(dataAutomationDownloadTemplateSelector))).toBeNull();
    });
});
