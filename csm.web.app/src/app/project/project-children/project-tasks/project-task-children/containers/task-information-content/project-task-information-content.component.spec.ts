/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
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
import {Router} from '@angular/router';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {flatten} from 'lodash';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2,
    MOCK_ATTACHMENT_3
} from '../../../../../../../test/mocks/attachments';
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2
} from '../../../../../../../test/mocks/participants';
import {MockStore} from '../../../../../../../test/mocks/store';
import {
    MOCK_TASK,
    MOCK_TASK_WITH_WORKAREA
} from '../../../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../../../test/mocks/workareas';
import {RouterStub} from '../../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {
    REDUCER,
    State
} from '../../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {EllipsisPipe} from '../../../../../../shared/ui/pipes/ellipsis.pipe';
import {TextImageArticleComponent} from '../../../../../../shared/ui/text-image-article/text-image-article.component';
import {ThumbnailGalleryComponent} from '../../../../../../shared/ui/thumbnail-gallery-component/thumbnail-gallery.component';
import {ProjectParticipantResource} from '../../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {Task} from '../../../../../project-common/models/tasks/task';
import {AttachmentQueries} from '../../../../../project-common/store/attachments/attachment.queries';
import {ProjectParticipantQueries} from '../../../../../project-common/store/participants/project-participant.queries';
import {ProjectTaskActions} from '../../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../../project-common/store/tasks/task-queries';
import {WorkareaActions} from '../../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../../project-routing/helper/project-url-retriever';
import {
    DELETE_TASK_ITEM_ID,
    ProjectTaskInformationComponent,
} from './project-task-information-content.component';

