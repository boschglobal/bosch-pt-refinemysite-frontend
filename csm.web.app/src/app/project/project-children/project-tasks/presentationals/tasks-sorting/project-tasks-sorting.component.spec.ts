/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {StoreModule} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {
    INITIAL_STATE,
    REDUCER
} from '../../../../../app.reducers';
import {MiscModule} from '../../../../../shared/misc/misc.module';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {ProjectTasksSortingComponent} from './project-tasks-sorting.component';

describe('Project Task Sorting Component', () => {
    let fixture: ComponentFixture<ProjectTasksSortingComponent>;
    let comp: ProjectTasksSortingComponent;

    const moduleDef: TestModuleMetadata = {
        imports: [
            MiscModule,
            StoreModule.forRoot(REDUCER, {initialState: INITIAL_STATE})
        ],
        declarations: [
            ProjectTasksSortingComponent
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            },
            {
                provide: ProjectTaskQueries,
                useClass: ProjectTaskQueries
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksSortingComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should emit event close when sort is cancelled', () => {
        spyOn(comp.close, 'emit');
        comp.handleCancel();
        expect(comp.close.emit).toHaveBeenCalled();
    });
});
