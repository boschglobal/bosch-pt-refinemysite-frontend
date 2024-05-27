/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component
} from '@angular/core';

@Component({
    selector: 'ss-copyright',
    templateUrl: './copyright.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyrightComponent {
}
