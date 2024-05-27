/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {
    of,
    Subject
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_ATTACHMENT_1} from '../../../../../../test/mocks/attachments';
import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    MOCK_TASK,
    MOCK_TASK_NOT_ASSIGNED,
    MOCK_TASK_NOT_ASSIGNED_WITH_WA,
    MOCK_TASK_WITH_WORKAREA
} from '../../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectListIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {
    DRAWER_DATA,
    DrawerService
} from '../../../../../shared/ui/drawer/api/drawer.service';
import {DrawerModule} from '../../../../../shared/ui/drawer/drawer.module';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {AttachmentResource} from '../../../../project-common/api/attachments/resources/attachment.resource';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {ProjectTaskCardAssigneeModel} from '../../../../project-common/presentationals/project-tasks-card-assignee.model';
import {
    AttachmentActions,
    RequestAllAttachmentsPayload
} from '../../../../project-common/store/attachments/attachment.actions';
import {AttachmentQueries} from '../../../../project-common/store/attachments/attachment.queries';
import {CalendarScopeActions} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {NewsActions} from '../../../../project-common/store/news/news.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {
    DELETE_TASK_ITEM_ID,
    TasksDetailDrawerComponent,
} from './tasks-detail-drawer.component';

describe('Task Detail Drawer Component', () => {
    let component: TasksDetailDrawerComponent;
    let fixture: ComponentFixture<TasksDetailDrawerComponent>;
    let de: DebugElement;
    let modalService: ModalService;
    let drawerService: any;
    let store: Store<State>;

    const attachmentQueriesMock = mock(AttachmentQueries);
    const projectParticipantQueriesMock = mock(ProjectParticipantQueries);
    const projectTaskQueriesMock = mock(ProjectTaskQueries);
    const workAreaQueriesMock = mock(WorkareaQueries);

    const attachmentsSubject = new Subject<AttachmentResource[]>();

    const dataAutomationTaskDetailDrawerSelector = '[data-automation="tasks-detail-drawer"]';
    const dataAutomationTaskDetailDrawerCloseSelector = '[data-automation="tasks-detail-drawer-close"]';
    const dataAutomationTaskDetailDrawerUpdateSelector = '[data-automation="tasks-detail-drawer-update"]';
    const deleteTaskItem: MenuItem = {
        id: DELETE_TASK_ITEM_ID,
        label: 'Task_Delete_Label',
        type: 'button',
    };

    const getElement = (selector: string) => de.query(By.css(selector))?.nativeElement || null;
    const getDeleteDropdownItem = (): MenuItem =>
        flatten(component.dropdownItems.map(({items}) => items)).find(item => item.id === DELETE_TASK_ITEM_ID);

    const getMockAssignee = () => {
        const emptyParticipant = new ProjectParticipantResource();
        const {id, project, permissions} = MOCK_TASK_NOT_ASSIGNED;
        return new ProjectTaskCardAssigneeModel(
            id,
            project.id,
            false,
            emptyParticipant.user,
            emptyParticipant.company,
            TaskStatusEnum.OPEN,
            permissions.canAssign,
            permissions.canSend,
            emptyParticipant.id,
            emptyParticipant.email,
            emptyParticipant.phoneNumbers);
    };

    const clickEvent = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            DrawerModule,
            TranslateModule,
        ],
        declarations: [
            TasksDetailDrawerComponent,
        ],
        providers: [
            {
                provide: AttachmentQueries,
                useValue: instance(attachmentQueriesMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },
            {
                provide: WorkareaQueries,
                useValue: instance(workAreaQueriesMock),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: DrawerService,
                useValue: jasmine.createSpyObj('DrawerService', ['close']),
            },
            {
                provide: DRAWER_DATA,
                useValue: MOCK_TASK_WITH_WORKAREA.id,
            },
        ],
    };

    const task = Object.assign({}, MOCK_TASK_WITH_WORKAREA);
    const assignee: ProjectParticipantResource = MOCK_PARTICIPANT;
    const creator: ProjectParticipantResource = MOCK_PARTICIPANT;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksDetailDrawerComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        when(projectParticipantQueriesMock.observeProjectParticipantById(task.assignee.id)).thenReturn(of(assignee));
        when(projectParticipantQueriesMock.observeProjectParticipantById(task.creator.id)).thenReturn(of(creator));

        modalService = TestBed.inject(ModalService);
        drawerService = TestBed.inject(DrawerService);

        when(workAreaQueriesMock.observeWorkareaById(anything())).thenReturn(of(anything()));
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_WITH_WORKAREA.id)).thenReturn(of(MOCK_TASK_WITH_WORKAREA));
        when(attachmentQueriesMock.observeAttachments(ObjectTypeEnum.Task, MOCK_TASK_WITH_WORKAREA.id, false))
            .thenReturn(attachmentsSubject);

        store = TestBed.inject(Store);
        fixture.detectChanges();
    });

    it('should not render drawer if task is not defined', () => {
        component.task = undefined;

        fixture.detectChanges();

        expect(getElement(dataAutomationTaskDetailDrawerSelector)).toBeNull();
    });

    it('should render drawer if task is defined', () => {
        component.task = MOCK_TASK_WITH_WORKAREA;

        fixture.detectChanges();

        expect(getElement(dataAutomationTaskDetailDrawerSelector)).toBeTruthy();
    });

    it('should set workArea if task.workarea is set', () => {
        when(workAreaQueriesMock.observeWorkareaById(MOCK_TASK_WITH_WORKAREA.workArea.id)).thenReturn(of(MOCK_WORKAREA_B));

        component.ngOnInit();

        expect(component.workArea).toBe(MOCK_WORKAREA_B);
    });

    it('should not set workArea if task.workarea is not set', () => {
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK.id)).thenReturn(of(MOCK_TASK));

        component.ngOnInit();

        const {workArea} = component.task;

        expect(workArea).toBeUndefined();
    });

    it('should call close function when close button is clicked', () => {
        getElement(dataAutomationTaskDetailDrawerCloseSelector).dispatchEvent(clickEvent);

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should not show update button when without update permission', () => {
        component.task = Object.assign({}, MOCK_TASK_WITH_WORKAREA, {
            permissions: {
                ...MOCK_TASK_WITH_WORKAREA.permissions,
                canUpdate: false,
            },
        });

        fixture.detectChanges();

        expect(getElement(dataAutomationTaskDetailDrawerUpdateSelector)).toBeFalsy();
    });

    it('should open modal with the correct parameters', () => {
        expect(getElement(dataAutomationTaskDetailDrawerUpdateSelector)).toBeTruthy();
        spyOn(modalService, 'open');
        spyOn(store, 'dispatch');
        component.openModal();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Set.Current(MOCK_TASK_WITH_WORKAREA.id));
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: MOCK_TASK_WITH_WORKAREA.id,
                focus: null,
            },
        });
    });

    it('should not show delete option when task doesn\'t have delete permission', () => {
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_WITH_WORKAREA.id)).thenReturn(of(Object.assign({}, MOCK_TASK_WITH_WORKAREA, {
            permissions: {
                ...MOCK_TASK_WITH_WORKAREA.permissions,
                canDelete: false,
            },
        })));

        component.ngOnInit();

        expect(getDeleteDropdownItem()).toBeFalsy();
    });

    it('should show delete option when task has delete permission', () => {
        expect(getDeleteDropdownItem()).toBeTruthy();
    });

    it('should show delete modal when delete option is clicked', () => {
        spyOn(modalService, 'open');

        component.handleDropdownItemClicked(deleteTaskItem);

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should delete task when confirm delete button is clicked', () => {
        let modelOpenParams;
        spyOn(modalService, 'open').and.callFake(params => modelOpenParams = params);
        spyOn(store, 'dispatch');

        component.handleDropdownItemClicked(deleteTaskItem);
        modelOpenParams.data.confirmCallback();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Delete.One(MOCK_TASK_WITH_WORKAREA.id));
    });

    it('should not delete task when cancel delete button is clicked', () => {
        let modelOpenParams;
        spyOn(modalService, 'open').and.callFake(params => modelOpenParams = params);
        spyOn(store, 'dispatch');

        component.handleDropdownItemClicked(deleteTaskItem);
        modelOpenParams.data.cancelCallback();

        expect(store.dispatch).toHaveBeenCalledWith(new ProjectTaskActions.Delete.OneReset());
    });

    it('should have the correct task detail link in component', () => {
        expect(component.taskLink.routerLink).toEqual([ProjectUrlRetriever
            .getProjectTaskDetailUrl(MOCK_TASK_WITH_WORKAREA.project.id, MOCK_TASK_WITH_WORKAREA.id), {
            outlets: {
                'task-detail': 'information',
                'task-workflow': 'topics',
            },
        }]);
    });

    it('should open a modal with focus', () => {
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_WITH_WORKAREA.id)).thenReturn(of(MOCK_TASK_WITH_WORKAREA));
        spyOn(modalService, 'open').and.callFake(() => {
        });
        const focus = ProjectTaskCaptureFormInputEnum.Company;
        component.openModal(focus);
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: MOCK_TASK_WITH_WORKAREA.id,
                focus,
            },
        });
    });

    it('should check if default assignee is set if task is not assigned', () => {
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK_WITH_WORKAREA.id)).thenReturn(of(MOCK_TASK_NOT_ASSIGNED_WITH_WA));
        when(projectParticipantQueriesMock.observeProjectParticipantById(MOCK_TASK_NOT_ASSIGNED_WITH_WA.creator.id))
            .thenReturn(of(creator));

        component.ngOnInit();
        expect(component.assigneeParticipant).toEqual(getMockAssignee());
    });

    it('should call close function after confirm delete', () => {
        let modelOpenParams;
        spyOn(modalService, 'open').and.callFake(params => modelOpenParams = params);

        component.handleDropdownItemClicked(deleteTaskItem);
        modelOpenParams.data.confirmCallback();

        expect(drawerService.close).toHaveBeenCalled();
    });

    it('should dispatch CalendarScopeActions.Resolve.NavigateToElement action when handleNavigateToTask is called', () => {
        const taskObject = new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_WITH_WORKAREA.id);
        const expectedResult = new CalendarScopeActions.Resolve.NavigateToElement(taskObject);

        spyOn(store, 'dispatch').and.callThrough();

        component.handleNavigateToTask();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch action AttachmentActions.Request.AllByTask when the task is set on the component', () => {
        const payload: RequestAllAttachmentsPayload = {
            objectIdentifier: new ObjectListIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_WITH_WORKAREA.id, false),
            includeChildren: false,
        };
        const expectResult = new AttachmentActions.Request.AllByTask(payload);

        spyOn(store, 'dispatch');

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectResult);
    });

    it('should set attachments with the correct attachments data', () => {
        const attachments = [MOCK_ATTACHMENT_1];

        attachmentsSubject.next(attachments);

        component.ngOnInit();

        expect(component.attachments).toBe(attachments);
    });

    it('should dispatch action NewsActions.Delete.News when the task drawer is destroyed', () => {
        const payload: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK.id);
        const expectResult: NewsActions.Delete.News = new NewsActions.Delete.News(payload);

        spyOn(store, 'dispatch');

        component.ngOnInit();
        component.ngOnDestroy();

        expect(store.dispatch).toHaveBeenCalledWith(expectResult);
    });
});
