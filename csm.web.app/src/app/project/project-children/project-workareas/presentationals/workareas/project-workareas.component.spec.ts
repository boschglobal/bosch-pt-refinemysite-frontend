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

import {SortableListComponent} from '../../../../../shared/ui/sortable-list/sortable-list.component';
import {ProjectWorkareasComponent} from './project-workareas.component';

describe('Project Workareas Component', () => {
    let component: ProjectWorkareasComponent;
    let fixture: ComponentFixture<ProjectWorkareasComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            SortableListComponent,
            ProjectWorkareasComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectWorkareasComponent);
        component = fixture.componentInstance;
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });
});
