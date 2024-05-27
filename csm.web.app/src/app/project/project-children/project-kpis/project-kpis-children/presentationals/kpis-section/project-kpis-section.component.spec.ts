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

import {ProjectKpisSectionComponent} from './project-kpis-section.component';

describe('KPIs Section component', () => {
    let comp: ProjectKpisSectionComponent;
    let fixture: ComponentFixture<ProjectKpisSectionComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ProjectKpisSectionComponent
        ]
    };
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectKpisSectionComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();

    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });
});
