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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router,
    RouterModule
} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_ACTIVITY_1,
    MOCK_ACTIVITY_2,
    MOCK_ACTIVITY_3
} from '../../../../../../../test/mocks/activities';
import {
    MOCK_NEW_A,
    MOCK_NEW_B,
    MOCK_NEW_C
} from '../../../../../../../test/mocks/news';
import {MockStore} from '../../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {NoItemsComponent} from '../../../../../../shared/feedback/presentationals/no-items-component/no-items.component';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TheaterService} from '../../../../../../shared/theater/api/theater.service';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {ActivityResource} from '../../../../../project-common/api/activities/resources/activity.resource';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {ActivityQueries} from '../../../../../project-common/store/activities/activity.queries';
import {NewsQueries} from '../../../../../project-common/store/news/news.queries';
import {ROUTE_PARAM_TASK_ID} from '../../../../../project-routing/project-route.paths';
import {ProjectTaskActivitiesListComponent} from './project-task-activities-list.component';

describe('Project Task Activities List Component', () => {
    let fixture: ComponentFixture<ProjectTaskActivitiesListComponent>;
    let comp: ProjectTaskActivitiesListComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationHandleLoadMoreSelector = '[data-automation="project-task-activities-list-load-more"]';
    const dataAutomationActivitiesUnavailableSelector = '[data-automation="project-task-activities-list-unavailable"]';
    const dataAutomationActivitiesUnavailableButtonSelector = dataAutomationActivitiesUnavailableSelector + ' [data-automation="no-items-button"]';

    const clickEvent: Event = new Event('click');

    const getElement = (element: string): Element => el.querySelector(element);

    const ACTIVITY_LIST: ActivityResource[] = [MOCK_ACTIVITY_1, MOCK_ACTIVITY_2];

    const activityQueriesMock: ActivityQueries = mock(ActivityQueries);
    const newsQueriesMock: NewsQueries = mock(NewsQueries);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            NoItemsComponent,
            ProjectTaskActivitiesListComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        parent: {
                            params: {
                                [ROUTE_PARAM_TASK_ID]: MOCK_NEW_A.context.id
                            }
                        }
                    }
                }
            },
            {
                provide: ActivityQueries,
                useFactory: () => instance(activityQueriesMock)
            },
            {
                provide: NewsQueries,
                useFactory: () => instance(newsQueriesMock)
            },
            {
                provide: Router,
                useValue: RouterModule
            },
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            },
            {
                provide: TheaterService,
                useValue: jasmine.createSpyObj('TheaterService', ['open'])
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskActivitiesListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        when(activityQueriesMock.observeActivities()).thenReturn(of(ACTIVITY_LIST));
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(activityQueriesMock.observeActivitiesHasMoreItems()).thenReturn(of(true));
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([MOCK_NEW_A]));
    });

    afterAll(() => comp.ngOnDestroy());

    it('should not render more items', () => {
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(activityQueriesMock.observeActivitiesHasMoreItems()).thenReturn(of(false));
        fixture.detectChanges();

        expect(comp.canRenderMoreItems).toBeFalsy();
    });

    it('should render more items', () => {
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(activityQueriesMock.observeActivitiesHasMoreItems()).thenReturn(of(true));
        fixture.detectChanges();

        expect(comp.canRenderMoreItems).toBeTruthy();
    });

    it('should be called with the correct params', () => {
        const attachment: AttachmentResource = MOCK_ACTIVITY_3._embedded.attachments;

        spyOn(comp, 'openTheater').and.callThrough();

        comp.openTheater(attachment);

        expect(comp.openTheater).toHaveBeenCalledWith(attachment);
    });

    it('should trigger handleMore when load more button is clicked', () => {
        spyOn(comp, 'handleLoadMore').and.callThrough();

        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(activityQueriesMock.observeActivitiesHasMoreItems()).thenReturn(of(true));
        fixture.detectChanges();

        getElement(dataAutomationHandleLoadMoreSelector).dispatchEvent(clickEvent);

        expect(comp.handleLoadMore).toHaveBeenCalled();
    });

    it('should not request activities when loading is false', () => {
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.progress));
        fixture.detectChanges();

        comp.handleLoadMore();

        expect(comp.handleLoadMore).toThrow();
    });

    it('should render activities unavailable feedback when request ends with error', () => {
        when(activityQueriesMock.observeActivities()).thenReturn(of([]));
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        fixture.detectChanges();

        expect(getElement(dataAutomationActivitiesUnavailableButtonSelector)).toBeTruthy();
    });

    it('should not render activities unavailable feedback when request ends with success', () => {
        when(activityQueriesMock.observeActivities()).thenReturn(of(ACTIVITY_LIST));
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        fixture.detectChanges();

        expect(getElement(dataAutomationActivitiesUnavailableButtonSelector)).toBeFalsy();
    });

    it('should trigger handleRetry when retry button is clicked', () => {
        spyOn(comp, 'handleRetry').and.callThrough();

        when(activityQueriesMock.observeActivities()).thenReturn(of([]));
        when(activityQueriesMock.observeActivitiesRequestStatus()).thenReturn(of(RequestStatusEnum.error));
        fixture.detectChanges();

        getElement(dataAutomationActivitiesUnavailableButtonSelector).dispatchEvent(clickEvent);

        expect(comp.handleRetry).toHaveBeenCalled();
    });

    it('should set activity as new when activity date is same as task news date', () => {
        when(activityQueriesMock.observeActivities()).thenReturn(of(ACTIVITY_LIST));
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([MOCK_NEW_A]));
        fixture.detectChanges();

        expect(comp.activities[0].isNew).toBeTruthy();
    });

    it('should set activity as new when activity date is newer then task news date', () => {
        when(activityQueriesMock.observeActivities()).thenReturn(of(ACTIVITY_LIST));
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([MOCK_NEW_C]));
        fixture.detectChanges();

        expect(comp.activities[0].isNew).toBeTruthy();
    });

    it('should not set activity as new when activity date is older then task news date', () => {
        when(activityQueriesMock.observeActivities()).thenReturn(of(ACTIVITY_LIST));
        when(newsQueriesMock.observeItemsByIdentifierPair(anything())).thenReturn(of([MOCK_NEW_B]));
        fixture.detectChanges();

        expect(comp.activities[0].isNew).toBeFalsy();
    });
});
