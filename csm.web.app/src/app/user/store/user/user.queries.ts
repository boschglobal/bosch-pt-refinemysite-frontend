/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {
    UserResource,
    UserResourceLinks
} from '../../api/resources/user.resource';
import {UserSlice} from './user.slice';

@Injectable({
    providedIn: 'root',
})
export class UserQueries extends BaseQueries<UserResource, UserSlice, UserResourceLinks> {

    public moduleName = 'userModule';

    public sliceName = 'userSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieve UserResource of current user
     * @returns {UserResource}
     */
    public getCurrentState(): UserResource {
        let currentUser: UserResource;
        this.observeCurrentUser()
            .pipe(
                take(1))
            .subscribe((user: UserResource) => currentUser = user)
            .unsubscribe();
        return currentUser;
    }

    /**
     * @description Retrieve boolean if user is loaded
     * @returns {boolean}
     */
    public isCurrentUserLoaded(): boolean {
        return !!this.getCurrentState();
    }

    /**
     * @description Retrieves Observable of current user
     * @returns {Observable<UserResource>}
     */
    public observeCurrentUser(): Observable<UserResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current user request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentUserRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves of current user request status
     * @returns {RequestStatusEnum}
     */
    public getCurrentUserRequestStatus(): RequestStatusEnum {
        let requestStatus: RequestStatusEnum;

        this.observeCurrentUserRequestStatus()
            .pipe(
                take(1))
            .subscribe((status: RequestStatusEnum) => requestStatus = status)
            .unsubscribe();
        return requestStatus;
    }

    /**
     * @description Retrieves boolean with edit permissions
     * @returns {boolean}
     */
    public hasEditProfilePermission(): boolean {
        let permission: boolean;
        this.observeEditProfilePermission()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    /**
     * @description Retrieves Observable of boolean
     * @returns {Observable<boolean>}
     */
    public observeEditProfilePermission(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                map((user: UserResource) => user && user._links.hasOwnProperty('update')),
                distinctUntilChanged()
            );
    }

    /**
     * @description Retrieves Observable of the user privacy settings
     * @returns {Observable<UserPrivacySettings>}
     */
    observeUserPrivacySettings(): Observable<UserPrivacySettings> {
        return this._store
            .pipe(
                select((state: State) => this._getSlice(state).privacySettings),
                distinctUntilChanged(isEqual)
            );
    }
}
