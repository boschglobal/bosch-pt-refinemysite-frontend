/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    Router,
    RouterModule
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';

import {REDUCER} from '../../../../../app.reducers';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTasksPaginationComponent} from './project-tasks-pagination.component';

describe('Project Tasks Pagination Component', () => {
    let fixture: ComponentFixture<ProjectTasksPaginationComponent>;
    let comp: ProjectTasksPaginationComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            StoreModule.forRoot(REDUCER),
            EffectsModule.forRoot([]),
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectTasksPaginationComponent,
        ],
        providers: [
            HttpClient,
            {
                provide: Router,
                useValue: RouterModule,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksPaginationComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should create setPageAction with ProjectTaskActions.Set.Page action', () => {
        const page = 3;
        const action = comp.setPageAction(page);
        const expectedAction = new ProjectTaskActions.Set.Page(page);

        expect(action).toEqual(expectedAction);
    });

    it('should create setItemsPerPageAction with ProjectTaskActions.Set.Items action', () => {
        const items = 10;
        const action = comp.setItemsPerPageAction(items);
        const expectedAction = new ProjectTaskActions.Set.Items(items);

        expect(action).toEqual(expectedAction);
    });
});
