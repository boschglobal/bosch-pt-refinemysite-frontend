/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AlertResource} from '../../app/shared/alert/api/resources/alert.resource';
import {AlertTypeEnum} from '../../app/shared/alert/enums/alert-type.enum';

export const ERROR_ALERT_MOCK: AlertResource = {
    type: AlertTypeEnum.Success,
    message: {
        key: 'Generic_Error',
        params: {},
    },
    id: 'foo',
};

export const SUCCESS_ALERT_MOCK: AlertResource = {
    type: AlertTypeEnum.Success,
    message: {
        text: 'You did it! Yeah!',
    },
    id: 'bar',
};
