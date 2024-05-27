/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {isEqualWith} from 'lodash';
import * as moment from 'moment/moment';

import {DateHelper} from '../../../ui/dates/date.helper.service';

export class AbstractFiltersCriteria {
    public from?: moment.Moment;
    public to?: moment.Moment;

    public static isEqual<T extends AbstractFiltersCriteria>(criteriaA: T, criteriaB: T): boolean {
        return isEqualWith(criteriaA, criteriaB, (valueA, valueB, key: keyof T) =>
            key === 'from' || key === 'to' ? DateHelper.isSameDay(valueA, valueB) : undefined);
    }
}
