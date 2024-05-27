/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {ReplaySubject} from 'rxjs';

import {MOCK_TASK} from '../../../../../../../test/mocks/tasks';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {Task} from '../../../../../project-common/models/tasks/task';
import {ProjectTaskActions} from '../../../../../project-common/store/tasks/task.actions';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {
    REQUEST_TOPICS_LIMIT,
    TaskDrawerTopicsComponent,
} from './task-drawer-topics.component';
import {TaskDrawerTopicsTestComponent} from './task-drawer-topics.test.component';

describe('Task Drawer Topics Component', () => {
    let comp: TaskDrawerTopicsComponent;
    let testHostComp: TaskDrawerTopicsTestComponent;
    let fixture: ComponentFixture<TaskDrawerTopicsTestComponent>;
    let store: jasmine.SpyObj<Store>;
    let modalService: jasmine.SpyObj<ModalService>;
    let actions: ReplaySubject<any>;

    const taskWithTopics = MOCK_TASK;
    const taskWithoutTopics: Task = {
        ...MOCK_TASK,
        statistics: {
            criticalTopics: 0,
            uncriticalTopics: 0,
        },
    };

    const clickEvent: MouseEvent = new MouseEvent('click');
    const hostComponentSelector = 'ss-task-drawer-topics';
    const totalSelector = '[data-automation="ss-task-drawer-topics-total"]';
    const collapsedButtonSelector = '[data-automation="ss-task-drawer-topics-collapsed-button"]';
    const addButtonSelector = '[data-automation="ss-task-drawer-topics-add-button"]';
    const topicsListSelector = '[data-automation="ss-task-drawer-topics-list"]';

    const getElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TaskDrawerTopicsComponent,
            TaskDrawerTopicsTestComponent,
        ],
        providers: [
            provideMockActions(() => actions),
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDrawerTopicsTestComponent);
        testHostComp = fixture.componentInstance;
        comp = fixture.debugElement.query(By.css(hostComponentSelector)).componentInstance;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        actions = new ReplaySubject(1);

        testHostComp.task = taskWithTopics;
        fixture.detectChanges();

        store.dispatch.calls.reset();
    });

    it('should dispatch a TopicActions.Initialize.All action when the component inits', () => {
        const action = new TopicActions.Initialize.All();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch a TopicActions.Request.All action when the component inits', () => {
        const action = new TopicActions.Request.All(null, REQUEST_TOPICS_LIMIT, taskWithTopics.id);

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should show the number of topics when it is greater than 0', () => {
        testHostComp.task = taskWithTopics;
        fixture.detectChanges();

        expect(getElement(totalSelector)).toBeTruthy();
    });

    it('should not show the number of topics when it is 0', () => {
        testHostComp.task = taskWithoutTopics;
        fixture.detectChanges();

        expect(getElement(totalSelector)).toBeFalsy();
    });

    it('should show the collapsed button when the number of topics is greater than 0', () => {
        testHostComp.task = taskWithTopics;
        fixture.detectChanges();

        expect(getElement(collapsedButtonSelector)).toBeTruthy();
    });

    it('should not show the collapsed button when the number of topics is 0', () => {
        testHostComp.task = taskWithoutTopics;
        fixture.detectChanges();

        expect(getElement(collapsedButtonSelector)).toBeFalsy();
    });

    it('should rotate the arrow icon when the collapsed button is clicked', () => {
        const collapsedRotation = 270;
        const expandedRotation = 90;

        expect(comp.arrowIconRotation).toBe(expandedRotation);

        getElement(collapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.arrowIconRotation).toBe(collapsedRotation);

        getElement(collapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.arrowIconRotation).toBe(expandedRotation);
    });

    it('should toggle the topics list visibility when collapse button is clicked', () => {
        expect(getElement(topicsListSelector).nativeElement.hidden).toBeFalsy();

        getElement(collapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(topicsListSelector).nativeElement.hidden).toBeTruthy();
    });

    it('should open the CreateTopic modal when the add button is clicked', () => {
        const expectedPayload: ModalInterface = {
            id: ModalIdEnum.CreateTopic,
            data: {
                taskId: taskWithTopics.id,
            },
        };

        getElement(addButtonSelector).nativeElement.dispatchEvent(clickEvent);

        expect(modalService.open).toHaveBeenCalledWith(expectedPayload);
    });

    it('should dispatch a ProjectTaskActions.Request.One action when a new topic is created successfully', () => {
        const expectedAction = new ProjectTaskActions.Request.One(taskWithTopics.id);

        actions.next(new TopicActions.Create.OneFulfilled('foo'));

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not dispatch a ProjectTaskActions.Request.One action when a new topic failed to be created', () => {
        const expectedAction = new ProjectTaskActions.Request.One(taskWithTopics.id);

        actions.next(new TopicActions.Create.OneRejected());

        expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch a ProjectTaskActions.Request.One action when a new topic is deleted successfully', () => {
        const expectedAction = new ProjectTaskActions.Request.One(taskWithTopics.id);

        actions.next(new TopicActions.Delete.OneFulfilled('foo'));

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch a ProjectTaskActions.Request.One action when the criticality of a topic change', () => {
        const expectedAction = new ProjectTaskActions.Request.One(taskWithTopics.id);

        actions.next(new TopicActions.Update.CriticalityFulfilled(null));

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
