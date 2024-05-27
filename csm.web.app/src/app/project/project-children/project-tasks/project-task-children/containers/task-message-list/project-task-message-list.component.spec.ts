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
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    BehaviorSubject,
    of,
} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_MESSAGE_1,
    MOCK_MESSAGE_2,
    MOCK_MESSAGE_3,
    MOCK_MESSAGE_4,
    MOCK_MESSAGE_LIST
} from '../../../../../../../test/mocks/messages';
import {MOCK_TOPIC_1} from '../../../../../../../test/mocks/task-topics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {MessageResource} from '../../../../../project-common/api/messages/resources/message.resource';
import {MessageListResource} from '../../../../../project-common/api/messages/resources/message-list.resource';
import {SaveMessageResource} from '../../../../../project-common/api/messages/resources/save-message.resource';
import {MessageActions} from '../../../../../project-common/store/messages/message.actions';
import {MessageQueries} from '../../../../../project-common/store/messages/message.queries';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {TopicActions} from '../../../../../project-common/store/topics/topic.actions';
import {ProjectTaskMessageListComponent} from './project-task-message-list.component';

describe('Project Task Message List Component', () => {
    let fixture: ComponentFixture<ProjectTaskMessageListComponent>;
    let comp: ProjectTaskMessageListComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: any;
    let modalService: ModalService;

    const messageQueriesMock: MessageQueries = mock(MessageQueries);
    const newsQueriesMock: NewsQueries = mock(NewsQueries);

    const messageList: MessageListResource = MOCK_MESSAGE_LIST;
    const testDataTopicId: string = MOCK_TOPIC_1.id;

    const messagesByTopicSubject = new BehaviorSubject<MessageResource[]>(messageList.messages);
    const messagesByTopicRequestStatusSubject = new BehaviorSubject<RequestStatusEnum>(RequestStatusEnum.empty);
    const messagesByTopicHasMoreItemsSubject = new BehaviorSubject<boolean>(true);

    const dataAutomationProjectTaskMessageListEntrySelector = '[data-automation="message-item-entry"]';
    const dataAutomationShowMoreItemsSelector = '[data-automation="show-more-items"]';
    const dataAutomationNormalLoaderSelector = '[data-automation="project-task-message-list-normal-loader"]';
    const dataAutomationShowMoreLoaderSelector = '[data-automation="project-task-message-list-show-more-loader"]';

    const getElement = (element: string): Element => el.querySelector(element);
    const getAllElements = (element: string): NodeListOf<Element> => el.querySelectorAll(element);

    const eventClick: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        declarations: [
            ProjectTaskMessageListComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: MessageQueries,
                useValue: instance(messageQueriesMock),
            },
            {
                provide: NewsQueries,
                useValue: instance(newsQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskMessageListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        store = TestBed.inject(Store);
        modalService = TestBed.inject(ModalService);

        when(messageQueriesMock.observeMessagesByTopic(testDataTopicId)).thenReturn(messagesByTopicSubject);
        when(messageQueriesMock.observeMessagesByTopicRequestStatus(testDataTopicId)).thenReturn(messagesByTopicRequestStatusSubject);
        when(messageQueriesMock.observeMessagesByTopicHasMoreItems(testDataTopicId)).thenReturn(messagesByTopicHasMoreItemsSubject);
        when(newsQueriesMock.observeItemsByParentIdentifierPair(anything())).thenReturn(of([]));

        store.dispatch.calls.reset();

        comp.topicId = testDataTopicId;
        fixture.detectChanges();
    });

    afterAll(() => comp.ngOnDestroy());

    it('should render the correct number of messages', () => {
        const renderedList: number = messageList.messages.length;

        expect(getAllElements(dataAutomationProjectTaskMessageListEntrySelector).length).toBe(renderedList);
    });

    it('should not show show-more-items button', () => {
        messagesByTopicHasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMoreItemsSelector)).toBeFalsy();
    });

    it('should render load more comments when there are more items to load', () => {
        messagesByTopicHasMoreItemsSubject.next(true);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMoreItemsSelector)).toBeTruthy();
    });

    it('should trigger handleMore() method', () => {
        spyOn(comp, 'handleLoadMore').and.callThrough();

        messagesByTopicHasMoreItemsSubject.next(true);
        fixture.detectChanges();

        getElement(dataAutomationShowMoreItemsSelector).dispatchEvent(eventClick);

        fixture.detectChanges();

        expect(comp.handleLoadMore).toHaveBeenCalled();
    });

    it('should trigger handleLoadMore() and dispatch MessageAction.Request.All() and TopicActions.Request.One() with ' +
        'limit set when there is no last message to show', () => {
        spyOn(comp, 'handleLoadMore').and.callThrough();

        comp.ngOnInit();

        comp.messages = [];

        fixture.detectChanges();

        getElement(dataAutomationShowMoreItemsSelector).dispatchEvent(eventClick);

        fixture.detectChanges();

        const expectedResult = new MessageActions.Request.All(
            {
                topicId: testDataTopicId,
                lastMessageId: null,
                limit: 2,
            });

        const expectedTopicAction = new TopicActions.Request.One(testDataTopicId);

        expect(comp.handleLoadMore).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
        expect(store.dispatch).toHaveBeenCalledWith(expectedTopicAction);
    });

    it('should call open on modalService when handleDelete is called and confirmCallback should dispatch right action', () => {
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new MessageActions.Delete.One(
            {
                topicId: testDataTopicId,
                messageId: MOCK_MESSAGE_1.id,
            });

        comp.handleDelete(MOCK_MESSAGE_1.id);

        modalService.currentModalData.confirmCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should call open on modalService when handleDelete is called and cancelCallback should dispatch right action', () => {
        spyOn(modalService, 'open').and.callThrough();
        const expectedResult = new MessageActions.Delete.OneReset(testDataTopicId);

        comp.handleDelete(MOCK_MESSAGE_1.id);

        modalService.currentModalData.cancelCallback();

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch MessageAction.Initialize.AllByTopic() after collapsing the comments panel', () => {
        const expectedResult = new MessageActions.Initialize.AllByTopic(testDataTopicId);

        comp.ngOnDestroy();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch a MessageActions.Create.One action when onSubmitMessage is called', () => {
        const saveMessage: SaveMessageResource = {
            topicId: testDataTopicId,
            content: 'content',
        };
        const expectedAction = new MessageActions.Create.One(saveMessage);

        comp.onSubmitMessage(saveMessage);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should update visible messages when the store already contains all the messages, ' +
        'but the number of visible messages changes', () => {
        const messages = [MOCK_MESSAGE_1, MOCK_MESSAGE_2, MOCK_MESSAGE_3, MOCK_MESSAGE_4];

        messagesByTopicSubject.next(messages);

        expect(comp.messages.length).toBe(2);

        comp.handleLoadMore();

        expect(comp.messages.length).toBe(messages.length);
    });

    it('should show the normal loader when the first load of messages are being requested', () => {
        messagesByTopicSubject.next([]);
        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.progress);
        messagesByTopicHasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(dataAutomationNormalLoaderSelector)).toBeTruthy();
        expect(getElement(dataAutomationShowMoreLoaderSelector)).toBeFalsy();
    });

    it('should not show the normal loader when the first load of messages finishes', () => {
        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.success);
        messagesByTopicHasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(dataAutomationNormalLoaderSelector)).toBeFalsy();
    });

    it('should not show the normal loader when a new message is being created', () => {
        const saveMessage: SaveMessageResource = {
            topicId: testDataTopicId,
            content: 'content',
        };

        comp.onSubmitMessage(saveMessage);
        fixture.detectChanges();

        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.progress);
        messagesByTopicHasMoreItemsSubject.next(false);
        fixture.detectChanges();

        expect(getElement(dataAutomationNormalLoaderSelector)).toBeFalsy();
    });

    it('should show the loader inside the show more button when more messages are being requested', () => {
        messagesByTopicHasMoreItemsSubject.next(true);
        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMoreLoaderSelector)).toBeTruthy();
        expect(getElement(dataAutomationNormalLoaderSelector)).toBeFalsy();
    });

    it('should not show the loader inside the show more button when the load of more messages finishes', () => {
        messagesByTopicHasMoreItemsSubject.next(true);
        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.success);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMoreLoaderSelector)).toBeFalsy();
    });

    it('should not show the loader inside the show more button when a new message is being created', () => {
        const saveMessage: SaveMessageResource = {
            topicId: testDataTopicId,
            content: 'content',
        };

        comp.onSubmitMessage(saveMessage);
        fixture.detectChanges();

        messagesByTopicHasMoreItemsSubject.next(true);
        messagesByTopicRequestStatusSubject.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMoreLoaderSelector)).toBeFalsy();
    });
});
