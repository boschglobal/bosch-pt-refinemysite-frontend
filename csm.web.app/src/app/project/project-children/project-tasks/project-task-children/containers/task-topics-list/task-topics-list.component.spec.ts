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
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    BehaviorSubject,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_TOPIC_LIST} from '../../../../../../../test/mocks/task-topics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {NewsResource} from '../../../../../project-common/api/news/resources/news.resource';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {TopicCriticalityEnum} from '../../../../../project-common/enums/topic-criticality.enum';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {TopicQueries} from '../../../../../project-common/store/topics/topic.queries';
import {CriticalityChange} from '../../presentationals/task-topic-card/project-task-topic-card.component';
import {
    LOAD_MORE_TOPICS_LIMIT,
    TaskTopicsListComponent,
} from './task-topics-list.component';

describe('Task Topics List Component', () => {
    let fixture: ComponentFixture<TaskTopicsListComponent>;
    let comp: TaskTopicsListComponent;
    let de: DebugElement;
    let store: jasmine.SpyObj<Store>;
    let modalService: ModalService;

    const newsQueriesMock: NewsQueries = mock(NewsQueries);
    const topicQueriesMock: TopicQueries = mock(TopicQueries);

    const taskId = 'foo';
    const topics: TopicResource[] = MOCK_TOPIC_LIST.topics;
    const topicId = topics[0].id;
    const mockCriticalityChange: CriticalityChange = {
        id: 'foo',
        criticality: TopicCriticalityEnum.CRITICAL,
    };

    const taskTopicsListCardSelector = '[data-automation="task-topics-list-card"]';
    const taskTopicsListLoadMoreSelector = '[data-automation="task-topics-list-load-more"]';
    const taskTopicsListLoaderSelector = '[data-automation="task-topics-list-loader"]';
    const taskTopicsListShowMoreLoaderSelector = '[data-automation="task-topics-list-show-more-loader"]';

    const hasMoreItemsSubject = new Subject<boolean>();
    const newsSubject = new BehaviorSubject<NewsResource[]>([]);
    const topicsSubject = new BehaviorSubject<TopicResource[]>(topics);
    const topicsRequestStatusSubject = new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;
    const getAllElements = (selector: string): DebugElement[] => de.queryAll(By.css(selector));

    const eventClick: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TaskTopicsListComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: NewsQueries,
                useValue: instance(newsQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TopicQueries,
                useValue: instance(topicQueriesMock),
            },

        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskTopicsListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(topicQueriesMock.observeTopicsByTask()).thenReturn(topicsSubject);
        when(topicQueriesMock.observeTopicsByTaskRequestStatus()).thenReturn(topicsRequestStatusSubject);
        when(topicQueriesMock.observeTopicsByTaskHasMoreItems()).thenReturn(hasMoreItemsSubject);
        when(newsQueriesMock.observeAllItems()).thenReturn(newsSubject);

        comp.taskId = taskId;
        comp.ngOnInit();
    });

    it('should render the correct number of topics', () => {
        const renderedLists: number = topics.length;

        fixture.detectChanges();

        expect(getAllElements(taskTopicsListCardSelector).length).toBe(renderedLists);
    });

    it('should render load more when there are more items', () => {
        hasMoreItemsSubject.next(true);
        fixture.detectChanges();

        expect(getElement(taskTopicsListLoadMoreSelector)).toBeTruthy();
    });

    it('should not render load more when there are no more items', () => {
        hasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(taskTopicsListLoadMoreSelector)).toBeFalsy();
    });

    it('should dispatch TopicActions.Update.Criticality action when handleCriticalityChange is called', () => {
        const action = new TopicActions.Update.Criticality(mockCriticalityChange);

        comp.handleCriticalityChange(mockCriticalityChange);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should open the confirmation modal when handleDelete is called ', () => {
        spyOn(modalService, 'open').and.callThrough();

        comp.handleDelete(topicId);

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should dispatch TopicActions.Delete.One action when confirmCallback callback is called', () => {
        const action = new TopicActions.Delete.One(topicId);

        spyOn(modalService, 'open').and.callThrough();

        comp.handleDelete(topicId);
        modalService.currentModalData.confirmCallback();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch TopicActions.Delete.OneReset action when cancelCallback callback is called', () => {
        const action = new TopicActions.Delete.OneReset();

        spyOn(modalService, 'open').and.callThrough();

        comp.handleDelete(topicId);
        modalService.currentModalData.cancelCallback();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch TopicActions.Request.All action when load more button is clicked and the list of topics is not empty', () => {
        const lastTopicId = topics[topics.length - 1].id;
        const action = new TopicActions.Request.All(lastTopicId, LOAD_MORE_TOPICS_LIMIT, taskId);

        hasMoreItemsSubject.next(true);
        fixture.detectChanges();

        getElement(taskTopicsListLoadMoreSelector).dispatchEvent(eventClick);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should dispatch TopicActions.Request.All action when load more button is clicked and the list of topics is empty', () => {
        const action = new TopicActions.Request.All(null, LOAD_MORE_TOPICS_LIMIT, taskId);

        hasMoreItemsSubject.next(true);
        topicsSubject.next([]);
        fixture.detectChanges();

        getElement(taskTopicsListLoadMoreSelector).dispatchEvent(eventClick);

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should set buttonSize to tiny when size is tiny', () => {
        comp.size = 'tiny';

        expect(comp.buttonSize).toBe('tiny');
    });

    it('should set buttonSize to small when size is small', () => {
        comp.size = 'small';

        expect(comp.buttonSize).toBe('small');
    });

    it('should set inputFilesSize to small when size is tiny', () => {
        comp.size = 'tiny';

        expect(comp.inputFilesSize).toBe('small');
    });

    it('should set inputFilesSize to normal when size is small', () => {
        comp.size = 'small';

        expect(comp.inputFilesSize).toBe('normal');
    });

    it('should show the normal loader when the first load of topics are being requested', () => {
        topicsSubject.next([]);
        topicsRequestStatusSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(taskTopicsListLoaderSelector)).toBeTruthy();
        expect(getElement(taskTopicsListShowMoreLoaderSelector)).toBeFalsy();
    });

    it('should not show the normal loader when the first load of topics finishes', () => {
        topicsRequestStatusSubject.next(RequestStatusEnum.success);
        hasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(taskTopicsListLoaderSelector)).toBeFalsy();
    });

    it('should show the loader inside the show more button when more topics are being requested', () => {
        hasMoreItemsSubject.next(true);
        topicsRequestStatusSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(taskTopicsListShowMoreLoaderSelector)).toBeTruthy();
        expect(getElement(taskTopicsListLoaderSelector)).toBeFalsy();
    });

    it('should not show the loader inside the show more button when the load of more topics finishes', () => {
        hasMoreItemsSubject.next(true);
        topicsRequestStatusSubject.next(RequestStatusEnum.success);
        fixture.detectChanges();

        expect(getElement(taskTopicsListShowMoreLoaderSelector)).toBeFalsy();
    });
});
