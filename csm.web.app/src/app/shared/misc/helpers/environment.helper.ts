/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';

import {configuration} from '../../../../configurations/configuration';
import {configuration as dev} from '../../../../configurations/configuration.local-with-dev-backend';
import {configuration as sandbox1} from '../../../../configurations/configuration.local-with-sandbox1-backend';
import {configuration as sandbox2} from '../../../../configurations/configuration.local-with-sandbox2-backend';
import {configuration as sandbox3} from '../../../../configurations/configuration.local-with-sandbox3-backend';
import {configuration as sandbox4} from '../../../../configurations/configuration.local-with-sandbox4-backend';
import {configuration as prod} from '../../../../configurations/configuration.production';
import {configuration as review} from '../../../../configurations/configuration.review';
import {configuration as test1} from '../../../../configurations/configuration.test1';
import {EnvironmentConfig} from '../../../../configurations/interfaces/environment-config.interface';

const CONFIGURATIONS: { [key: string]: EnvironmentConfig } = {
    dev,
    review,
    sandbox1,
    sandbox2,
    sandbox3,
    sandbox4,
    test1,
    prod,
};
const PROD_SIGNATURE_REGEX = /app.bosch-refinemysite.com/;
const STAGE_SIGNATURE_REGEX = /(.*).bosch-refinemysite.com/;

@Injectable({
    providedIn: 'root',
})
export class EnvironmentHelper {

    public host: string = location.host;

    public isProduction(): boolean {
        return PROD_SIGNATURE_REGEX.test(this.host);
    }

    public getStage(): string {
        const matchStage = this.host.match(STAGE_SIGNATURE_REGEX);
        const stage = matchStage ? matchStage[1] : null;

        return stage === 'app' ? 'prod' : stage;
    }

    public getConfiguration(): EnvironmentConfig {
        const stage = this.getStage();

        return stage ? CONFIGURATIONS[stage] : configuration;
    }
}
