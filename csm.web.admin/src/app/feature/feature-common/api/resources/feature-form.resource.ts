/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {FeatureStateEnum} from './feature.resource';

export class FeatureFormResource {
    name: string;
    status: FeatureStateEnum;

    constructor(name: string, status: string) {
        this.name = name;
        this.status = status.replace('_', '') as FeatureStateEnum;
    }

}
