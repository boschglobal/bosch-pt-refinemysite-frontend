/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {MarkerSize} from './marker.component';

@Component({
    selector: 'ss-marker-test',
    templateUrl: './marker.test.component.html',
    styleUrls: ['./marker.test.component.scss'],
})
export class MarkerTestComponent {

    public isCritical: boolean;

    public isVisible: boolean;

    public size: MarkerSize;

    public triggerAnimation: boolean;

    public withBorder: boolean;

}
