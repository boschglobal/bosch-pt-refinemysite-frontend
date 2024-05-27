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
import {flatten} from 'lodash';
import {of} from 'rxjs';

import {MOCK_NEW_B} from '../../../../../../../test/mocks/news';
import {
    MOCK_TOPIC_1,
    MOCK_TOPIC_2
} from '../../../../../../../test/mocks/task-topics';
import {BlobServiceStub} from '../../../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {BlobService} from '../../../../../../shared/rest/services/blob.service';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {MarkerComponent} from '../../../../../../shared/ui/marker/marker.component';
import {MenuItem} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {TextImageArticleComponent} from '../../../../../../shared/ui/text-image-article/text-image-article.component';
import {ThumbnailGalleryComponent} from '../../../../../../shared/ui/thumbnail-gallery-component/thumbnail-gallery.component';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {TopicCriticalityEnum} from '../../../../../project-common/enums/topic-criticality.enum';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../../project-routing/project-route.paths';
import {
    CriticalityChange,
    DELETE_TOPIC_ITEM_ID,
    ProjectTaskTopicCardComponent,
    TOPIC_CRITICALITY_ID,
} from './project-task-topic-card.component';
import {ProjectTaskTopicCardModel} from './project-task-topic-card.model';

describe('Project Tasks Topic Card Component', () => {
    let fixture: ComponentFixture<ProjectTaskTopicCardComponent>;
    let comp: ProjectTaskTopicCardComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const topicWithAttachments: TopicResource = MOCK_TOPIC_1;
    const topicWithoutAttachments: TopicResource = MOCK_TOPIC_2;
    const topicCritical: TopicResource = MOCK_TOPIC_1;
    const topicUncritical: TopicResource = MOCK_TOPIC_2;
    const topicWithDeletePermission = Object.assign({}, MOCK_TOPIC_1, {
        _links: {
            delete: {
                href: '',
            },
        },
    });
    const topicWithoutDeletePermission = Object.assign({}, MOCK_TOPIC_1, {
        _links: {
            self: {
                href: '',
            },
        },
    });
    const mockElem = {
        scrollIntoView() {
            return;
        },
    };

    const currentLang = 'en';
    const setTopic = (topic: TopicResource) => comp.topicContent = ProjectTaskTopicCardModel.
        fromTopicResource(topic,[MOCK_NEW_B], currentLang);
    const setTopicWithAttachments = () => setTopic(topicWithAttachments);
    const setTopicWithoutAttachments = () => setTopic(topicWithoutAttachments);
    const setTopicCritical = () => setTopic(topicCritical);
    const setTopicUncritical = () => setTopic(topicUncritical);
    const setTopicWithDeletePermission = () => setTopic(topicWithDeletePermission);
    const setTopicWithoutDeletePermission = () => setTopic(topicWithoutDeletePermission);

    const clickEvent: Event = new Event('click');

    const dataAutomationMarkerSelector = '[data-automation="project-task-topic-card-marker"]';
    const dataAutomationThumbnail = '[data-automation="thumbnail-gallery-button-0"]';
    const dataAutomationCriticalityIcon = '[data-automation="project-task-topic-criticality-icon"]';

    const getDropdownItem = (itemId: string): MenuItem =>
        flatten(comp.dropdownItems.map(({items}) => items)).find(item => item.id === itemId);
    const getElement = (selector: string) => el.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectTaskTopicCardComponent,
            TextImageArticleComponent,
            ThumbnailGalleryComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: of({[ROUTE_PARAM_PROJECT_ID]: 456}),
                                }],
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: Router,
                useValue: RouterStub,
            },
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskTopicCardComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should handle topics without attachments', () => {
        setTopicWithoutAttachments();
        fixture.detectChanges();

        expect(comp.pictureLinks.length).toBeFalsy();
    });

    it('should listen when criticality value changes', () => {
        comp.topic = setTopicWithAttachments();
        spyOn(comp.criticalityChanged, 'emit').and.callThrough();

        comp.handleDropdownItemClicked({id: TOPIC_CRITICALITY_ID} as MenuItem);
        fixture.detectChanges();

        expect(comp.criticalityChanged.emit).toHaveBeenCalled();
    });

    it('should not show marker if not isNew', () => {
        comp.topic = setTopicUncritical();
        comp.topic.hasNewReplies = false;
        comp.topic.isCritical = true;
        fixture.detectChanges();
        const markerDebugElement = de.query(By.css(dataAutomationMarkerSelector));
        const markerComponent = markerDebugElement.componentInstance as MarkerComponent;
        expect(markerComponent.isVisible).toBe(false);
    });

    it('should show blue marker if isNew', () => {
        comp.topic = setTopicUncritical();
        comp.topic.isNew = true;
        fixture.detectChanges();
        const markerDebugElement = de.query(By.css(dataAutomationMarkerSelector));
        const markerComponent = markerDebugElement.componentInstance as MarkerComponent;
        expect(markerComponent.isVisible).toBe(true);
        expect(markerComponent.isCritical).toBe(false);
    });

    it('should show red marker if isNew and Critical', () => {
        comp.topic = setTopicCritical();
        comp.topic.isNew = true;
        fixture.detectChanges();
        const markerDebugElement = de.query(By.css(dataAutomationMarkerSelector));
        const markerComponent = markerDebugElement.componentInstance as MarkerComponent;
        expect(markerComponent.isVisible).toBe(true);
        expect(markerComponent.isCritical).toBe(true);
    });

    it('should render criticality icon', () => {
        comp.topic = setTopicCritical();

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalityIcon)).toBeTruthy();
    });

    it('should not render criticality icon', () => {
        comp.topic = setTopicUncritical();

        fixture.detectChanges();

        expect(getElement(dataAutomationCriticalityIcon)).toBeFalsy();
    });

    it('should uncollapse message list when triggered clickedReplies', () => {
        spyOn(document, 'getElementById').and.returnValue(mockElem);
        setTopicUncritical();
        fixture.detectChanges();

        comp.isReplyListCollapsed = true;
        fixture.detectChanges();

        comp.clickedReplies();
        fixture.detectChanges();

        expect(comp.isReplyListCollapsed).toBe(false);
    });

    it('should get correct topic id', () => {
        const topicId = MOCK_TOPIC_1.id;

        setTopicWithAttachments();

        expect(comp.topic.id).toBe(topicId);
    });

    it('should validate that open theater is called', () => {
        spyOn(comp, 'openTheater').and.callThrough();
        setTopicWithAttachments();
        fixture.detectChanges();

        getElement(dataAutomationThumbnail).dispatchEvent(clickEvent);
        expect(comp.openTheater).toHaveBeenCalled();
    });

    it('should set correct options when user has permission delete topic', () => {
        setTopicWithDeletePermission();

        expect(getDropdownItem(DELETE_TOPIC_ITEM_ID)).toBeTruthy();
    });

    it('should set correct options when user doesn\'t have permission delete topic', () => {
        setTopicWithoutDeletePermission();

        expect(getDropdownItem(DELETE_TOPIC_ITEM_ID)).toBeFalsy();
    });

    it('should emit delete event when delete option is called', () => {
        spyOn(comp.delete, 'emit').and.callThrough();
        setTopicWithDeletePermission();

        comp.handleDropdownItemClicked(getDropdownItem(DELETE_TOPIC_ITEM_ID));

        expect(comp.delete.emit).toHaveBeenCalledWith(topicWithDeletePermission.id);
    });

    it('should emit criticalityChanged with critical, when changing from uncritical', () => {
        const expectedCriticalityChange: CriticalityChange = {
            id: 'fd514020-7e7c-43cf-b755-24bb54a2c9c3',
            criticality: TopicCriticalityEnum.CRITICAL,
        };
        comp.topic = setTopicUncritical();
        spyOn(comp.criticalityChanged, 'emit').and.callThrough();

        comp.handleDropdownItemClicked({id: TOPIC_CRITICALITY_ID} as MenuItem);

        expect(comp.criticalityChanged.emit).toHaveBeenCalledWith(expectedCriticalityChange);
    });

    it('should emit criticalityChanged with uncritical, when changing from critical', () => {
        const expectedCriticalityChange: CriticalityChange = {
            id: '591fffce-d4ba-4cd9-a150-ae71e23715df',
            criticality: TopicCriticalityEnum.UNCRITICAL,
        };
        comp.topic = setTopicCritical();
        spyOn(comp.criticalityChanged, 'emit').and.callThrough();

        comp.handleDropdownItemClicked({id: TOPIC_CRITICALITY_ID} as MenuItem);

        expect(comp.criticalityChanged.emit).toHaveBeenCalledWith(expectedCriticalityChange);
    });
});
