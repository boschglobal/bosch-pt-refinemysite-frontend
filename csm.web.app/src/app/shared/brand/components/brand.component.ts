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
} from '@angular/core';

@Component({
    selector: 'ss-brand',
    templateUrl: './brand.component.html',
    styleUrls: ['./brand.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {

    public homeUrl: string[] = [''];

}
