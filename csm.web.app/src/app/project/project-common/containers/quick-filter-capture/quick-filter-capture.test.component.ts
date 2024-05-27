/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {QuickFilterCaptureFormData} from './quick-filter-capture.component';

@Component({
    selector: 'ss-quick-filter-capture-test',
    templateUrl: 'quick-filter-capture.test.component.html',
})
export class QuickFilterCaptureTestComponent {
    public defaultValue: QuickFilterCaptureFormData = {
        name: '',
        projectFilter: {
            task: null,
            milestone: null,
        },
    };
}
