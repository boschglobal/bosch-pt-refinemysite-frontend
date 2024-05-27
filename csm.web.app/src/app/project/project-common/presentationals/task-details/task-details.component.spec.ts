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
import {By} from '@angular/platform-browser';
import {cloneDeep} from 'lodash';

import {
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2,
    MOCK_ATTACHMENT_3
} from '../../../../../test/mocks/attachments';
import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {TheaterService} from '../../../../shared/theater/api/theater.service';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../shared/ui/modal/containers/modal-component/modal.component';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../containers/tasks-capture/project-tasks-capture.component';
import {Task} from '../../models/tasks/task';
import {TaskDetailsComponent} from './task-details.component';
import {TaskDetailsTestComponent} from './task-details.test.component';

describe('Task Details Component', () => {
    let testHostComponent: TaskDetailsTestComponent;
    let component: TaskDetailsComponent;
    let de: DebugElement;
    let fixture: ComponentFixture<TaskDetailsTestComponent>;
    let modalService: jasmine.SpyObj<ModalService>;
    let theaterService: jasmine.SpyObj<TheaterService>;
    let task: Task;

    const taskDetailsComponentSelector = 'ss-task-details';
    const dataAutomationTaskDetailsSelector = '[data-automation="task-details"]';
    const dataAutomationAddDescriptionButtonSelector = '[data-automation="task-details-button-add-description"]';
    const dataAutomationTextImageArticleSelector = '[data-automation="task-details-text-image-article"]';

    const getElement = (selector): HTMLElement => de.query((By.css(selector)))?.nativeElement;
    const clickEvent: Event = new Event('click');

    const attachmentList = [
        MOCK_ATTACHMENT_1,
        MOCK_ATTACHMENT_2,
        MOCK_ATTACHMENT_3,
        MOCK_ATTACHMENT_1,
        MOCK_ATTACHMENT_2,
        MOCK_ATTACHMENT_3,
        MOCK_ATTACHMENT_3,
    ];

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TaskDetailsComponent,
            TaskDetailsTestComponent,
        ],
        providers: [
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
            },
            {
                provide: TheaterService,
                useValue: jasmine.createSpyObj('TheaterService', ['open']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDetailsTestComponent);
        testHostComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(taskDetailsComponentSelector));
        component = de.componentInstance;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        theaterService = TestBed.inject(TheaterService) as jasmine.SpyObj<TheaterService>;

        task = cloneDeep(MOCK_TASK);

        testHostComponent.task = task;
        testHostComponent.attachments = attachmentList;

        fixture.detectChanges();
    });

    it('should set canShowDetails to true and display task details when user has update permissions', () => {
        const updatedTask: Task = {...task, permissions: {...task.permissions, canUpdate: true}};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(component.canShowDetails).toBeTruthy();
        expect(getElement(dataAutomationTaskDetailsSelector)).toBeDefined();
    });

    it('should set canShowDetails to true and display task details when task has description', () => {
        const updatedTask: Task = {...task, description: 'foo'};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(component.canShowDetails).toBeTruthy();
        expect(getElement(dataAutomationTaskDetailsSelector)).toBeDefined();
    });

    it('should set canShowDetails to true and display task details when task has pictures', () => {
        const updatedAttachments: AttachmentResource[] = [MOCK_ATTACHMENT_1];

        testHostComponent.attachments = updatedAttachments;
        fixture.detectChanges();

        expect(component.canShowDetails).toBeTruthy();
        expect(getElement(dataAutomationTaskDetailsSelector)).toBeDefined();
    });

    it('should set canShowDetails to false and not display task details when user has no update permission, task has no description ' +
        'and pictures', () => {
        const updatedTask: Task = {...task, description: '', permissions: {...task.permissions, canUpdate: false}};
        const updatedAttachments: AttachmentResource[] = [];

        testHostComponent.task = updatedTask;
        testHostComponent.attachments = updatedAttachments;
        fixture.detectChanges();

        expect(component.canShowDetails).toBeFalsy();
        expect(getElement(dataAutomationTaskDetailsSelector)).toBeUndefined();
    });

    it('should display \'add description\' button when task has no description and user has update permission', () => {
        const updatedTask: Task = {...task, description: '', permissions: {...task.permissions, canUpdate: true}};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(getElement(dataAutomationAddDescriptionButtonSelector)).toBeDefined();
    });

    it('should not display \'add description\' button when task has no description and user has no update permissions', () => {
        const updatedTask: Task = {...task, description: '', permissions: {...task.permissions, canUpdate: false}};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(getElement(dataAutomationAddDescriptionButtonSelector)).toBeUndefined();
    });

    it('should not display \'add description\' button when task has description and user has update permissions', () => {
        const updatedTask: Task = {...task, description: 'foo', permissions: {...task.permissions, canUpdate: true}};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(getElement(dataAutomationAddDescriptionButtonSelector)).toBeUndefined();
    });

    it('should not display \'add description\' button when task has description and user has no update permissions', () => {
        const updatedTask: Task = {...task, description: 'foo', permissions: {...task.permissions, canUpdate: false}};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(getElement(dataAutomationAddDescriptionButtonSelector)).toBeUndefined();
    });

    it('should open task modal when user clicks on \'add description\' button', () => {
        const updatedTask: Task = {...task, description: '', permissions: {...task.permissions, canUpdate: true}};

        spyOn(component, 'openEditTaskModal');

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        getElement(dataAutomationAddDescriptionButtonSelector).dispatchEvent(clickEvent);

        expect(component.openEditTaskModal).toHaveBeenCalled();
    });

    it('should call modal service open when openEditTaskModal is called', () => {
        const expectedResult: ModalInterface = {
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: task.id,
                focus: ProjectTaskCaptureFormInputEnum.Description,
            },
        };

        expect(modalService.open).not.toHaveBeenCalled();

        component.openEditTaskModal();

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should display text image article when task has description', () => {
        const updatedTask: Task = {...task, description: 'foo'};

        testHostComponent.task = updatedTask;
        fixture.detectChanges();

        expect(getElement(dataAutomationTextImageArticleSelector)).toBeDefined();
    });

    it('should display text image article when task has pictures', () => {
        const updatedAttachments: AttachmentResource[] = [MOCK_ATTACHMENT_1];

        testHostComponent.attachments = updatedAttachments;
        fixture.detectChanges();

        expect(getElement(dataAutomationTextImageArticleSelector)).toBeDefined();
    });

    it('should display text image article when task has description and pictures', () => {
        const updatedTask: Task = {...task, description: 'foo'};
        const updatedAttachments: AttachmentResource[] = [MOCK_ATTACHMENT_1];

        testHostComponent.task = updatedTask;
        testHostComponent.attachments = updatedAttachments;
        fixture.detectChanges();

        expect(getElement(dataAutomationTextImageArticleSelector)).toBeDefined();
    });

    it('should not display text image article when task has no description and no pictures', () => {
        const updatedTask: Task = {...task, description: ''};
        const updatedAttachments: AttachmentResource[] = [];

        testHostComponent.task = updatedTask;
        testHostComponent.attachments = updatedAttachments;
        fixture.detectChanges();

        expect(getElement(dataAutomationTextImageArticleSelector)).toBeUndefined();
    });

    it('should validate that open theater is called when openTheater function is called', () => {
        const index = 0;
        const expectedResult = [component.attachments, component.attachments[index].id];

        component.openTheater(index.toString());
        expect(theaterService.open).toHaveBeenCalledWith(...expectedResult);
    });
});
