/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {EnvironmentConfig} from '../../../../configurations/interfaces/environment-config.interface';
import {EnvironmentHelper} from './environment.helper';
import {FeatureToggleHelper} from './feature-toggle.helper';

describe('Feature Toggle Helper', () => {
    let featureToggleHelper: FeatureToggleHelper;

    const feature = null;
    const configurationWithFeatureEnabled: EnvironmentConfig = {
        features: [feature],
    } as EnvironmentConfig;
    const configurationWithFeatureDisabled: EnvironmentConfig = {
        features: [],
    } as EnvironmentConfig;

    const environmentHelperMock: EnvironmentHelper = mock(EnvironmentHelper);

    const moduleDef: TestModuleMetadata = {
        providers: [
            FeatureToggleHelper,
            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelperMock)
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    it('should check that feature enabled', () => {
        when(environmentHelperMock.getConfiguration()).thenReturn(configurationWithFeatureEnabled);

        featureToggleHelper = TestBed.inject(FeatureToggleHelper);

        expect(featureToggleHelper.isFeatureActive(feature)).toBeTruthy();
    });

    it('should check that feature is disabled', () => {
        when(environmentHelperMock.getConfiguration()).thenReturn(configurationWithFeatureDisabled);

        featureToggleHelper = TestBed.inject(FeatureToggleHelper);

        expect(featureToggleHelper.isFeatureActive(feature)).toBeFalsy();
    });
});
