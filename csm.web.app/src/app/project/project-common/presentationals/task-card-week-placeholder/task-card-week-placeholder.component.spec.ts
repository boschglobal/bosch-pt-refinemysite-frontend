/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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

import {TaskCardWeekPlaceholderComponent} from './task-card-week-placeholder.component';

describe('Task Card Week Placeholder Component', () => {
    let fixture: ComponentFixture<TaskCardWeekPlaceholderComponent>;
    let comp: TaskCardWeekPlaceholderComponent;

    const cardHeight = 50;
    const cardWidth = 280;
    const taskId = 'task-id';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [TaskCardWeekPlaceholderComponent],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskCardWeekPlaceholderComponent);
        comp = fixture.componentInstance;

        comp.taskId = taskId;
        comp.taskStyles = {
            'width.px': cardWidth,
            'height.px': cardHeight,
        };

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });
});
