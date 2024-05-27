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

import {ProjectPpcComponent} from './project-ppc.component';

describe('PPC component', () => {
    let comp: ProjectPpcComponent;
    let fixture: ComponentFixture<ProjectPpcComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ProjectPpcComponent
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectPpcComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();

    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });
});
