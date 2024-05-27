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

import {MOCK_TASK_2} from '../../../../../test/mocks/tasks';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper
} from '../../enums/task-status.enum';
import {ProjectTasksStatusLabelComponent} from './project-tasks-status-label.component';

describe('Project Task Status Label Component', () => {
    let fixture: ComponentFixture<ProjectTasksStatusLabelComponent>;
    let comp: ProjectTasksStatusLabelComponent;

    const labelDraft = TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.DRAFT);
    const labelOpen = TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN);
    const labelStarted = TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED);
    const labelClose = TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.CLOSED);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectTasksStatusLabelComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksStatusLabelComponent);
        comp = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should set label to "DRAFT" when status is draft', () => {
        comp.task = {
            ...MOCK_TASK_2,
            status: TaskStatusEnum.DRAFT,
        };

        expect(comp.label).toBe(labelDraft);
    });

    it('should set label to "OPEN" when status is draft', () => {
        comp.task = {
            ...MOCK_TASK_2,
            status: TaskStatusEnum.OPEN,
        };

        expect(comp.label).toBe(labelOpen);
    });

    it('should set label to "STARTED" when status is draft', () => {
        comp.task = {
            ...MOCK_TASK_2,
            status: TaskStatusEnum.STARTED,
        };

        expect(comp.label).toBe(labelStarted);
    });

    it('should set label to "CLOSED" when status is draft', () => {
        comp.task = {
            ...MOCK_TASK_2,
            status: TaskStatusEnum.CLOSED,
        };

        expect(comp.label).toBe(labelClose);
    });
});
