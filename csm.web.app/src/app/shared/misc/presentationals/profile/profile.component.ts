/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';

import {EmployeeRoleEnumHelper} from '../../../../project/project-common/enums/employee-role.enum';
import {countryEnumHelper} from '../../../../user/user-common/enums/country.enum';
import {AuthService} from '../../../authentication/services/auth.service';
import {LanguageEnumHelper} from '../../../translation/helper/language.enum';
import {COLORS} from '../../../ui/constants/colors.constant';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {PhoneDescriptionEnumHelper} from '../../data/phone-description.enum';
import {ModalIdEnum} from '../../enums/modal-id.enum';
import {
    ProfileModel,
    ProfilePhoneNumberModel
} from './profile.model';

@Component({
    selector: 'ss-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {

    /**
     * @description Property with profile model input
     * @param {ProfileModel} profile
     */
    @Input()
    set profile(profile: ProfileModel) {
        this.profileModel = profile;
    }

    /**
     * @description Property to manage the display of details of current user profile
     */
    @Input()
    public ownProfile = false;

    /**
     * @description Property to manage the display of the toolbar
     */
    @Input()
    public showToolbar = true;

    /**
     * @description Property with the URL for the user profile edit page
     */
    public editProfilePageUrl = ['../edit'];

    /**
     * @description Property with model to apply in the view
     */
    public profileModel: ProfileModel;

    /**
     * @description Property with the color for the toolbar inline buttons
     */
    public toolbarInlineButtonsColor = COLORS.black;

    public get getRoleKey(): string {
        return EmployeeRoleEnumHelper.getLabelByKey(this.profileModel.role);
    }

    public get getLanguageKey(): string {
        return LanguageEnumHelper.getLabelByValue(this.profileModel.locale);
    }

    public get getCountryKey(): string {
        return countryEnumHelper.getLabelByValue(this.profileModel.country);
    }

    constructor(private _authService: AuthService,
                private _modalService: ModalService) {
    }

    /**
     * @description Track by function for path
     * @param {number} index
     * @param {ProfilePhoneNumberModel} item
     * @returns {number}
     */
    public trackByFn(index: number, item: any): number {
        return index;
    }

    /**
     * @description Get phone type key for translate
     * @param {ProfilePhoneNumberModel} phoneNumber
     * @returns {string}
     */
    public getPhoneTypeKey(phoneNumber: ProfilePhoneNumberModel): string {
        const formattedLabel: string = phoneNumber.label.charAt(0).toUpperCase() + phoneNumber.label.slice(1).toLowerCase();
        return PhoneDescriptionEnumHelper.getLabelByKey(formattedLabel);
    }

    public handleSingleKeyId(): void {
        this._authService.changePassword();
    }

    public handleChangePrivacySettings(): void {
        this._modalService.open({
            id: ModalIdEnum.PrivacySettings,
            data: null,
        });
    }
}
