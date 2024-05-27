/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'ss-scope-dropdown-test',
    templateUrl: './scope-dropdown.test.component.html',
})
export class ScopeDropdownTestComponent {

    @Input()
    public scopeStart: moment.Moment;

    @Input()
    public scopeDuration: number;

    @Output()
    public scopeStartChange: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();
}
