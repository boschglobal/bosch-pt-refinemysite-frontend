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

import {ProjectTasksComponent} from './project-tasks.component';

describe('Project Tasks Component', () => {
    let fixture: ComponentFixture<ProjectTasksComponent>;
    let comp: ProjectTasksComponent;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [ProjectTasksComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });
});
