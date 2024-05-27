/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Store,
    select
} from '@ngrx/store';
import {
    take,
    distinctUntilChanged,
    skip
} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {isEqual} from 'lodash';

import {BaseQueries} from '../../../shared/misc/store/base.queries';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {ResourceReferenceWithEmail} from '../../../shared/misc/api/datatypes/resource-reference-with-email.datatype';
import {State} from '../../../app.reducers';
import {UserSlice} from './user.slice';
import {
    UserResource,
    UserResourceLinks
} from '../../api/resources/user.resource';

@Injectable({
    providedIn: 'root',
})
export class UserQueries extends BaseQueries<UserResource, UserSlice, UserResourceLinks> {

    public sliceName = 'userSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Returns if the authenticated user is an admin
     * @returns boolean
     */
    public isAdminUser(): boolean {
        let isAdmin = false;
        this.observeAuthenticatedUser()
            .pipe(
                take(1))
            .subscribe((user: UserResource) => isAdmin = !!user && !!user.admin);
        return isAdmin;
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
     * @description Retrieve UserResource of authenticated User
     * @returns {UserResource}
     */
    public getAuthenticatedUserState(): UserResource {
        let authenticatedUser: UserResource;
        this.observeAuthenticatedUser()
            .pipe(
                take(1))
            .subscribe((user: UserResource) => authenticatedUser = user);
        return authenticatedUser;
    }

    /**
     * @description Retrieve boolean if user is loaded
     * @returns {boolean}
     */
    public isAuthenticatedUserLoaded(): boolean {
        return !!this.getAuthenticatedUserState();
    }

    /**
     * @description Retrieves Observable of AuthenticatedUser
     * @returns {Observable<UserResource>}
     */
    public observeAuthenticatedUser(): Observable<UserResource> {
        return this._store
            .pipe(
                select(this.getAuthenticatedUserItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves query function to get authenticatedUser of the slice
     * @returns {(state: State) => R}
     */
    public getAuthenticatedUserItem(): (state: State) => UserResource {
        return (state: State) =>
            this._getSlice(state).items
                .find((item: any) => item.id === this._getSlice(state).authenticatedUser.id);
    }

    /**
     * @description Retrieves Observable of authenticatedUser request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeAuthenticatedUserRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getAuthenticatedUserRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves query function to get authenticatedUser item request status
     * @returns {(state: State) => R[]}
     */
    public getAuthenticatedUserRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).authenticatedUser.requestStatus;
    }

    /**
     * @description Retrieves Observable of User of a given id
     * @returns {Observable<UserResource>}
     */
    public observeUserById(id: string): Observable<UserResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of authentificated user loaded when he is loaded
     * @returns {Observable<UserResource>}
     */
    public onAuthenticatedUserLoaded(): Observable<UserResource> {
        return this.observeAuthenticatedUser()
        .pipe(
            skip(1),
            take(1));
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
     * @description Retrieves Observable of employee suggestions
     * @returns {Observable<ResourceReferenceWithEmail[]>}
     */
    public observeUserSuggestions(): Observable<ResourceReferenceWithEmail[]> {
        return this._store
            .pipe(
                select(this._getCurrentSuggestions()),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves query function to get the suggestions from the store
     * @returns {(state: State) => ResourceReferenceWithEmail[]}
     */
    private _getCurrentSuggestions(): (state: State) => ResourceReferenceWithEmail[] {
        return (state: State) => this._getSlice(state).suggestions;
    }
}
