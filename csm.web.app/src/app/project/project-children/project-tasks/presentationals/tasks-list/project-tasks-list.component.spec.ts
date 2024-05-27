/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {
    MOCK_TASK,
    MOCK_TASK_WITH_WORKAREA
} from '../../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../../test/mocks/workareas';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectTaskContentModel} from '../../containers/tasks-content/project-tasks-content.model';
import {ProjectTasksListComponent} from './project-tasks-list.component';

describe('Project Task List Component', () => {
    let fixture: ComponentFixture<ProjectTasksListComponent>;
    let comp: ProjectTasksListComponent;
    let de: DebugElement;

    const dataAutomationTaskDetailButton = '[data-automation="task-detail-button"]';
    const dataAutomationCollapsibleListArrow = '[data-automation^="ss-collapsible-list-arrow"]';
    const dataAutomationWorkArea = '[data-automation="tasks-list-work-area"]';
    const dataAutomationWorkAreaNews = '[data-automation="tasks-list-work-area-news"]';
    const clickEvent: Event = new Event('click');
    const resizeEvent: Event = new Event('resize');
    const initialInnerWidth: number = window.innerWidth;

    const getElement = (selector: string): HTMLElement => de.query((By.css(selector)))?.nativeElement;
    const getElements = (selector: string): HTMLElement[] => de.queryAll(By.css(selector)).map(item => item?.nativeElement);

    const mockedTaskContentModels: ProjectTaskContentModel[] = [
        ProjectTaskContentModel.fromTaskAndWorkAreaResource(MOCK_TASK),
        ProjectTaskContentModel.fromTaskAndWorkAreaResource(MOCK_TASK_WITH_WORKAREA, MOCK_WORKAREA_B),
    ];

    function updateWindowInnerWidth(width: number): void {
        Object.defineProperty(window, 'innerWidth', {
            get: () => width,
        });

        window.dispatchEvent(resizeEvent);
    }

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                },
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            HttpClient,
        ],
        declarations: [ProjectTasksListComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.tasks = mockedTaskContentModels;
        comp.isLoading = false;
        updateWindowInnerWidth(500);
        fixture.detectChanges();
    });

    afterAll(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should call onClickDetails() when clicking Detail Button', () => {

        spyOn(comp, 'onClickDetails').and.callThrough();
        const collapsibleListArrowElement: HTMLElement = getElement(dataAutomationCollapsibleListArrow);
        collapsibleListArrowElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        const taskDetailButtonElement: HTMLElement = getElement(dataAutomationTaskDetailButton);
        taskDetailButtonElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onClickDetails).toHaveBeenCalled();
    });

    it('should output emit onClickTask() when clicking Detail Button', () => {

        spyOn(comp.onClickTask, 'emit').and.callThrough();
        const collapsibleListArrowElement: HTMLElement = getElement(dataAutomationCollapsibleListArrow);
        collapsibleListArrowElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        const taskDetailButtonElement: HTMLElement = getElement(dataAutomationTaskDetailButton);
        taskDetailButtonElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onClickTask.emit).toHaveBeenCalled();
    });

    it('should not render work area label when task does not have a work area', () => {
        const taskWithoutWorkAreaIndex = 0;
        const workAreaRows = getElements(dataAutomationWorkAreaNews);
        expect(workAreaRows[taskWithoutWorkAreaIndex].querySelector(dataAutomationWorkArea)).toBeNull();
    });

    it('should render work area label when task has a work area', () => {
        const taskWithWorkAreaIndex = 1;
        const workAreaRows = getElements(dataAutomationWorkAreaNews);
        expect(workAreaRows[taskWithWorkAreaIndex].querySelector(dataAutomationWorkArea)).toBeDefined();
    });
});
