/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnDestroy
} from '@angular/core';

import {MockCallService} from '../../../../test/mocks/services/mock-call.service';

@Component({
    selector: 'ss-flyout-content-test',
    templateUrl: 'flyout-content.test.component.html',
})
export class FlyoutContentTestComponent implements OnDestroy {

    @Input()
    public automationAttr = 'flyout-component-content';

    @Input()
    public content: string;

    constructor(private _mockCallService: MockCallService) {
    }

    ngOnDestroy() {
        this._mockCallService.call();
    }
}
