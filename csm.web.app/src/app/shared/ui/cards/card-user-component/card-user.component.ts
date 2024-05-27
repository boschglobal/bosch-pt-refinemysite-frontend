/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgStyle} from '@angular/common';
import {
    Component,
    Input,
    OnInit
} from '@angular/core';

import {
    USER_STATUS_ENUM_HELPER,
    UserStatusEnum
} from '../../../../project/project-common/enums/user-status.enum';
import {ResourceReference} from '../../../misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {COLORS} from '../../constants/colors.constant';
import {FlyoutService} from '../../flyout/service/flyout.service';

@Component({
    selector: 'ss-card-user',
    templateUrl: './card-user.component.html',
    styleUrls: ['./card-user.component.scss'],
})
export class CardUserComponent implements OnInit {

    /**
     * @description Input for the user card size
     */
    @Input() public size: CardUserSize = 'normal';

    /**
     * @description Input to get user information
     */
    @Input() public user: ResourceReferenceWithPicture;

    /**
     * @description Input to get user status
     */
    @Input() public set status(status: UserStatusEnum) {
        this._status = status;
        switch (this._status) {
            case UserStatusEnum.ACTIVE:
                this.isUserActive = true;
                this.isUserInvited = false;
                this.isUserInValidation = false;
                break;
            case UserStatusEnum.INVITED:
                this.isUserActive = false;
                this.isUserInvited = true;
                this.isUserInValidation = false;
                break;
            case UserStatusEnum.VALIDATION:
                this.isUserActive = false;
                this.isUserInvited = false;
                this.isUserInValidation = true;
                break;
        }
    }

    /**
     * @description Input to get company information
     */
    @Input() public company?: ResourceReference;

    /**
     * @description Input to get description information
     */
    @Input() public description?: string;

    /**
     * @description Input to get phone information
     */
    @Input() public phone?: string;

    /**
     * @description Input to get email information
     */
    @Input() public email?: string;

    /**
     * @description Input to add image styles to special use cases
     * @type NgStyle
     */
    @Input() public imgStyle: NgStyle;

    /**
     * @description Input to add title styles to special use cases
     */
    @Input() public titleStyle: NgStyle;

    /**
     * @description Input to add description styles to special use cases
     */
    @Input() public descriptionStyle: NgStyle;

    /**
     * @description Input for translation key for validation status message
     */
    @Input() public validationStatusTooltipMessage: string;

    /**
     * @description Input for translation key for invited status message
     */
    @Input() public invitedStatusTooltipMessage: string;

    public flyoutTooltipId;

    public iconInfoMarker: string = COLORS.light_grey;

    public isUserActive = true;

    public isUserInvited = false;

    public isUserInValidation = false;

    private _status: UserStatusEnum = UserStatusEnum.ACTIVE;

    constructor(private _flyoutService: FlyoutService) {
    }

    ngOnInit() {
        this.flyoutTooltipId = `ssUserStatusTooltip-${this.user.id}`;
    }

    /**
     * @description Retrieve css modifier for css class given as param
     * @param {string} cssClass
     * @returns {Object}
     */
    public getCssClassModifier(cssClass: string): Object {
        return {
            [`${cssClass}--${this.size}`]: true,
        };
    }

    /**
     * @description Retrieve card title
     * @returns {string}
     */
    public getTitle(): string {
        return this.company ? this.company.displayName : this.user.displayName;
    }

    /**
     * @description Retrieve card description
     * @returns {string}
     */
    public getDescription(): string {
        let description: string = null;

        if (this.company) {
            description = this.user.displayName;
        } else if (this.description) {
            description = this.description;
        }

        return description;
    }

    /**
     * @description Retrieves the user status label using a given key
     * @returns {string}
     */
    public get getStatusKey(): string {
        return USER_STATUS_ENUM_HELPER.getLabelByKey(this._status);
    }

    /**
     * @description Retrieves whether the contacts should be shown or not
     * @returns {boolean}
     */
    public showContacts(): boolean {
        return this.size === 'large' && !!(this.email || this.phone);
    }

    /**
     * @description Opens a flyout with a given flyoutId
     * @param {Event} $event
     * @param {string} flyoutId
     * @returns {void}
     */
    public openFlyout($event: Event, flyoutId: string): void {
        $event.stopPropagation();
        this._flyoutService.open(flyoutId);
    }
}

export type CardUserSize = 'large' | 'normal' | 'small' | 'tiny';
