/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import {
    isEqual,
    omit
} from 'lodash';
import {
    Observable,
    of,
    Subscription,
    zip
} from 'rxjs';
import {
    filter,
    switchMap
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {CraftResource} from '../../../../../craft/api/resources/craft.resource';
import {CraftActions} from '../../../../../shared/master-data/store/crafts/craft.actions';
import {CraftSliceService} from '../../../../../shared/master-data/store/crafts/craft-slice.service';
import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {FormGroupPhoneValueInterface} from '../../../../../shared/misc/presentationals/form-group-phone/form-group-phone.component';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {SaveUserResource} from '../../../../api/resources/save-user.resource';
import {SaveUserPictureResource} from '../../../../api/resources/save-user-picture.resource';
import {UserResource} from '../../../../api/resources/user.resource';
import {
    UserActions,
    UserPictureActions
} from '../../../../store/user/user.actions';
import {UserQueries} from '../../../../store/user/user.queries';
import {UserCaptureComponentFocus} from '../../../../user-common/presentationals/user-capture-component/user-capture.component';
import {UserCaptureModel} from '../../../../user-common/presentationals/user-capture-component/user-capture.model';

@Component({
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit, OnDestroy {
    /**
     * @description Array with crafts
     * @type {Array}
     */
    public crafts: SelectOption[] = [];

    public focus: UserCaptureComponentFocus;

    /**
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isRequesting = false;

    /**
     * @description Property with default capture values
     * @type {UserCaptureModel}
     */
    public defaultValues: UserCaptureModel = {
        picture: null,
        gender: '',
        firstName: '',
        lastName: '',
        position: '',
        crafts: [],
        phoneNumbers: [],
        email: '',
    };

    /**
     * @description Property injected to present loader view
     * @type {boolean}
     */
    public isLoading = true;

    private _isUserSet: boolean;

    private _areCraftsSet: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _user: UserResource;

    constructor(private _activatedRoute: ActivatedRoute,
                private _blobService: BlobService,
                private _craftSliceService: CraftSliceService,
                private _router: Router,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._requestCrafts();
        this._isUserSet = false;
        this._areCraftsSet = false;
        this._setSubscriptions();
        this._handleFocusQueryParam();
    }

    public _handleFocusQueryParam(): void {
        this.focus = this._activatedRoute.snapshot.queryParamMap.get('focus') as UserCaptureComponentFocus;
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Method called when form submission is triggered
     * @param {UserCaptureModel} user
     */
    public onSubmitEdit(user: UserCaptureModel): void {
        const userData: Object = omit(user, 'picture');
        const defaultValuesData: Object = omit(this.defaultValues, ['picture', 'email']);
        let isUserEdited = false;

        if (!isEqual(userData, defaultValuesData)) {
            const saveUserResource: SaveUserResource = {
                gender: user.gender,
                firstName: user.firstName,
                lastName: user.lastName,
                position: user.position,
                craftIds: user.crafts,
                country: user.country,
                locale: user.locale,
                phoneNumbers: user.phoneNumbers
                    .map((phoneNumber: FormGroupPhoneValueInterface) =>
                        new PhoneNumber(phoneNumber.countryCode, phoneNumber.number, phoneNumber.type)),
            };

            isUserEdited = true;

            this._store.dispatch(new UserActions.Update.One(saveUserResource));
        }

        if (!isEqual(user.picture, this.defaultValues.picture)) {
            if (user.picture === null) {
                this._store.dispatch(new UserPictureActions.Delete.UserPicture(isUserEdited));
            } else {
                const saveUserPictureResource: SaveUserPictureResource = new SaveUserPictureResource(this._user.id, user.picture);
                this._store.dispatch(new UserPictureActions.CreateOrUpdate.UserPicture(saveUserPictureResource, isUserEdited));
            }
        }

        this._disposableSubscriptions.add(
            this._userQueries.observeCurrentUserRequestStatus()
                .pipe(
                    filter(requestStatus => requestStatus !== RequestStatusEnum.progress))
                .subscribe(() => this._navigateBack())
        );
    }

    /**
     * @description Triggered when user capture is cancelled
     */
    public onCancelEdit(): void {
        this._navigateBack();
    }

    private _navigateBack(): void {
        this._router.navigate(['../'], {relativeTo: this._activatedRoute});
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._userQueries.observeCurrentUser()
                .pipe(
                    filter(user => !!user),
                    switchMap((user) => {
                        const getUserPictureUrl = this._getUserPictureUrl(user);

                        return zip(...[
                            of(user),
                            getUserPictureUrl ? this._blobService.getBlob(getUserPictureUrl) : of(null),
                        ]);
                    })
                )
                .subscribe(([user, userPicture]) => {
                    this._user = user;
                    this._setDefaultCaptureValues(user, userPicture);
                })
        );

        this._disposableSubscriptions.add(
            this._craftSliceService
                .observeCraftList()
                .subscribe(crafts => {
                    this.crafts = crafts.map((craft: CraftResource) => ({
                        label: craft.name,
                        value: craft.id,
                    }));
                    this._areCraftsSet = true;
                    this._setIsLoading();
                }));

        this._disposableSubscriptions.add(
            this._userQueries.observeCurrentUserRequestStatus()
                .subscribe(this._handleCaptureState.bind(this)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setUser(user: UserResource): void {
        if (typeof user === 'undefined') {
            return;
        }

        const userPictureUrl = this._getUserPictureUrl(user);

        if (userPictureUrl) {
            this._getUserPicture(userPictureUrl).subscribe(picture => this._setDefaultCaptureValues(user, picture));
        } else {
            this._setDefaultCaptureValues(user);
        }
    }

    private _requestCrafts(): void {
        this._store.dispatch(new CraftActions.Request.Crafts());
    }

    private _getUserPictureUrl(currentUser: UserResource): string {
        return currentUser && currentUser._embedded && currentUser._embedded.profilePicture._links.hasOwnProperty('delete')
            ? currentUser._embedded.profilePicture._links.small.href : null;
    }

    private _getUserPicture(url: string): Observable<any> | null {
        return this._blobService.getBlob(url);
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.isRequesting = requestStatus === RequestStatusEnum.progress;
    }

    private _setDefaultCaptureValues(currentUser: UserResource, picture: File = null): void {
        const {gender, firstName, lastName, position, crafts, phoneNumbers, email, locale, country} = currentUser;

        this.defaultValues = {
            picture,
            gender,
            firstName,
            lastName,
            position,
            crafts: this._getParsedCrafts(crafts),
            phoneNumbers: this._getParsedPhoneNumbers(phoneNumbers),
            email,
            locale,
            country,
        };

        this._isUserSet = true;
        this._setIsLoading();
    }

    private _getParsedPhoneNumbers(phoneNumbers: PhoneNumber[]): FormGroupPhoneValueInterface[] {
        return phoneNumbers.map((phoneNumber: PhoneNumber) => ({
                type: phoneNumber.phoneNumberType,
                countryCode: phoneNumber.countryCode,
                number: phoneNumber.phoneNumber
            }));
    }

    private _getParsedCrafts(crafts: ResourceReference[]): string[] {
        return crafts.map((craft: ResourceReference) => craft.id);
    }

    private _setIsLoading(): void {
        this.isLoading = !(this._isUserSet && this._areCraftsSet);
    }
}
