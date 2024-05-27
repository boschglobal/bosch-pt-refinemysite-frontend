/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    NavigationEnd,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE} from '../../../ui/constants/breakpoints.constant';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {NotificationResource} from '../../api/resources/notification.resource';
import {NotificationNavigationHelper} from '../../helpers/notification-navigation.helper';
import {NotificationActions} from '../../store/notification.actions';
import {NotificationQueries} from '../../store/notification.queries';

interface LoadingButton {
    isLoading: boolean;
    isVisible: boolean;
    load: () => void;
    loadingLabel: string;
    label: string;
    automation: string;
}

@Component({
    selector: 'ss-notification-list',
    templateUrl: './notification-list.component.html',
    styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent implements OnInit, OnDestroy {

    public isPanelOpen = false;
    public hasNewNotifications = false;

    public notifications: NotificationResource[];

    public loadMoreButton: LoadingButton = {
        isVisible: false,
        isLoading: false,
        loadingLabel: 'Generic_Loading',
        label: 'Generic_LoadMore',
        load: this.loadMore.bind(this),
        automation: 'notification-load-more',
    };

    public loadRecentButton: LoadingButton = {
        isVisible: false,
        isLoading: false,
        loadingLabel: 'Generic_Loading',
        label: 'Notifications_FetchNewNotifications_Label',
        load: this.requestNewNotifications.bind(this),
        automation: 'notification-load-recent',
    };

    public isLoadingAll = false;

    public showError = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    @HostListener('document:click', ['$event'])
    private _clickOut(event) {
        if (this.isPanelOpen && !this._elementRef.nativeElement.contains(event.target)) {
            this._closePanel();
        }
    }

    constructor(private _breakpoint: BreakpointHelper,
                private _elementRef: ElementRef,
                private _modalService: ModalService,
                private _navigationHelper: NotificationNavigationHelper,
                private _notificationQueries: NotificationQueries,
                private _store: Store<State>,
                private _router: Router) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._requestAllNotifications();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public isListVisible(): boolean {
        return this.notifications.length > 0 && !this.showError;
    }

    public isEmptyMessageVisible(): boolean {
        return this.notifications.length === 0 && !this.isLoadingAll && !this.showError;
    }

    public handleNotificationClick(notification: NotificationResource): void {
        if (!notification.read) {
            this._store.dispatch(new NotificationActions.Set.AsRead(notification.id));
        }

        this._closePanel();
    }

    public getNotificationRouterLink(notification: NotificationResource): any[] {
        return this._navigationHelper.getUrl(notification);
    }

    public getNotificationRouterQueryParams(notification: NotificationResource): { [key: string]: any } {
        return this._navigationHelper.getQueryParams(notification);
    }

    public togglePanel(): void {
        if (this.isPanelOpen) {
            this._closePanel();
        } else {
            this._openPanel();
        }
    }

    public trackByFn(index: number, item: NotificationResource): string {
        return item.id;
    }

    public loadMore(): void {
        this.loadMoreButton.isLoading = true;

        const lastNotification = this.notifications[this.notifications.length - 1];
        this._store.dispatch(new NotificationActions.Request.AllBefore(lastNotification.date));
    }

    public requestNewNotifications(): void {
        this.loadRecentButton.isLoading = true;

        // may not be visible if the panel was closed
        this.loadRecentButton.isVisible = true;

        this._store.dispatch(new NotificationActions.Request.AllAfter(this.notifications[0].date));
    }

    private _appendNotifications(): void {
        if (this.notifications && this.notifications.length > 0) {
            this.requestNewNotifications();
        } else {
            this._requestAllNotifications();
        }
    }

    private _requestAllNotifications(): void {
        this.isLoadingAll = true;

        this._store.dispatch(new NotificationActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._notificationQueries.observeNotificationsHasNewItems()
                .subscribe(requestStatus => this._handleHasNewNotifications(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._notificationQueries.observeNotificationsHasMoreItems()
                .subscribe(requestStatus => this._handleHasMoreNotifications(requestStatus))
        );

        this._disposableSubscriptions.add(
            this._notificationQueries.observeNotifications()
                .subscribe(notifications => this._handleNotifications(notifications))
        );

        this._disposableSubscriptions.add(
            this._notificationQueries.observeNotificationsRequestStatus()
                .subscribe(status => this._handleRequestStatus(status))
        );

        this._disposableSubscriptions.add(
            this._breakpoint.breakpointChange()
                .subscribe(() => this._handleBodyScroll())
        );

        this._disposableSubscriptions.add(
            this._router.events
                .pipe(
                    filter(event => event instanceof NavigationEnd))
                .subscribe(() => this._closePanel())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleHasNewNotifications(hasNewNotifications: boolean): void {
        this.hasNewNotifications = hasNewNotifications;

        // loading button is only visible if a notification is Added while the panel is oped
        this.loadRecentButton.isVisible = this.isPanelOpen && hasNewNotifications;
    }

    private _handleHasMoreNotifications(hasMoreNotifications: boolean): void {
        this.loadMoreButton.isVisible = hasMoreNotifications;
    }

    private _handleRequestStatus(status: RequestStatusEnum): void {
        if (status !== RequestStatusEnum.progress) {

            // if the load new notifications is loading will be hidden
            if (this.loadRecentButton.isLoading) {
                this.loadRecentButton.isVisible = false;
            }

            // if not in progress stop loading all different loadings
            this.loadRecentButton.isLoading = false;
            this.loadMoreButton.isLoading = false;
            this.isLoadingAll = false;
        }

        // if exist notifications it's better to show them instead of the error message
        this.showError = status === RequestStatusEnum.error && this.notifications.length === 0;
    }

    private _handleNotifications(notifications: NotificationResource[]): void {
        this.notifications = notifications;
    }

    private _handleBodyScroll(): void {
        const isXSScreen = BREAKPOINTS_RANGE[this._breakpoint.currentBreakpoint()].max <= BREAKPOINTS_RANGE.xs.max;

        if (this.isPanelOpen && isXSScreen) {
            document.body.classList.add('ss-modal--open');
        } else if (!this._modalService.isModalOpen) {
            document.body.classList.remove('ss-modal--open');
        }

    }

    private _closePanel(): void {
        this.isPanelOpen = false;

        // if the button was visible, the will no longer be visible when open again
        this.loadRecentButton.isVisible = false;

        this._handleBodyScroll();
    }

    private _openPanel(): void {
        this.isPanelOpen = true;

        // always try to fetch new notification, to prevent the case that the realtime service is not working
        this._appendNotifications();

        this._handleBodyScroll();
    }
}
