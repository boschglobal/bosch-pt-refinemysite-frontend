/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {PhoneNumber} from '../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {GenderEnum} from '../../../../../shared/misc/enums/gender.enum';
import {
    ProfileModel,
    ProfilePhoneNumberModel
} from '../../../../../shared/misc/presentationals/profile/profile.model';
import {UserResource} from '../../../../api/resources/user.resource';
import {UserActions} from '../../../../store/user/user.actions';
import {UserQueries} from '../../../../store/user/user.queries';

@Component({
    templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit, OnDestroy {

    /**
     * @description Property with profile model
     */
    public profile: ProfileModel;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _store: Store<State>,
                private _translateService: TranslateService,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._userQueries
                .observeCurrentUser()
                .subscribe((user: UserResource) => this._setProfile(user)));

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._store.dispatch(new UserActions.Request.Current())));

    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setProfile(user: UserResource): void {
        const {_embedded, gender, firstName, lastName, position, crafts, phoneNumbers, email, locale, country} = user;
        const isMale: boolean = gender === GenderEnum[GenderEnum.male].toUpperCase();
        this.profile = {
            picture: _embedded.profilePicture._links.small.href,
            gender: `${isMale ? 'Mr' : 'Ms'}`,
            name: `${firstName} ${lastName}`,
            position,
            crafts: crafts.map((craft: ResourceReference) => craft.displayName).join(', '),
            phoneNumbers: this._parsePhoneNumbers(phoneNumbers),
            email,
            locale,
            country,
        };
    }

    private _parsePhoneNumbers(phoneNumbers: PhoneNumber[]): ProfilePhoneNumberModel[] {
        const parsedPhoneNumbers: ProfilePhoneNumberModel[] = [];

        phoneNumbers.forEach((phoneNumber: PhoneNumber) =>
            parsedPhoneNumbers.push({
                label: phoneNumber.phoneNumberType,
                value: `${phoneNumber.countryCode} ${phoneNumber.phoneNumber}`
            })
        );

        return parsedPhoneNumbers;
    }
}
