/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

@Component({
    selector: 'ss-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    public footerCopyrightYearConfig: FooterDataConfig = {
        currentYear: new Date().getFullYear().toString()
    };
}

export interface FooterDataConfig {
    currentYear: string;
}
