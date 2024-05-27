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
    Input
} from '@angular/core';

@Component({
    selector: 'ss-card-company',
    templateUrl: './card-company.component.html',
    styleUrls: ['./card-company.component.scss'],
})
export class CardCompanyComponent {

    /**
     * @description Input to get company information
     */
    @Input() public company: CardCompany;

    /**
     * @description Input to add span styles to special use cases
     */
    @Input() public spanStyle: NgStyle;

    /**
     * @description Retrieve company display name
     * @returns {string}
     */
    public getDisplayName(): string {
        return this.company.displayName;
    }
}

export interface CardCompany {
    displayName: string;
}
