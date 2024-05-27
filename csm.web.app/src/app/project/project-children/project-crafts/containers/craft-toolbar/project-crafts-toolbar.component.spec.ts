/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {UntypedFormBuilder} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectCraftQueries} from '../../../../project-common/store/crafts/project-craft.queries';
import {ProjectCraftsToolbarComponent} from './project-crafts-toolbar.component';

describe('Project Crafts Toolbar Component', () => {
    let fixture: ComponentFixture<ProjectCraftsToolbarComponent>;
    let comp: ProjectCraftsToolbarComponent;
    let de: DebugElement;

    const craftCreateSelector = '[data-automation="project-craft-create"]';
    const createCraftButtonSelector = '[data-automation="create-craft-button"]';

    const mockProjectCraftQueries: ProjectCraftQueries = mock(ProjectCraftQueries);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectCraftsToolbarComponent,
        ],
        providers: [
            UntypedFormBuilder,
            {
                provide: ProjectCraftQueries,
                useFactory: () => instance(mockProjectCraftQueries),
            },
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
        fixture = TestBed.createComponent(ProjectCraftsToolbarComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        when(mockProjectCraftQueries.observeCreateProjectCraftPermission()).thenReturn(of(true));
    });

    it('should handle toggle create craft', () => {
        comp.showCreateCraft = false;

        expect(de.query(By.css(craftCreateSelector))).toBeNull();
        comp.toggleCreateCraft();
        fixture.detectChanges();

        expect(comp.showCreateCraft).toBeTruthy();
        expect(de.query(By.css(craftCreateSelector))).not.toBeNull();
    });

    it('should render create button if user has permission', () => {
        comp.showCreateCraft = true;
        fixture.detectChanges();

        expect(de.query(By.css(createCraftButtonSelector))).not.toBeNull();
    });

    it('should not render create button if user has no permission', () => {
        when(mockProjectCraftQueries.observeCreateProjectCraftPermission()).thenReturn(of(false));
        comp.ngOnInit();
        fixture.detectChanges();

        expect(de.query(By.css(createCraftButtonSelector))).toBeNull();
    });
});
