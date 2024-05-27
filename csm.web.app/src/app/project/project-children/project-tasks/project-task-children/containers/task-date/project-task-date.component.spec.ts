/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {
    MOCK_TASK,
    MOCK_TASK_WITHOUT_SCHEDULE
} from '../../../../../../../test/mocks/tasks';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {ButtonLink} from '../../../../../../shared/ui/links/button-link/button-link.component';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {ProjectTaskCaptureFormInputEnum} from '../../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {TasksCalendarUrlQueryParamsEnum} from '../../../../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {Task} from '../../../../../project-common/models/tasks/task';
import {TasksCalendarFocusParams} from '../../../../../project-common/models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {ProjectUrlRetriever} from '../../../../../project-routing/helper/project-url-retriever';
import {ProjectTaskDateComponent} from './project-task-date.component';

describe('Project Task Date Component', () => {
    let component: ProjectTaskDateComponent;
    let fixture: ComponentFixture<ProjectTaskDateComponent>;
    let debugElement: DebugElement;
    let modalService: ModalService;
    let el: HTMLElement;

    const dataAutomationComponent = '[data-automation="ss-project-task-date"]';
    const dataAutomationButtonNavigateToCalendar = '[data-automation="navigate-to-calendar-button"]';
    const dataAutomationButtonNavigateWithinCalendar = '[data-automation="navigate-within-calendar-button"]';

    const getElement = (element: string): Element => el.querySelector(element);
    const getTaskModalData = (task: Task, inputFocus: ProjectTaskCaptureFormInputEnum = null): ModalInterface =>
        ({
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: task.id,
                [TasksCalendarUrlQueryParamsEnum.Focus]: inputFocus,
            },
        });

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            RouterTestingModule,
        ],
        declarations: [
            ProjectTaskDateComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskDateComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        el = debugElement.nativeElement;

        component.task = MOCK_TASK;

        modalService = TestBed.inject(ModalService);

        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('should call modal service open with the correct data', () => {
        const focusInput = ProjectTaskCaptureFormInputEnum.StartDate;
        const expectedFnArgs = getTaskModalData(MOCK_TASK, focusInput);

        spyOn(modalService, 'open');

        component.openModal(focusInput);

        expect(modalService.open).toHaveBeenCalledWith(expectedFnArgs);
    });

    it('should display the correct \'View in calendar\' button when task date range is defined and context is not calendar', () => {
        component.calendarContext = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationButtonNavigateToCalendar)).toBeDefined();
        expect(getElement(dataAutomationButtonNavigateWithinCalendar)).toBeNull();
    });

    it('should display the correct \'View in calendar\' button when task date range is defined and context is calendar', () => {
        component.calendarContext = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationButtonNavigateToCalendar)).toBeNull();
        expect(getElement(dataAutomationButtonNavigateWithinCalendar)).toBeDefined();
    });

    it('should not display \'View in calendar\' button when task schedule is not defined', () => {
        component.task = MOCK_TASK_WITHOUT_SCHEDULE;

        fixture.detectChanges();

        expect(getElement(dataAutomationButtonNavigateToCalendar)).toBeNull();
        expect(getElement(dataAutomationButtonNavigateWithinCalendar)).toBeNull();
    });

    it('should not display content if user does not have permissions do edit task and task schedule is not defined', () => {
        component.task = MOCK_TASK_WITHOUT_SCHEDULE;
        component.canAddTimeScope = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationComponent)).toBeNull();
    });

    it('should retrieve the correct button link data when getNavigateToCalendarLink is called', () => {
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Task, [MOCK_TASK.id]);
        const expectedResult: ButtonLink = {
            label: 'Generic_ViewInCalendar',
            routerLink: [ProjectUrlRetriever.getProjectCalendarUrl(MOCK_TASK.project.id)],
            queryParams: {
                [TasksCalendarUrlQueryParamsEnum.Focus]: focusParams.toString(),
            },
        };

        expect(component.getNavigateToCalendarLink()).toEqual(expectedResult);
    });

    it('should retrieve the correct button link data when getNavigateWithinCalendarLink is called', () => {
        const expectedLabel = 'Generic_ViewInCalendar';
        const buttonLink = component.getNavigateWithinCalendarLink();

        spyOn(component.navigateToTask, 'emit').and.callThrough();

        buttonLink.action();

        expect(buttonLink.label).toEqual(expectedLabel);
        expect(component.navigateToTask.emit).toHaveBeenCalled();
    });
});
