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

import {ProjectCraftsComponent} from './project-crafts.component';

describe('Project Crafts Component', () => {
    let fixture: ComponentFixture<ProjectCraftsComponent>;
    let comp: ProjectCraftsComponent;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [ProjectCraftsComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectCraftsComponent);
        comp = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });
});
