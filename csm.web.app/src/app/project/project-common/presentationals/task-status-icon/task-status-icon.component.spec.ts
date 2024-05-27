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
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {
    TASK_STATUS_ICON_ACCEPTED,
    TASK_STATUS_ICON_CLOSED,
    TASK_STATUS_ICON_DRAFT,
    TASK_STATUS_ICON_OPEN,
    TASK_STATUS_ICON_STARTED,
    TaskStatusIconComponent,
} from './task-status-icon.component';
import {TaskStatusIconTestComponent} from './task-status-icon.test.component';

describe('Task Status Icon Component', () => {
    let comp: TaskStatusIconComponent;
    let testHostComp: TaskStatusIconTestComponent;
    let fixture: ComponentFixture<TaskStatusIconTestComponent>;

    const taskStatusIconComponentSelector = 'ss-task-status-icon';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            TaskStatusIconComponent,
            TaskStatusIconTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskStatusIconTestComponent);
        testHostComp = fixture.componentInstance;
        comp = fixture.debugElement.query(By.css(taskStatusIconComponentSelector)).componentInstance;

        testHostComp.status = TaskStatusEnum.DRAFT;
        fixture.detectChanges();
    });

    it('should render icon with the right styles when status is draft', () => {
        testHostComp.status = TaskStatusEnum.DRAFT;
        fixture.detectChanges();

        expect(comp.iconName).toBe(TASK_STATUS_ICON_DRAFT);
        expect(comp.iconColor).toBe(COLORS.light_grey);
    });

    it('should render icon with the right styles when status is open', () => {
        testHostComp.status = TaskStatusEnum.OPEN;
        fixture.detectChanges();

        expect(comp.iconName).toBe(TASK_STATUS_ICON_OPEN);
        expect(comp.iconColor).toBe(COLORS.dark_grey_75);
    });

    it('should render icon with the right styles when status is started', () => {
        testHostComp.status = TaskStatusEnum.STARTED;
        fixture.detectChanges();

        expect(comp.iconName).toBe(TASK_STATUS_ICON_STARTED);
        expect(comp.iconColor).toBe(COLORS.dark_blue);
    });

    it('should render icon with the right styles when status is closed', () => {
        testHostComp.status = TaskStatusEnum.CLOSED;
        fixture.detectChanges();

        expect(comp.iconName).toBe(TASK_STATUS_ICON_CLOSED);
        expect(comp.iconColor).toBe(COLORS.light_green);
    });

    it('should render icon with the right styles when status is accepted', () => {
        testHostComp.status = TaskStatusEnum.ACCEPTED;
        fixture.detectChanges();

        expect(comp.iconName).toBe(TASK_STATUS_ICON_ACCEPTED);
        expect(comp.iconColor).toBe(COLORS.light_green);
    });
});
