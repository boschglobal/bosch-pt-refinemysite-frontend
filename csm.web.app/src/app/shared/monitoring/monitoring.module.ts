/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {
    InjectionToken,
    NgModule
} from '@angular/core';
import {datadogLogs} from '@datadog/browser-logs';
import {LogsPublicApi} from '@datadog/browser-logs/cjs/boot/logsPublicApi';
import {datadogRum} from '@datadog/browser-rum';
import {RumPublicApi} from '@datadog/browser-rum-core';

import {WINDOW_TOKEN} from '../misc/injection-tokens/window';

export const DATADOG_LOGS = new InjectionToken<LogsPublicApi>('Datadog Logs');
export const DATADOG_RUM = new InjectionToken<RumPublicApi>('Datadog Real User Monitoring');

@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        {
            provide: DATADOG_LOGS,
            useValue: datadogLogs,
        },
        {
            provide: DATADOG_RUM,
            useValue: datadogRum,
        },
        {
            provide: WINDOW_TOKEN,
            useValue: window,
        },
    ],
})
export class MonitoringModule {
}
