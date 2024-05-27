/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    Observable,
    of,
    zip,
} from 'rxjs';
import {
    catchError,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {AlertActions} from '../../../shared/alert/store/alert.actions';
import {PrivacyService} from '../../../shared/privacy/api/privacy.service';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {UserResource} from '../../api/resources/user.resource';
import {UserPictureResource} from '../../api/resources/user-picture.resource';
import {UserService} from '../../api/user.service';
import {UserLegalDocumentsService} from '../../api/user-legal-documents.service';
import {UserPictureService} from '../../api/user-picture.service';
import {
    UserActionEnum,
    UserActions,
    UserPictureActions,
} from './user.actions';
import {UserQueries} from './user.queries';

@Injectable()
export class UserEffects {
    constructor(private _actions$: Actions,
                private _privacyService: PrivacyService,
                private _userLegalDocumentsService: UserLegalDocumentsService,
                private _userService: UserService,
                private _userPictureService: UserPictureService,
                private _userQueries: UserQueries) {
    }

    /**
     * @description Sets privacy settings
     * @type {Observable<Action>}
     */
    public setPrivacySettings$ = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.SetPrivacySettings),
            switchMap((action: UserActions.Set.PrivacySettings) =>
                this._privacyService.updatePrivacySettings(action.payload)
                    .pipe(
                        map((privacySettings: UserPrivacySettings) => new UserActions.Set.PrivacySettingsFulfilled(privacySettings)),
                        catchError(() => of(new UserActions.Set.PrivacySettingsRejected()))
                    )
            )));

    /**
     * @description Request privacy settings
     * @type {Observable<Action>}
     */
    public requestPrivacySettings$ = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.RequestPrivacySettings),
            switchMap(() =>
                this._privacyService.findPrivacySettings()
                    .pipe(
                        map((privacySettings: UserPrivacySettings) => new UserActions.Set.PrivacySettingsFulfilled(privacySettings)),
                        catchError(() => of(new UserActions.Set.PrivacySettingsRejected()))
                    )
            )));

    /**
     * @description Triggers for request current user
     * @type {Observable<Action>}
     */
    public triggerRequestActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                UserActionEnum.DeleteUserPictureFulfilled,
                UserActionEnum.CreateUserPictureFulfilled
            ),
            switchMap(() => of(new UserActions.Request.Current()))));

    /**
     * @description Request current user interceptor
     * @type {Observable<Action>}
     */
    public requestCurrent$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.RequestCurrent),
            switchMap(() =>
                this._userService
                    .findCurrent()
                    .pipe(
                        map((userResource: UserResource) => new UserActions.Request.CurrentFulfilled(userResource)),
                        catchError(() => of(new UserActions.Request.CurrentRejected())))
            )));

    /**
     * @description Creates user
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.CreateOne),
            switchMap(({payload, profilePicture, legalDocumentsIds}: UserActions.Create.One) =>
                this._userService
                    .create(payload)
                    .pipe(
                        switchMap((user: UserResource) => {
                            const subsequentRequests: Observable<any>[] = [
                                this._userLegalDocumentsService.consents(legalDocumentsIds),
                                ...profilePicture ? [this._userPictureService.upload(user.id, profilePicture)] : [],
                            ];

                            return zip(...subsequentRequests).pipe(
                                map(() => new UserActions.Create.OneFulfilled(user)),
                                catchError(() => of(new UserActions.Create.OneFulfilled(user))));
                        }),
                        catchError(() => of(new UserActions.Create.OneRejected())))
            )));

    /**
     * @description Update user
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.UpdateOne),
            withLatestFrom(this._userQueries.observeCurrentUser()),
            mergeMap(([action, currentUser]) => {
                const updateUserAction = action as UserActions.Update.One;
                const version: number = currentUser.version;

                return this._userService
                    .update(version, updateUserAction.payload)
                    .pipe(
                        map((user: UserResource) => new UserActions.Update.OneFulfilled(user)),
                        catchError(() => of(new UserActions.Update.OneRejected())));
            }
            )));

    /**
     * @description Upload picture interceptor
     * @type {Observable<Action>}
     */
    public uploadPicture$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.CreateUserPicture),
            withLatestFrom(this._userQueries.observeCurrentUser()),
            mergeMap(([action, currentUser]) => {
                const userId: string = currentUser.id;
                const postUserPictureAction = action as UserPictureActions.CreateOrUpdate.UserPicture;
                const isUserEdited: boolean = postUserPictureAction.isUserEdited;

                return this._userPictureService
                    .upload(userId, postUserPictureAction.payload.picture)
                    .pipe(
                        map((userPicture: UserPictureResource) =>
                            new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(userPicture, isUserEdited)),
                        catchError(() => of(new UserPictureActions.CreateOrUpdate.UserPictureRejected())));
            }
            )));

    /**
     * @description Delete project picture
     * @type {Observable<Action>}
     */
    public deletePicture$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(UserActionEnum.DeleteUserPicture),
            withLatestFrom(this._userQueries.observeCurrentUser()),
            mergeMap(([action, currentUser]) => {

                const deleteUserPictureAction = action as UserPictureActions.Delete.UserPicture;
                const isUserEdited: boolean = deleteUserPictureAction.isUserEdited;

                return this._userPictureService
                    .remove(currentUser.id)
                    .pipe(
                        map(() => new UserPictureActions.Delete.UserPictureFulfilled(currentUser.id, isUserEdited)),
                        catchError(() => of(new UserPictureActions.Delete.UserPictureRejected())));
            })));

    /**
     * @description Update user success interceptor
     * @type {Observable<Action>}
     */
    public requestSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                UserActionEnum.UpdateOneFulfilled,
                UserActionEnum.DeleteUserPictureFulfilled,
                UserActionEnum.CreateUserPictureFulfilled
            ),
            mergeMap((action: Action) => {
                const key = 'User_Edit_SuccessMessage';

                if (action.type === UserActionEnum.DeleteUserPictureFulfilled
                    || action.type === UserActionEnum.CreateUserPictureFulfilled) {
                    const userPictureAction = action.type === UserActionEnum.DeleteUserPictureFulfilled
                        ? action as UserPictureActions.Delete.UserPictureFulfilled
                        : action as UserPictureActions.CreateOrUpdate.UserPictureFulfilled;

                    return userPictureAction.isUserEdited ? [] : [new AlertActions.Add.SuccessAlert({message: {key}})];
                }
                return [new AlertActions.Add.SuccessAlert({message: {key}})];
            })));
}
