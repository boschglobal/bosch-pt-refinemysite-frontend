/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectWorkareasToolbarComponent} from './project-workareas-toolbar.component';

describe('Project Workareas Toolbar Component', () => {
    let fixture: ComponentFixture<ProjectWorkareasToolbarComponent>;
    let comp: ProjectWorkareasToolbarComponent;
    let de: DebugElement;

    const workareaCreateSelector = '[data-automation="project-workarea-create"]';
    const createButtonSelector = '[data-automation="create-workarea-button"]';

    const mockProjectCraftQueries: WorkareaQueries = mock(WorkareaQueries);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectWorkareasToolbarComponent,
        ],
        providers: [
            {
                provide: WorkareaQueries,
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
        fixture = TestBed.createComponent(ProjectWorkareasToolbarComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        when(mockProjectCraftQueries.observeCreateWorkareaPermission()).thenReturn(of(true));
    });

    it('should handle toggle create', () => {
        comp.showCreateWorkarea = false;

        expect(de.query(By.css(workareaCreateSelector))).toBeNull();
        comp.toggleCreateWorkarea();
        fixture.detectChanges();

        expect(comp.toggleCreateWorkarea).toBeTruthy();
        expect(de.query(By.css(workareaCreateSelector))).not.toBeNull();
    });

    it('should render create button if user has permission', () => {
        comp.hasCreatePermission = true;
        fixture.detectChanges();

        expect(de.query(By.css(createButtonSelector))).not.toBeNull();
    });

    it('should not render create button if user has no permission to create', () => {
        when(mockProjectCraftQueries.observeCreateWorkareaPermission()).thenReturn(of(false));
        fixture.detectChanges();

        expect(de.query(By.css(createButtonSelector))).toBeNull();
    });
});
