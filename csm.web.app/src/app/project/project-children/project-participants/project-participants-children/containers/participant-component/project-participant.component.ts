/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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

import {State} from '../../../../../../app.reducers';
import {PhoneNumber} from '../../../../../../shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {GenderEnum} from '../../../../../../shared/misc/enums/gender.enum';
import {
    ProfileModel,
    ProfilePhoneNumberModel
} from '../../../../../../shared/misc/presentationals/profile/profile.model';
import {ProjectParticipantResource} from '../../../../../project-common/api/participants/resources/project-participant.resource';
import {ProjectParticipantActions} from '../../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../../project-common/store/participants/project-participant.queries';

@Component({
    selector: 'ss-project-participant',
    templateUrl: './project-participant.component.html'
})
export class ProjectParticipantComponent implements OnInit, OnDestroy {
    /**
     * @description Property with profile model
     */
    public profile: ProfileModel;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _participant: ProjectParticipantResource;

    constructor(private _projectParticipantQueries: ProjectParticipantQueries,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectParticipantQueries
                .observeCurrentProjectParticipant()
                .subscribe((participant: ProjectParticipantResource) => {
                    this._participant = participant;
                    this._setProfile();
                }));

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._requestParticipant()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _requestParticipant(): void {
        this._store.dispatch(new ProjectParticipantActions.Request.One(this._participant.id));
    }

    private _setProfile(): void {
        if (!this._participant) {
            return;
        }

        const {gender, user, projectRole, crafts, email, phoneNumbers} = this._participant;

        this.profile = {
            picture: user.picture,
            gender: this._getGender(gender),
            name: user.displayName,
            role: projectRole,
            crafts: crafts?.map((craft: ResourceReference) => craft.displayName).join(', ') || '',
            phoneNumbers: this._parsePhoneNumbers(phoneNumbers),
            email
        };
    }

    private _getGender(gender: string): string {
        const isMale: boolean = gender === GenderEnum[GenderEnum.male].toUpperCase();
        return isMale ? 'Mr' : 'Ms';
    }

    private _parsePhoneNumbers(phoneNumbers: PhoneNumber[]): ProfilePhoneNumberModel[] {
        const parsedPhoneNumbers: ProfilePhoneNumberModel[] = [];

        phoneNumbers.forEach((phoneNumber: PhoneNumber) => {
            parsedPhoneNumbers.push({
                label: phoneNumber.phoneNumberType,
                value: `${phoneNumber.countryCode} ${phoneNumber.phoneNumber}`
            });
        });

        return parsedPhoneNumbers;
    }
}
