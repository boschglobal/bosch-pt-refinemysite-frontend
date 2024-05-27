/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AlertMessageResource} from './alert-message.resource';
import {AlertTypeEnum} from '../../enums/alert-type.enum';
import {UUID} from '../../../misc/identification/uuid';

export class AlertResource {

    constructor(public type: AlertTypeEnum,
                public message: AlertMessageResource,
                public id?: string) {

        if (!this.id) {
            this.id = UUID.v4();
        }
    }
}
