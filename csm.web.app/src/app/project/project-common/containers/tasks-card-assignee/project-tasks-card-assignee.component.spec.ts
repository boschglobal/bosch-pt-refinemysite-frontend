/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {of} from 'rxjs';

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_PARSED_TASKS} from '../../../../../test/mocks/tasks';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {BlobService} from '../../../../shared/rest/services/blob.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../project-routing/project-route.paths';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {ProjectTaskCardAssigneeModel} from '../../presentationals/project-tasks-card-assignee.model';
import {ProjectTasksCardAssigneeComponent} from './project-tasks-card-assignee.component';

describe('Project Task Card Assignee Component', () => {
    let fixture: ComponentFixture<ProjectTasksCardAssigneeComponent>;
    let comp: ProjectTasksCardAssigneeComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let router: Router;
    let activatedRoute: ActivatedRoute;

    const dataAutomationCardUserSelector = '[data-automation="card-user"]';
    const dataAutomationCardSendSelector = '[data-automation="card-send"]';
    const dataAutomationCardAssignSelector = '[data-automation="card-assign"]';
    const dataAutomationCardNotAssignedSelector = '[data-automation="card-not-assigned"]';
    const projectId = MOCK_PARSED_TASKS[0].company.projectId;
    const assigneeId = MOCK_PARSED_TASKS[0].company.assignee.id;
    const taskCardAssignee: ProjectTaskCardAssigneeModel =
        new ProjectTaskCardAssigneeModel(
            MOCK_PARSED_TASKS[0].company.taskId,
            MOCK_PARSED_TASKS[0].company.projectId,
            MOCK_PARSED_TASKS[0].company.assigned,
            MOCK_PARSED_TASKS[0].company.assignee,
            MOCK_PARSED_TASKS[0].company.company,
            MOCK_PARSED_TASKS[0].company.status,
            true,
            true,
            MOCK_PARSED_TASKS[0].company.assignee.id,
            '',
            MOCK_PARSED_TASKS[0].company.phoneNumbers);
    const taskCardAssigneeWithoutPhone: ProjectTaskCardAssigneeModel =
        new ProjectTaskCardAssigneeModel(
            MOCK_PARSED_TASKS[0].company.taskId,
            MOCK_PARSED_TASKS[0].company.projectId,
            MOCK_PARSED_TASKS[0].company.assigned,
            MOCK_PARSED_TASKS[0].company.assignee,
            MOCK_PARSED_TASKS[0].company.company,
            MOCK_PARSED_TASKS[0].company.status,
            true,
            true,
            MOCK_PARSED_TASKS[0].company.assignee.id);

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslateModule,
        ],
        declarations: [ProjectTasksCardAssigneeComponent],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: ROUTE_PARAM_PROJECT_ID,
                                    paramMap: {
                                        get: () => projectId,
                                    },
                                }],
                            },
                        },
                    },
                    snapshot: {
                        parent: {
                            paramMap: {
                                get: () => projectId,
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectTaskSlice: {
                                assignList: new AbstractSelectionList(),
                            },
                        },
                    }
                ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksCardAssigneeComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        comp.projectTaskCardAssigneeModel = Object.assign({}, taskCardAssignee);
        fixture.detectChanges();
        activatedRoute = TestBed.inject(ActivatedRoute);
        router = TestBed.inject(Router);
    });

    it('should render Card User when task is assigned and sent', () => {
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.OPEN;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardUserSelector));
        expect(cardDebugElement).not.toBeNull();
    });

    it('should render Card User when task is assigned, not sent and user hasn\'t permission to send it', () => {
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.canBeSent = false;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.DRAFT;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardUserSelector));
        expect(cardDebugElement).not.toBeNull();
    });

    it('should render Card Send when task is assigned, not sent and user has permission to send it', () => {
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.canBeSent = true;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.DRAFT;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardSendSelector));
        expect(cardDebugElement).not.toBeNull();
    });

    it('should not render Card Send when task is assigned, not sent and user hasn\'t permission to send it', () => {
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.DRAFT;
        comp.projectTaskCardAssigneeModel.canBeSent = false;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardSendSelector));
        expect(cardDebugElement).toBeNull();
    });

    it('should render Card Assign when task is not assigned and user has permission to assign it', () => {
        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.projectTaskCardAssigneeModel.canBeAssigned = true;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardAssignSelector));
        expect(cardDebugElement).not.toBeNull();
    });

    it('should not render Card Assign when task is not assigned and user hasn\'t permission to assign it', () => {
        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.projectTaskCardAssigneeModel.canBeAssigned = false;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardAssignSelector));
        expect(cardDebugElement).toBeNull();
    });

    it('should render Card Not Assigned when task is not assigned and user cannot assign it', () => {
        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.projectTaskCardAssigneeModel.canBeAssigned = false;
        fixture.detectChanges();
        const cardDebugElement = de.query(By.css(dataAutomationCardNotAssignedSelector));
        expect(cardDebugElement).not.toBeNull();
    });

    it('should call handleAssign when clicking Card Assign', () => {
        spyOn(comp, 'handleAssign').and.callThrough();

        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.isSelecting = false;
        comp.enableFocus = false;
        fixture.detectChanges();

        de.query(By.css(dataAutomationCardAssignSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleAssign).toHaveBeenCalled();
    });

    it('should call handleAssign when clicking Card Assign  and return if isSelecting', () => {
        spyOn(comp, 'handleAssign').and.callThrough();

        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.isSelecting = true;
        fixture.detectChanges();

        de.query(By.css(dataAutomationCardAssignSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleAssign).toHaveBeenCalled();
    });

    it('should call handleSend when clicking Card Send', () => {
        spyOn(comp, 'handleSend').and.callThrough();

        comp.isSelecting = false;
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.DRAFT;

        fixture.detectChanges();

        de.query(By.css(dataAutomationCardSendSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleSend).toHaveBeenCalled();
    });

    it('should call handleSend when clicking Card Send and return if isSelecting', () => {
        spyOn(comp, 'handleSend').and.callThrough();

        comp.isSelecting = true;
        comp.projectTaskCardAssigneeModel.assigned = true;
        comp.projectTaskCardAssigneeModel.status = TaskStatusEnum.DRAFT;

        fixture.detectChanges();

        de.query(By.css(dataAutomationCardSendSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleSend).toHaveBeenCalled();
    });

    it('should call handleAssign and emit openCapture when clicking Card Assign', () => {
        spyOn(comp.openCapture, 'emit').and.callThrough();
        spyOn(comp, 'handleAssign').and.callThrough();

        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.isSelecting = false;
        comp.enableFocus = true;
        fixture.detectChanges();

        de.query(By.css(dataAutomationCardAssignSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleAssign).toHaveBeenCalled();
        expect(comp.openCapture.emit).toHaveBeenCalledWith(true);
    });

    it('should call handleAssign and do not openEditCapture when clicking Card Assign with taskInformation false', () => {
        comp.projectTaskCardAssigneeModel = taskCardAssigneeWithoutPhone;
        fixture.detectChanges();

        spyOn(router, 'navigateByUrl');
        spyOn(comp, 'handleAssign');

        comp.projectTaskCardAssigneeModel.assigned = false;
        comp.isSelecting = false;
        comp.enableFocus = false;
        fixture.detectChanges();

        de.query(By.css(dataAutomationCardAssignSelector)).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.handleAssign).toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should call navigateToUserProfile and get url for participant profile with projectId set', () => {
        const expectedResult = ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, assigneeId);

        comp.projectTaskCardAssigneeModel = taskCardAssigneeWithoutPhone;
        comp.projectTaskCardAssigneeModel.participantId = assigneeId;
        comp.projectTaskCardAssigneeModel.projectId = projectId;

        spyOn(router, 'navigateByUrl');
        fixture.detectChanges();

        comp.navigateToUserProfile(clickEvent);

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedResult);
    });

    it('should set the correct values for user and information card sizes for large input', () => {
        const expectedUserCardSize = 'large';
        const expectedInfoCardSize = 'normal';

        comp.size = 'large';
        fixture.detectChanges();

        expect(comp.userCardSize).toBe(expectedUserCardSize);
        expect(comp.informationCardSize).toBe(expectedInfoCardSize);
    });

    it('should set the correct values for user and information card sizes for normal input', () => {
        const expectedCardSize = 'normal';

        comp.size = 'normal';
        fixture.detectChanges();

        expect(comp.userCardSize).toBe(expectedCardSize);
        expect(comp.informationCardSize).toBe(expectedCardSize);
    });

    it('should set the correct values for user and information card sizes for small input', () => {
        const expectedCardSize = 'small';

        comp.size = 'small';
        fixture.detectChanges();

        expect(comp.userCardSize).toBe(expectedCardSize);
        expect(comp.informationCardSize).toBe(expectedCardSize);
    });
});
