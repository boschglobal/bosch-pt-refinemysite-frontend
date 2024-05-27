/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {LogsEvent} from '@datadog/browser-logs';
import {LogsPublicApi} from '@datadog/browser-logs/cjs/boot/logsPublicApi';
import {LogsInitConfiguration} from '@datadog/browser-logs/cjs/domain/configuration';
import {RumPublicApi} from '@datadog/browser-rum-core';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {UserQueries} from '../../../user/store/user/user.queries';
import {EnvironmentHelper} from '../../misc/helpers/environment.helper';
import {WINDOW_TOKEN} from '../../misc/injection-tokens/window';
import {UserPrivacySettings} from '../../privacy/api/resources/user-privacy-settings.resource';
import {
    DATADOG_LOGS,
    DATADOG_RUM
} from '../monitoring.module';
import {MonitoringHelper} from './monitoring.helper';

describe('Monitoring Helper', () => {
    let monitoringHelper: MonitoringHelper;
    let datadogLogs: jasmine.SpyObj<LogsPublicApi>;
    let datadogRum: jasmine.SpyObj<RumPublicApi>;
    let window: any;

    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);
    const userQueries: UserQueries = mock(UserQueries);
    const defaultErrorLog: LogsEvent = {
        date: Date.now(),
        message: '',
        status: 'error',
        view: {
            url: '',
        },
        http: {
            method: 'POST',
            url: '',
            status_code: 500,
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: DATADOG_LOGS,
                useValue: jasmine.createSpyObj('LogsPublicApi', ['init']),
            },
            {
                provide: DATADOG_RUM,
                useValue: jasmine.createSpyObj('RumPublicApi', ['init', 'addAction']),
            },
            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelper),
            },
            {
                provide: WINDOW_TOKEN,
                useValue: ({
                    location: jasmine.createSpyObj('location', ['reload']),
                }),
            },
            MonitoringHelper,
            {
                provide: UserQueries,
                useFactory: () => instance(userQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        monitoringHelper = TestBed.inject(MonitoringHelper);
        datadogLogs = TestBed.inject(DATADOG_LOGS) as jasmine.SpyObj<LogsPublicApi>;
        datadogRum = TestBed.inject(DATADOG_RUM) as jasmine.SpyObj<RumPublicApi>;
        window = TestBed.inject(WINDOW_TOKEN);

        datadogLogs.init.calls.reset();
        datadogRum.init.calls.reset();
        window.location.reload.calls.reset();
    });

    it('should enable Real User Monitoring when running on a Stage and performance tracking is enabled on user privacy settings', () => {
        const env = 'dev';
        const privacySettings = new UserPrivacySettings();
        const userPrivacySettingsSubject = new Subject<UserPrivacySettings>();
        privacySettings.performance = true;

        when(environmentHelper.getStage()).thenReturn(env);
        when(userQueries.observeUserPrivacySettings()).thenReturn(userPrivacySettingsSubject);

        monitoringHelper.configRealUserMonitoring();

        userPrivacySettingsSubject.next(privacySettings);

        expect(datadogRum.init).toHaveBeenCalledWith(jasmine.objectContaining({env}));
    });

    it('should not enable Real User Monitoring and not call window location reload when running on a Stage and ' +
        'performance tracking is not enabled on user privacy settings', () => {
        const env = 'dev';
        const privacySettings = new UserPrivacySettings();
        const userPrivacySettingsSubject = new Subject<UserPrivacySettings>();
        privacySettings.performance = false;

        when(environmentHelper.getStage()).thenReturn(env);
        when(userQueries.observeUserPrivacySettings()).thenReturn(userPrivacySettingsSubject);

        monitoringHelper.configRealUserMonitoring();

        userPrivacySettingsSubject.next(privacySettings);

        expect(datadogRum.init).not.toHaveBeenCalled();
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should not enable Real User Monitoring or call window location reload when running on a Stage ' +
        'and user privacy settings is NULL', () => {
        const env = 'dev';

        when(environmentHelper.getStage()).thenReturn(env);
        when(userQueries.observeUserPrivacySettings()).thenReturn(of(null));

        monitoringHelper.configRealUserMonitoring();

        expect(datadogRum.init).not.toHaveBeenCalled();
        expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should enable Real User Monitoring when running on a Stage and performance tracking changes from disabled to enable ' +
        'on user privacy settings', () => {
        let privacySettings = new UserPrivacySettings();
        const env = 'dev';
        const userPrivacySettingsSubject = new Subject<UserPrivacySettings>();

        privacySettings.performance = false;

        when(environmentHelper.getStage()).thenReturn(env);
        when(userQueries.observeUserPrivacySettings()).thenReturn(userPrivacySettingsSubject);

        monitoringHelper.configRealUserMonitoring();

        userPrivacySettingsSubject.next(privacySettings);

        expect(datadogRum.init).not.toHaveBeenCalled();

        privacySettings = new UserPrivacySettings();
        privacySettings.performance = true;

        userPrivacySettingsSubject.next(privacySettings);

        expect(datadogRum.init).toHaveBeenCalledWith(jasmine.objectContaining({env}));
    });

    it('should call window location reload when running on a Stage and performance tracking changes from enable to disabled ' +
        'on user privacy settings', () => {
        let privacySettings = new UserPrivacySettings();
        const env = 'dev';
        const userPrivacySettingsSubject = new Subject<UserPrivacySettings>();

        privacySettings.performance = true;

        when(environmentHelper.getStage()).thenReturn(env);
        when(userQueries.observeUserPrivacySettings()).thenReturn(userPrivacySettingsSubject);

        monitoringHelper.configRealUserMonitoring();

        userPrivacySettingsSubject.next(privacySettings);

        expect(datadogRum.init).toHaveBeenCalledWith(jasmine.objectContaining({env}));

        privacySettings = new UserPrivacySettings();
        privacySettings.performance = false;

        userPrivacySettingsSubject.next(privacySettings);

        expect(window.location.reload).toHaveBeenCalled();
    });

    it('should not enable Real User Monitoring when running on Localhost', () => {
        const env = null;

        when(environmentHelper.getStage()).thenReturn(env);

        monitoringHelper.configRealUserMonitoring();

        expect(datadogRum.init).not.toHaveBeenCalled();
    });

    it('should enable Logs when running on a Stage', () => {
        const env = 'dev';

        when(environmentHelper.getStage()).thenReturn(env);

        monitoringHelper.configLogCollection();

        expect(datadogLogs.init).toHaveBeenCalledWith(jasmine.objectContaining({env}));
    });

    it('should not enable Logs when running on Localhost', () => {
        const env = null;

        when(environmentHelper.getStage()).thenReturn(env);

        monitoringHelper.configLogCollection();

        expect(datadogLogs.init).not.toHaveBeenCalled();
    });

    it('should discard unknown network errors', () => {
        const env = 'dev';
        const unknownErrorLog: LogsEvent = {
            ...defaultErrorLog,
            http: {
                method: 'POST',
                url: '',
                status_code: 0,
            },
        };
        let logsInitConfiguration: LogsInitConfiguration;

        datadogLogs.init.and.callFake(configuration => logsInitConfiguration = configuration);
        when(environmentHelper.getStage()).thenReturn(env);

        monitoringHelper.configLogCollection();

        expect(logsInitConfiguration.beforeSend(unknownErrorLog)).toBe(false);
    });

    it('should not discard known network errors', () => {
        const env = 'dev';
        const knownErrorLog: LogsEvent = {
            ...defaultErrorLog,
            http: {
                method: 'POST',
                url: '',
                status_code: 500,
            },
        };
        let logsInitConfiguration: LogsInitConfiguration;

        datadogLogs.init.and.callFake(configuration => logsInitConfiguration = configuration);
        when(environmentHelper.getStage()).thenReturn(env);

        monitoringHelper.configLogCollection();

        expect(logsInitConfiguration.beforeSend(knownErrorLog)).toBe(true);
    });

    describe('Monitoring Helper - Real User Monitoring', () => {

        beforeEach(() => {
            const privacySettings = new UserPrivacySettings();
            const env = 'dev';
            const userPrivacySettingsSubject = new Subject<UserPrivacySettings>();
            privacySettings.performance = true;

            when(environmentHelper.getStage()).thenReturn(env);
            when(userQueries.observeUserPrivacySettings()).thenReturn(userPrivacySettingsSubject);

            monitoringHelper.configRealUserMonitoring();

            userPrivacySettingsSubject.next(privacySettings);
        });

        it('should send a Real User Monitoring action with custom name and context', () => {
            const actionName = 'foo';
            const actionContext = {
                foo: 'bar',
            };

            monitoringHelper.addUserAction(actionName, actionContext);

            expect(datadogRum.addAction).toHaveBeenCalledWith(actionName, actionContext);
        });
    });
});
