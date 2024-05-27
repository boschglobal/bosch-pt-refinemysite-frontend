/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Inject,
    Injectable,
} from '@angular/core';
import {LogsPublicApi} from '@datadog/browser-logs/cjs/boot/logsPublicApi';
import {RumPublicApi} from '@datadog/browser-rum-core';
import {Subscription} from 'rxjs';
import {
    distinctUntilKeyChanged,
    filter
} from 'rxjs/operators';

import {UserQueries} from '../../../user/store/user/user.queries';
import {EnvironmentHelper} from '../../misc/helpers/environment.helper';
import {WINDOW_TOKEN} from '../../misc/injection-tokens/window';
import {UserPrivacySettings} from '../../privacy/api/resources/user-privacy-settings.resource';
import {StatusCodeEnum} from '../../rest/interceptor/http-services.interceptor';
import {
    DATADOG_LOGS,
    DATADOG_RUM
} from '../monitoring.module';

@Injectable({
    providedIn: 'root',
})
export class MonitoringHelper {

    private _realUserMonitoringInitialized = false;

    private _userPrivacySettingsSubscription = new Subscription();

    constructor(@Inject(DATADOG_LOGS) private _datadogLogs: LogsPublicApi,
                @Inject(DATADOG_RUM) private _datadogRum: RumPublicApi,
                private _environmentHelper: EnvironmentHelper,
                private _userQueries: UserQueries,
                @Inject(WINDOW_TOKEN) private _window: Window,
    ) {
    }

    public configLogCollection(): void {
        if (this._canEnableMonitoring()) {
            this._datadogLogs.init({
                ...this._getBaseConfig(),
                forwardErrorsToLogs: true,
                beforeSend: log => !(log.http && log.http.status_code === StatusCodeEnum.NotDefined),
            });
        }
    }

    public configRealUserMonitoring(): void {
        if (this._canEnableMonitoring()) {
            this._configRealUserMonitoringBasedOnUserPrivacySettings();
        }
    }

    public addUserAction(name: string, context?: object): void {
        this._datadogRum.addAction(name, context);
    }

    private _configRealUserMonitoringBasedOnUserPrivacySettings(): void {
        this._userPrivacySettingsSubscription.unsubscribe();
        this._userPrivacySettingsSubscription = this._userQueries.observeUserPrivacySettings()
            .pipe(
                filter(userPrivacySettings => !!userPrivacySettings),
                distinctUntilKeyChanged('performance')
            )
            .subscribe(userPrivacySettings => this._handleRealUserMonitoringByUserPrivacySettings(userPrivacySettings));
    }

    private _handleRealUserMonitoringByUserPrivacySettings({performance}: UserPrivacySettings): void {
        if (performance) {
            this._initializeRealUserMonitoring();
        } else if (this._realUserMonitoringInitialized) {
            this._window.location.reload();
        }
    }

    private _initializeRealUserMonitoring(): void {
        this._realUserMonitoringInitialized = true;
        this._datadogRum.init({
            ...this._getBaseConfig(),
            applicationId: '0284ddae-d410-47af-b120-05dd2fbd3f43',
            trackInteractions: true,
        });
    }

    private _getBaseConfig() {
        return {
            clientToken: 'pub4cf83ad2dc6ea8c7fe54564f3b8d09ce',
            site: 'datadoghq.eu',
            sampleRate: 100,
            env: this._environmentHelper.getStage(),
            service: 'csm-web-app-browser',
            version: '1.0.0',
        };
    }

    private _canEnableMonitoring(): boolean {
        return !!this._environmentHelper.getStage();
    }
}
