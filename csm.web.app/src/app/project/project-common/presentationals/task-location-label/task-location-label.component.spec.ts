/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_D} from '../../../../../test/mocks/workareas';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../shared/ui/modal/containers/modal-component/modal.component';
import {ProjectTaskCaptureFormInputEnum} from '../../containers/tasks-capture/project-tasks-capture.component';
import {Task} from '../../models/tasks/task';
import {TaskLocationLabelComponent} from './task-location-label.component';

describe('Task Location Label Component', () => {
    let component: TaskLocationLabelComponent;
    let fixture: ComponentFixture<TaskLocationLabelComponent>;
    let de: DebugElement;
    let modalService: ModalService;

    const locationLabelSelector = '[data-automation="task-location-label"]';
    const locationLabelLocationSelector = '[data-automation="task-location-label-location"]';
    const locationLabelWorkAreaSelector = '[data-automation="task-location-label-workarea"]';
    const locationLabelButtonSelector = '[data-automation="task-location-label-button"]';

    const clickEvent: Event = new Event('click');

    const taskWithLocation: Task = {
        ...MOCK_TASK, ...{
            location: 'Foo',
            workArea: null,
        },
    };

    const taskWithWorkArea: Task = {
        ...MOCK_TASK, ...{
            location: null,
            workArea: new ResourceReference('bar', 'Bar'),
        },
    };

    const taskWithWorkAreaAndLocation: Task = {
        ...MOCK_TASK, ...{
            location: 'Foo',
            workArea: new ResourceReference('bar', 'Bar'),
        },
    };

    const taskWithoutUpdatePermission: Task = {
        ...MOCK_TASK, ...{
            location: null,
            workArea: null,
            permissions: {
                ...MOCK_TASK.permissions,
                canUpdate: false,
            },
        },
    };

    const taskWithUpdatePermission: Task = {
        ...MOCK_TASK, ...{
            location: null,
            workArea: null,
            permissions: {
                ...MOCK_TASK.permissions,
                canUpdate: true,
            },
        },
    };

    const moduleDef = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TaskLocationLabelComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskLocationLabelComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        modalService = TestBed.inject(ModalService);

        component.task = MOCK_TASK;
        fixture.detectChanges();
    });

    it('should render location when only location is set', () => {
        const expectedResult = taskWithLocation.location;

        component.task = taskWithLocation;
        fixture.detectChanges();

        expect(de.query(By.css(locationLabelLocationSelector)).nativeElement.textContent.trim()).toBe(expectedResult);
        expect(de.query(By.css(locationLabelWorkAreaSelector))).toBeNull();
    });

    it('should render workarea when only task.workarea and workArea are set', () => {
        component.task = taskWithWorkArea;
        component.workArea = MOCK_WORKAREA_D;

        const expectedResult = `${component.workArea.position}. ${component.workArea.name}`;
        fixture.detectChanges();

        expect(de.query(By.css(locationLabelWorkAreaSelector)).nativeElement.textContent.trim()).toBe(expectedResult);
        expect(de.query(By.css(locationLabelLocationSelector))).toBeNull();
    });

    it('should not render workarea when workArea is not set', () => {
        component.workArea = undefined;

        fixture.detectChanges();

        expect(de.query(By.css(locationLabelWorkAreaSelector))).toBeNull();
    });

    it('should not render workarea when only workArea is set and ask.workarea is not set', () => {
        component.task = taskWithWorkArea;

        fixture.detectChanges();

        expect(de.query(By.css(locationLabelWorkAreaSelector))).toBeNull();
    });

    it('should render both workarea and location when both are set', () => {
        const expectedLocation = taskWithWorkAreaAndLocation.location;

        component.task = taskWithWorkArea;
        component.workArea = MOCK_WORKAREA_D;

        const expectedResult = `${component.workArea.position}. ${component.workArea.name}`;

        component.task = taskWithWorkAreaAndLocation;
        fixture.detectChanges();

        expect(de.query(By.css(locationLabelLocationSelector)).nativeElement.textContent.trim()).toBe(expectedLocation);
        expect(de.query(By.css(locationLabelWorkAreaSelector)).nativeElement.textContent.trim()).toBe(expectedResult);
    });

    it('should render call for action button when workarea and location are not set and user has permission to update the task', () => {
        component.task = taskWithUpdatePermission;
        fixture.detectChanges();

        expect(de.query(By.css(locationLabelButtonSelector))).toBeTruthy();
    });

    it('should not render the whole label when workarea and location are not set and user doesn\'t have permission to ' +
        'update the task', () => {
        component.task = taskWithoutUpdatePermission;
        fixture.detectChanges();

        expect(de.query(By.css(locationLabelSelector))).toBeFalsy();
    });

    it('should open task edit modal with focus on workarea field when call for action button is clicked', () => {
        const expectedResult: ModalInterface = {
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: taskWithUpdatePermission.id,
                focus: ProjectTaskCaptureFormInputEnum.Workarea,
            },
        };

        spyOn(modalService, 'open').and.callThrough();

        component.task = taskWithUpdatePermission;
        fixture.detectChanges();

        de.query(By.css(locationLabelButtonSelector)).nativeElement.dispatchEvent(clickEvent);

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });
});
