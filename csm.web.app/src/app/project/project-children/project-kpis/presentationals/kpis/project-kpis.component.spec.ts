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
import {RouterTestingModule} from '@angular/router/testing';

import {ProjectKpisComponent} from './project-kpis.component';

describe('KPIs component', () => {
    let comp: ProjectKpisComponent;
    let fixture: ComponentFixture<ProjectKpisComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            RouterTestingModule,
        ],
        declarations: [
            ProjectKpisComponent,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectKpisComponent);
        comp = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

});
