/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';

import {MOCK_ATTACHMENT_1} from '../../../../../../../test/mocks/attachments';
import {BlobServiceMock} from '../../../../../../../test/mocks/blob.service.mock';
import {MockStore} from '../../../../../../../test/mocks/store';
import {NoItemsComponent} from '../../../../../../shared/feedback/presentationals/no-items-component/no-items.component';
import {ObjectListIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {BlobService} from '../../../../../../shared/rest/services/blob.service';
import {TheaterService} from '../../../../../../shared/theater/api/theater.service';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {BackgroundImageDirective} from '../../../../../../shared/ui/directives/background-image.directive';
import {LoaderComponent} from '../../../../../../shared/ui/loader/loader.component';
import {ThumbnailGalleryComponent} from '../../../../../../shared/ui/thumbnail-gallery-component/thumbnail-gallery.component';
import {ProjectTaskQueries} from '../../../../../project-common/store/tasks/task-queries';
import {TaskAttachmentsListComponent} from './task-attachments-list.component';

describe('Task Attachments List Component', () => {
    let component: TaskAttachmentsListComponent;
    let fixture: ComponentFixture<TaskAttachmentsListComponent>;
    let de: DebugElement;
    let theaterService: TheaterService;
    let store: any;

    const dataAutomationSelectorLoadMoreButton = '[data-automation="task-attachments-list-load-more"]';
    const dataAutomationSelectorNoItems = '[data-automation="task-attachments-list-no-items"]';

    const testDataTaskId = '123';
    const testDataObjectTaskIdentifier = new ObjectListIdentifierPair(ObjectTypeEnum.Task, testDataTaskId, true);

    const testDataAttachments = new Array(24).fill(MOCK_ATTACHMENT_1);
    const testDataAttachmentsIds = new Array(24).fill(MOCK_ATTACHMENT_1.id);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            BackgroundImageDirective,
            LoaderComponent,
            NoItemsComponent,
            TaskAttachmentsListComponent,
            ThumbnailGalleryComponent,
        ],
        providers: [
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            attachmentSlice: {
                                items: testDataAttachments,
                                lists: {
                                    [testDataObjectTaskIdentifier.stringify()]: {
                                        ids: testDataAttachmentsIds,
                                    },
                                },
                            },
                            projectTaskSlice: {
                                currentItem: {
                                    id: testDataTaskId,
                                },
                            },
                        },
                    }
                ),
            },
            ProjectTaskQueries,
            {
                provide: TheaterService,
                useValue: jasmine.createSpyObj('TheaterService', ['open']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskAttachmentsListComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();

        theaterService = TestBed.inject(TheaterService);
        store = TestBed.inject(Store);
    });

    it('should open theater when openTheater is called', () => {
        component.openTheater(0);
        expect(theaterService.open).toHaveBeenCalled();
    });

    it('should render load more button when there are more items to show', () => {
        expect(de.query(By.css(dataAutomationSelectorLoadMoreButton))).not.toBeNull();
    });

    it('should show a maximum of 12 attachments at that beginning', () => {
        expect(component.attachmentPreviewLinks.length).toBeLessThanOrEqual(12);
    });

    it('should show more items when handleLoadMore is called', () => {
        component.handleLoadMore();
        expect(component.attachmentPreviewLinks.length).toBeGreaterThan(12);
    });

    it('should not render load more button when there are no more items to show', () => {
        component.handleLoadMore();
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationSelectorLoadMoreButton))).toBeNull();
    });

    it('should not render no items feedback when there are items', () => {
        store._value.projectModule.attachmentSlice.lists[testDataObjectTaskIdentifier.stringify()].ids = [];
        fixture.detectChanges();
        expect(de.query(By.css(dataAutomationSelectorNoItems))).toBeNull();
    });
});
