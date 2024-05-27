/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';
import {
    BehaviorSubject,
    Subject
} from 'rxjs';

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {ModalServiceMock} from '../../../../../test/mocks/modal.service.mock';
import {
    NOTIFICATION_LIST_MOCK,
    NOTIFICATION_MOCK
} from '../../../../../test/mocks/notifications';
import {MockStore} from '../../../../../test/mocks/store';
import {DateHelperStub} from '../../../../../test/stubs/date.helper.stub';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {FeedbackModule} from '../../../feedback/feedback.module';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {BlobService} from '../../../rest/services/blob.service';
import {DateHelper} from '../../../ui/dates/date.helper.service';
import {IconModule} from '../../../ui/icons/icon.module';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {UIModule} from '../../../ui/ui.module';
import {NotificationResource} from '../../api/resources/notification.resource';
import {NotificationComponent} from '../../components/notification/notification.component';
import {NotificationNavigationHelper} from '../../helpers/notification-navigation.helper';
import {NotificationActions} from '../../store/notification.actions';
import {NotificationQueries} from '../../store/notification.queries';
import {NotificationListComponent} from './notification-list.component';

describe('Notification List Component', () => {

    let fixture: ComponentFixture<NotificationListComponent>;
    let comp: NotificationListComponent;
    let de: DebugElement;

    let notificationQueries: any;
    let breakpointHelper: any;
    let notificationNavigationHelper: any;
    let store: any;
    let modalService: any;
    let router: Router;

    let hasMoreItemsObservable: Subject<boolean>;
    let hasNewItemsObservable: Subject<boolean>;
    let itemsObservable: Subject<NotificationResource[]>;
    let requestObservable: Subject<RequestStatusEnum>;
    let breakpointObservable: Subject<string>;

    const dataAutomationPanel = `[data-automation="notification-panel"]`;
    const dataAutomationButton = `[data-automation="notification-button"]`;
    const dataAutomationLoadMoreButton = `[data-automation="notification-load-more"]`;
    const dataAutomationLoadRecentButton = `[data-automation="notification-load-recent"]`;
    const dataAutomationNotification = `[data-automation="notification-card"]`;
    const dataAutomationNotificationEmptySelector = '[data-automation="notification-empty"]';
    const dataAutomationNotificationErrorSelector = '[data-automation="notification-error"]';

    const getElement = (selector: string): DebugElement => de.query(By.css(selector));
    const getNotificationCards = (): DebugElement[] => de.queryAll(By.css(dataAutomationNotification));
    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        declarations: [
            NotificationListComponent,
            NotificationComponent,
        ],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
            TranslateModule,
            FeedbackModule,
            UIModule,
            RouterTestingModule,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: NotificationQueries,
                useValue: jasmine.createSpyObj('NotificationQueries', [
                    'observeNotificationsHasNewItems',
                    'observeNotificationsHasMoreItems',
                    'observeNotifications',
                    'observeNotificationsRequestStatus',
                ]),
            },
            {
                provide: BreakpointHelper,
                useValue: jasmine.createSpyObj('BreakpointHelper', [
                    'breakpointChange',
                    'currentBreakpoint',
                ]),
            },
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
            {
                provide: ModalService,
                useValue: new ModalServiceMock(),
            },
            {
                provide: DateHelper,
                useValue: new DateHelperStub(),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: NotificationNavigationHelper,
                useValue: jasmine.createSpyObj('NotificationNavigationHelper', ['getUrl', 'getQueryParams']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(NotificationListComponent);
        notificationQueries = TestBed.inject(NotificationQueries);
        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        modalService = TestBed.inject(ModalService);
        breakpointHelper = TestBed.inject(BreakpointHelper);
        notificationNavigationHelper = TestBed.inject(NotificationNavigationHelper);

        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.isPanelOpen = true;

        hasMoreItemsObservable = new Subject();
        hasNewItemsObservable = new Subject();
        itemsObservable = new BehaviorSubject(NOTIFICATION_LIST_MOCK.items);
        requestObservable = new BehaviorSubject(RequestStatusEnum.empty);
        breakpointObservable = new Subject<string>();

        notificationQueries.observeNotificationsHasNewItems.and.returnValue(hasNewItemsObservable);
        notificationQueries.observeNotificationsHasMoreItems.and.returnValue(hasMoreItemsObservable);
        notificationQueries.observeNotifications.and.returnValue(itemsObservable);
        notificationQueries.observeNotificationsRequestStatus.and.returnValue(requestObservable);

        breakpointHelper.breakpointChange.and.returnValue(breakpointObservable);
        breakpointHelper.currentBreakpoint.and.returnValue('sm');

        notificationNavigationHelper.getUrl.and.returnValue([]);
        notificationNavigationHelper.getQueryParams.and.returnValue({});

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeTruthy();
    });

    it('should close panel when click outside', () => {
        expect(getElement(dataAutomationPanel)).toBeTruthy();

        document.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeFalsy();
    });

    it('should not open the panel when click on document', () => {
        comp.isPanelOpen = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeFalsy();

        document.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeFalsy();
    });

    it('should open the panel when closed and the notification button is clicked', () => {
        comp.isPanelOpen = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeFalsy();

        getElement(dataAutomationButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeTruthy();
    });

    it('should trigger action NotificationActions.Request.All when notification button is clicked and their are no notifications', () => {
        comp.isPanelOpen = false;
        fixture.detectChanges();

        itemsObservable.next([]);

        const action = new NotificationActions.Request.All();
        spyOn(store, 'dispatch');

        getElement(dataAutomationButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should trigger action NotificationActions.Request.AllAfter when notification button is clicked ' +
        'and their exist notifications', () => {
        comp.isPanelOpen = false;
        fixture.detectChanges();

        itemsObservable.next(NOTIFICATION_LIST_MOCK.items);

        const action = new NotificationActions.Request.AllAfter(NOTIFICATION_LIST_MOCK.items[0].date);
        spyOn(store, 'dispatch');

        getElement(dataAutomationButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should close the panel when opened and the notification button is clicked', () => {
        expect(getElement(dataAutomationPanel)).toBeTruthy();

        getElement(dataAutomationButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(dataAutomationPanel)).toBeFalsy();
    });

    it('should track notifications by id', () => {
        expect(comp.trackByFn(0, NOTIFICATION_MOCK)).toBe(NOTIFICATION_MOCK.id);
    });

    it('should hide load more button when there are no more notifications to fetch', () => {
        expect(getElement(dataAutomationLoadMoreButton)).toBeFalsy();
    });

    it('should display load more button when there are more notifications to fetch.', () => {
        hasMoreItemsObservable.next(true);
        fixture.detectChanges();

        expect(getElement(dataAutomationLoadMoreButton)).toBeTruthy();
    });

    it('should trigger action NotificationActions.Request.AllBefore on click button loadBofore', () => {
        const notificationArrayIndex = NOTIFICATION_LIST_MOCK.items.length - 1;

        hasMoreItemsObservable.next(true);
        fixture.detectChanges();

        const action = new NotificationActions.Request.AllBefore(NOTIFICATION_LIST_MOCK.items[notificationArrayIndex].date);
        spyOn(store, 'dispatch');

        getElement(dataAutomationLoadMoreButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should hide new notifications button when there are no more recent notifications to fetch', () => {
        expect(getElement(dataAutomationLoadRecentButton)).toBeFalsy();
    });

    it('should display new notifications button when there are more recent notifications to fetch', () => {
        hasNewItemsObservable.next(true);
        fixture.detectChanges();

        expect(getElement(dataAutomationLoadRecentButton)).toBeTruthy();
    });

    it('should trigger action NotificationActions.Request.AllAfter on click button has new notifications', () => {
        hasNewItemsObservable.next(true);
        fixture.detectChanges();

        const action = new NotificationActions.Request.AllAfter(NOTIFICATION_LIST_MOCK.items[0].date);
        spyOn(store, 'dispatch');

        getElement(dataAutomationLoadRecentButton).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('should show error message when request fails and there are no notifications in the store', () => {
        itemsObservable.next([]);
        requestObservable.next(RequestStatusEnum.error);

        fixture.detectChanges();

        expect(getElement(dataAutomationNotificationErrorSelector)).toBeTruthy();
    });

    it('should show empty message when are no notifications in the store', () => {
        itemsObservable.next([]);
        comp.isLoadingAll = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationNotificationEmptySelector)).toBeTruthy();
    });

    it('should not show error message when request fails and there are notifications in the store', () => {
        requestObservable.next(RequestStatusEnum.error);

        fixture.detectChanges();

        expect(getElement(dataAutomationNotificationErrorSelector)).toBeFalsy();
        expect(getNotificationCards().length).toBe(NOTIFICATION_LIST_MOCK.items.length);
    });

    it('should show error message when request fails and there are no notifications in the store', () => {
        itemsObservable.next([]);
        requestObservable.next(RequestStatusEnum.error);

        fixture.detectChanges();

        expect(getElement(dataAutomationNotificationErrorSelector)).toBeTruthy();
    });

    it('should hide loadings when notifications request finish', () => {
        comp.isLoadingAll = true;
        comp.loadMoreButton.isLoading = true;
        comp.loadRecentButton.isLoading = true;

        fixture.detectChanges();

        requestObservable.next(RequestStatusEnum.success);

        fixture.detectChanges();

        expect(comp.isLoadingAll).toBeFalsy();
        expect(comp.loadMoreButton.isLoading).toBeFalsy();
        expect(comp.loadRecentButton.isLoading).toBeFalsy();
    });

    it('should keep loadings when notifications request is in progress', () => {
        comp.isLoadingAll = true;
        comp.loadMoreButton.isLoading = true;
        comp.loadRecentButton.isLoading = true;

        fixture.detectChanges();

        requestObservable.next(RequestStatusEnum.progress);

        fixture.detectChanges();

        expect(comp.isLoadingAll).toBeTruthy();
        expect(comp.loadMoreButton.isLoading).toBeTruthy();
        expect(comp.loadRecentButton.isLoading).toBeTruthy();
    });

    it('should hide fetch new notifications button if loading and notifications request finish', () => {
        comp.loadRecentButton.isLoading = true;
        comp.loadRecentButton.isVisible = true;

        fixture.detectChanges();

        requestObservable.next(RequestStatusEnum.success);

        fixture.detectChanges();

        expect(comp.loadRecentButton.isLoading).toBeFalsy();
        expect(comp.loadRecentButton.isVisible).toBeFalsy();
    });

    it('should show notification bell without red dot when panel is open and do not exist new notifications to fetch', () => {
        hasNewItemsObservable.next(false);

        fixture.detectChanges();
        expect(comp.hasNewNotifications).toBe(false);
    });

    it('should show notification bell with red dot when panel is open and exist new notifications to fetch', () => {
        hasNewItemsObservable.next(true);

        fixture.detectChanges();
        expect(comp.hasNewNotifications).toBe(true);
    });

    it('should show notification bell without red dot when panel is closed and do not exist new notifications to fetch', () => {
        comp.isPanelOpen = false;
        hasNewItemsObservable.next(false);

        fixture.detectChanges();
        expect(comp.hasNewNotifications).toBe(false);
    });

    it('should show notification bell with red dot when panel is closed and exist new notifications to fetch', () => {
        comp.isPanelOpen = false;
        hasNewItemsObservable.next(true);

        fixture.detectChanges();
        expect(comp.hasNewNotifications).toBe(true);
    });

    it('should add class ss-modal--open to body when screen is xs and panel is open', () => {
        breakpointHelper.currentBreakpoint.and.returnValue('xs');
        breakpointObservable.next('xs');
        fixture.detectChanges();

        expect(document.body.classList).toContain('ss-modal--open');
    });

    it('should remove class ss-modal--open from body when screen is sm and panel is open', () => {
        breakpointHelper.currentBreakpoint.and.returnValue('xs');
        breakpointObservable.next('xs');
        fixture.detectChanges();

        expect(document.body.classList).toContain('ss-modal--open');

        breakpointHelper.currentBreakpoint.and.returnValue('sm');
        breakpointObservable.next('sm');
        fixture.detectChanges();

        expect(document.body.classList).not.toContain('ss-modal--open');
    });

    it('should not remove class ss-modal--open from body when the panel is closed and other modal is open', () => {
        comp.isPanelOpen = false;
        modalService.open();

        expect(document.body.classList).toContain('ss-modal--open');

        breakpointHelper.currentBreakpoint.and.returnValue('sm');
        breakpointObservable.next('sm');
        fixture.detectChanges();

        expect(document.body.classList).toContain('ss-modal--open');
    });

    it('should close notification list when a browser navigation occurs', () => {
        comp.isPanelOpen = false;
        comp.togglePanel();
        router.navigateByUrl('/');
        fixture.detectChanges();
        expect(comp.isPanelOpen).toBeFalsy();
    });

    it('should close notification list when a notification is clicked', () => {
        const notification = cloneDeep(NOTIFICATION_MOCK);

        comp.isPanelOpen = false;
        comp.togglePanel();
        comp.handleNotificationClick(notification);

        expect(comp.isPanelOpen).toBeFalsy();
    });

    it('should trigger NotificationActions.Set.AsRead action when handleNotificationClick function is called with ' +
        'a unread notification', () => {
        const notification = cloneDeep(NOTIFICATION_MOCK);
        const expectedResult = new NotificationActions.Set.AsRead(notification.id);
        notification.read = false;

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleNotificationClick(notification);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should not trigger NotificationActions.Set.AsRead action when handleNotificationClick function is called with ' +
        'a read notification', () => {
        const notification = cloneDeep(NOTIFICATION_MOCK);
        notification.read = true;

        spyOn(store, 'dispatch').and.callThrough();

        comp.handleNotificationClick(notification);

        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should return the correct routerLink data for a given notification', () => {
        expect(comp.getNotificationRouterLink(NOTIFICATION_MOCK)).toEqual([]);
    });

    it('should return the correct routerQueryParams data for a given notification', () => {
        expect(comp.getNotificationRouterQueryParams(NOTIFICATION_MOCK)).toEqual({});
    });

});
