/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {StoreModule} from '@ngrx/store';

import {REDUCER} from '../../../../../../app.reducers';
import {ProjectTaskComponent} from './project-task.component';

describe('Project Participants Children Component', () => {
    let fixture: ComponentFixture<ProjectTaskComponent>;
    let comp: ProjectTaskComponent;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [StoreModule.forRoot(REDUCER, {})],
        declarations: [ProjectTaskComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });
});
