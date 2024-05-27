/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Directive,
    HostListener,
    Input
} from '@angular/core';

import {MonitoringHelper} from '../helpers/monitoring.helper';

@Directive({
    selector: '[ssMonitorClickAction]',
    standalone: true,
})
export class MonitorClickActionDirective {

    @Input()
    public ssMonitorClickAction: string;

    @Input()
    public ssMonitorClickActionContext: object;

    constructor(private _monitoringHelper: MonitoringHelper) {
    }

    @HostListener('click')
    public handleClick(): void {
        this._monitoringHelper.addUserAction(this.ssMonitorClickAction, this.ssMonitorClickActionContext);
    }
}
