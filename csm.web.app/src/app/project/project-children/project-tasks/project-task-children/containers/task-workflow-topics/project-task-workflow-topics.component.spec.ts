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
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_TOPIC_LIST} from '../../../../../../../test/mocks/task-topics';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../../../test/mocks/user';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveTopicResource} from '../../../../../project-common/api/topics/resources/save-topic.resource';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';
import {ProjectTaskWorkflowTopicsComponent} from './project-task-workflow-topics.component';

describe('Project Task Workflow Topics Component', () => {
    let fixture: ComponentFixture<ProjectTaskWorkflowTopicsComponent>;
    let comp: ProjectTaskWorkflowTopicsComponent;
    let el: HTMLElement;
    let store: jasmine.SpyObj<Store>;

    const topicQueriesMock: TopicQueries = mock(TopicQueries);
    const userQueriesMock: UserQueries = mock(UserQueries);

    const topics: TopicResource[] = MOCK_TOPIC_LIST.topics;

    const dataAutomationProjectTaskTopicListNoRecordsSelector = '[data-automation="project-task-workflow-topics-no-records"]';

    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ProjectTaskWorkflowTopicsComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TopicQueries,
                useValue: instance(topicQueriesMock),
            },
            {
                provide: UserQueries,
                useValue: instance(userQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskWorkflowTopicsComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement.nativeElement;

        when(topicQueriesMock.observeTopicsByTask()).thenReturn(of(topics));
        when(topicQueriesMock.observeTopicsByTaskRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(topicQueriesMock.observeCreateRequestStatus()).thenReturn(of(RequestStatusEnum.empty));
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(of(true));
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));

        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should render no records founds when hasTopics is false, isLoading is false and hasMoreItems is false', () => {
        when(topicQueriesMock.observeTopicsByTask()).thenReturn(of([]));
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(of(false));
        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationProjectTaskTopicListNoRecordsSelector)).toBeTruthy();
    });

    it('should not render no records founds when hasTopics is false, isLoading is false and hasMoreItems is true', () => {
        when(topicQueriesMock.observeTopicsByTask()).thenReturn(of([]));
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(of(true));
        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationProjectTaskTopicListNoRecordsSelector)).toBeFalsy();
    });

    it('should not render no records founds when hasTopics is true, isLoading is false and hasMoreItems is false', () => {
        when(topicQueriesMock.observeTopicsByTask()).thenReturn(of(topics));
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(of(false));
        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationProjectTaskTopicListNoRecordsSelector)).toBeFalsy();
    });

    it('should not render no records founds when hasTopics is false, isLoading is true and hasMoreItems is false', () => {
        when(topicQueriesMock.observeTopicsByTask()).thenReturn(of([]));
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(of(false));
        when(topicQueriesMock.observeTopicsByTaskRequestStatus()).thenReturn(of(RequestStatusEnum.progress));
        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationProjectTaskTopicListNoRecordsSelector)).toBeFalsy();
    });

    it('should dispatch TopicActions.Create.One when onSubmitCapture is called', () => {
        const saveTopicResource: SaveTopicResource = {
            description: '123',
            files: [new File([''], '')],
        };
        const action = new TopicActions.Create.One(saveTopicResource);

        comp.onSubmitCapture(saveTopicResource);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should trigger capture handleCancel() when topic request status is success', () => {
        comp.projectTaskTopicCapture = jasmine.createSpyObj('ProjectTaskTopicCaptureComponent', ['handleCancel']);

        when(topicQueriesMock.observeCreateRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        comp.ngOnInit();

        expect(comp.projectTaskTopicCapture.handleCancel).toHaveBeenCalled();
    });

    it('should set isCollapsed to false when the capture is focused', () => {
        comp.isCollapsed = true;

        comp.handleCaptureFocused();

        expect(comp.isCollapsed).toBe(false);
    });

    it('should set isCollapsed to true when the capture is canceled', () => {
        comp.isCollapsed = false;

        comp.handleCaptureCanceled();

        expect(comp.isCollapsed).toBe(true);
    });
});
