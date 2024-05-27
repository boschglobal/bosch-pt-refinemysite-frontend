/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {MAT_CHECKBOX_DEFAULT_OPTIONS} from '@angular/material/checkbox';

import {UserResource} from '../../../api/resources/user.resource';
import {countryEnumHelper} from '../../enums/country.enum';

@Component({
    selector: 'ss-user-description-details',
    templateUrl: './user-description-details.component.html',
    styleUrls: ['./user-description-details.component.scss'],
    providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'noop'}}],
})
export class UserDescriptionDetailsComponent {

    /**
     * @description Property to define when the capture has the mode to create or edit
     */
    @Input()
    user: UserResource;

    /**
     * @description Emits when editing the user admin state
     * @type {EventEmitter<UserResource>}
     */
    @Output()
    public editAdmin: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * @description Emits when editing the user locked state
     * @type {EventEmitter<UserResource>}
     */
    @Output()
    public editLock: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * @description Emits when deleting the employee
     * @type {EventEmitter<UserResource>}
     */
    @Output()
    public delete: EventEmitter<UserResource> = new EventEmitter<UserResource>();

    public get getCountryKey(): string {
        return this.user.country ? countryEnumHelper.getLabelByValue(this.user.country) : 'Generic_NotDefined';
    }

    public handleEditAdmin() {
        this.editAdmin.emit(!this.user.admin);
    }

    public handleEditLock() {
        this.editLock.emit(!this.user.locked);
    }

    public handleDelete() {
        if (this.canDelete(this.user)) {
            this.delete.emit(this.user);
        }
    }

    public canDelete(user: UserResource) {
        return user._links.hasOwnProperty('delete');
    }
}
