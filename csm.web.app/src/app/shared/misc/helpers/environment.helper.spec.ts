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

import {configuration} from '../../../../configurations/configuration';
import {configuration as configurationDev} from '../../../../configurations/configuration.local-with-dev-backend';
import {configuration as configurationProd} from '../../../../configurations/configuration.production';
import {EnvironmentHelper} from './environment.helper';

describe('Environment Helper', () => {
    let environmentHelper: EnvironmentHelper;

    const prodHost = 'app.bosch-refinemysite.com';
    const devHost = 'dev.bosch-refinemysite.com';
    const localHost = 'localhost';

    const moduleDef: TestModuleMetadata = {
        providers: [EnvironmentHelper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => environmentHelper = TestBed.inject(EnvironmentHelper));

    it('should return TRUE when running on Production Stage', () => {
        environmentHelper.host = prodHost;

        expect(environmentHelper.isProduction()).toBeTruthy();
    });

    it('should return FALSE when running on non Production Stage ', () => {
        environmentHelper.host = devHost;

        expect(environmentHelper.isProduction()).toBeFalsy();
    });

    it('should return Prod configuration when running on Production Stage', () => {
        environmentHelper.host = prodHost;

        expect(environmentHelper.getConfiguration()).toEqual(configurationProd);
    });

    it('should return Dev configuration when running on Dev Stage', () => {
        environmentHelper.host = devHost;

        expect(environmentHelper.getConfiguration()).toEqual(configurationDev);
    });

    it('should return default running configuration when running on Localhost', () => {
        environmentHelper.host = localHost;

        expect(environmentHelper.getConfiguration()).toEqual(configuration);
    });

    it('should return "prod" when getStage is called and running on Production Stage', () => {
        environmentHelper.host = prodHost;

        expect(environmentHelper.getStage()).toBe('prod');
    });

    it('should return "dev" when getStage is called and running on Dev Stage', () => {
        environmentHelper.host = devHost;

        expect(environmentHelper.getStage()).toBe('dev');
    });

    it('should return null when getStage is called and running on Localhost', () => {
        environmentHelper.host = localHost;

        expect(environmentHelper.getStage()).toBeNull();
    });
});