describe('Project Task Information Content Component', () => {
    let fixture: ComponentFixture<ProjectTaskInformationComponent>;
    let comp: ProjectTaskInformationComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let modalService: ModalService;
    let router: Router;
    let store: Store<State>;
    let translateService: TranslateService;

    const dataAutomationEditSelector = '[data-automation="edit-pencil"]';
    const enLanguage = 'en';

    const attachmentList = [
        MOCK_ATTACHMENT_1,
        MOCK_ATTACHMENT_2,
        MOCK_ATTACHMENT_3,
        MOCK_ATTACHMENT_1,
        MOCK_ATTACHMENT_2,
        MOCK_ATTACHMENT_3,
        MOCK_ATTACHMENT_3,
    ];
    const task = Object.assign({}, MOCK_TASK_WITH_WORKAREA);
    const creator: ProjectParticipantResource = MOCK_PARTICIPANT;
    const assignee: ProjectParticipantResource = MOCK_PARTICIPANT;

    const projectTaskQueriesMock = mock(ProjectTaskQueries);
    const projectParticipantQueriesMock = mock(ProjectParticipantQueries);
    const attachmentQueriesMock = mock(AttachmentQueries);
    const workAreaQueriesMock = mock(WorkareaQueries);

    const clickEvent: Event = new Event('click');

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);
    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            HttpClientTestingModule,
            StoreModule.forRoot(REDUCER),
            TranslationModule.forRoot(),
        ],
        declarations: [
            EllipsisPipe,
            ProjectTaskInformationComponent,
            TextImageArticleComponent,
            ThumbnailGalleryComponent,
        ],
        providers: [
            HttpClient,
            {
                provide: AttachmentQueries,
                useValue: instance(attachmentQueriesMock),
            },
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useValue: instance(projectTaskQueriesMock),
            },
            {
                provide: WorkareaQueries,
                useValue: instance(workAreaQueriesMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskInformationComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        modalService = TestBed.inject(ModalService);
        translateService = TestBed.inject(TranslateService);

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(of(task));
        when(workAreaQueriesMock.observeWorkareaById(task.workArea.id)).thenReturn(of(MOCK_WORKAREA_B));
        when(projectTaskQueriesMock.observeCurrentTaskRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(projectParticipantQueriesMock.observeProjectParticipantById(task.creator.id)).thenReturn(of(creator));
        when(projectParticipantQueriesMock.observeProjectParticipantById(task.assignee.id)).thenReturn(of(assignee));
        when(attachmentQueriesMock.observeAttachments(ObjectTypeEnum.Task, task.id)).thenReturn(of(attachmentList));

        comp.ngOnInit();
        fixture.detectChanges();

        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        TestBed.inject(HttpTestingController);
    });

    afterAll(() => {
        translateService.setDefaultLang(enLanguage);
    });

    it('should call openModal when clicking edit', () => {
        spyOn(comp, 'openModal').and.callThrough();

        getElement(dataAutomationEditSelector).dispatchEvent(clickEvent);
        expect(comp.openModal).toHaveBeenCalled();
    });

    it('should close modal when modalClose is triggered', () => {
        spyOn(modalService, 'close');

        comp.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should call open on modalService with the right payload when openModal is called', () => {
        const focus = ProjectTaskCaptureFormInputEnum.Company;
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = {
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: MOCK_TASK_WITH_WORKAREA.id,
                focus,
            },
        };
        comp.openModal(focus);

        expect(modalService.open).toHaveBeenCalledWith(expectedResult);
    });

    it('should set correct options when user has permission delete task', () => {
        const observableOfTask = of(Object.assign({}, MOCK_TASK_WITH_WORKAREA, {
            permissions: Object.assign({}, MOCK_TASK_WITH_WORKAREA.permissions, {
                canDelete: true,
            }),
        }));

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(observableOfTask);

        comp.ngOnInit();

        expect(getDropdownItem(DELETE_TASK_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission delete task', () => {
        const observableOfTask = of(Object.assign({}, MOCK_TASK_WITH_WORKAREA, {
            permissions: Object.assign({}, MOCK_TASK_WITH_WORKAREA.permissions, {
                canDelete: false,
            }),
        }));

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(observableOfTask);

        comp.ngOnInit();

        expect(getDropdownItem(DELETE_TASK_ITEM_ID)).toBeFalsy();
    });

    it('should call open on modalService when _handleDelete is called and confirmCallback should dispatch right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const payload: string = task.id;
        const expectedResult = new ProjectTaskActions.Delete.One(payload);

        comp.handleDropdownItemClicked(getDropdownItem(DELETE_TASK_ITEM_ID));

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when _handleDelete is called and cancelCallback should dispatch right action', () => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new ProjectTaskActions.Delete.OneReset();

        comp.handleDropdownItemClicked(getDropdownItem(DELETE_TASK_ITEM_ID));

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when _handleDelete is called and completeCallback should navigate to task list', () => {
        spyOn(router, 'navigateByUrl').and.callThrough();
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = ProjectUrlRetriever.getProjectTasksUrl(task.project.id);

        comp.handleDropdownItemClicked(getDropdownItem(DELETE_TASK_ITEM_ID));

        modalService.currentModalData.completeCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedResult);
    });

    it('should not set assigneeParticipant or creatorParticipant when a given project participant is not valid', () => {
        const prevAssigneeParticipant = comp.assigneeParticipant;
        const prevCreatorParticipant = comp.creatorParticipant;

        when(projectParticipantQueriesMock.observeProjectParticipantById(task.creator.id)).thenReturn(of(null));
        when(projectParticipantQueriesMock.observeProjectParticipantById(task.assignee.id)).thenReturn(of(null));

        comp.ngOnInit();

        expect(comp.assigneeParticipant).toBe(prevAssigneeParticipant);
        expect(comp.creatorParticipant).toBe(prevCreatorParticipant);
    });

    it('should set assigneeParticipant or creatorParticipant when a given project participant is valid', () => {
        const nextAssigneeParticipant = MOCK_PARTICIPANT_2;
        const nextCreatorParticipant = MOCK_PARTICIPANT_2;

        when(projectParticipantQueriesMock.observeProjectParticipantById(task.creator.id)).thenReturn(of(nextCreatorParticipant));
        when(projectParticipantQueriesMock.observeProjectParticipantById(task.assignee.id)).thenReturn(of(nextAssigneeParticipant));

        comp.ngOnInit();

        expect(comp.assigneeParticipant.participantId).toEqual(nextAssigneeParticipant.id);
        expect(comp.creatorParticipant.participantId).toEqual(nextCreatorParticipant.id);
    });

    it('should not set task if currentTask is undefined', () => {
        const prevTask: Task = comp.task;

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(of(undefined));

        comp.ngOnInit();

        expect(comp.task).toBe(prevTask);
    });

    it('should set task if currentTask is valid', () => {
        const nextTask = Object.assign({}, task);

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(of(nextTask));

        comp.ngOnInit();

        expect(comp.task).toBe(nextTask);
    });

    it('should set workArea if task.workarea is set', () => {
        expect(comp.workArea).toBe(MOCK_WORKAREA_B);
    });

    it('should not set workArea if task.workarea is not set', () => {
        comp.workArea = undefined;

        when(projectTaskQueriesMock.observeCurrentTask()).thenReturn(of(MOCK_TASK));

        comp.ngOnInit();

        const {workArea} = comp.task;

        expect(workArea).toBeUndefined();
    });

    it('should dispatch WorkareaActions.Request.All on onInit', () => {
        spyOn(store, 'dispatch').and.callThrough();
        const expectedResult = new WorkareaActions.Request.All();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
