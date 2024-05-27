/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {UUID} from '../../../misc/identification/uuid';
import {AlertTypeEnum} from '../../enums/alert-type.enum';
import {AlertMessageResource} from './alert-message.resource';

export class AlertResource {

    constructor(public type: AlertTypeEnum,
                public message: AlertMessageResource,
                public id?: string) {

        if (!this.id) {
            this.id = UUID.v4();
        }
    }
}
