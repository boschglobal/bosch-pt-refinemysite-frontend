/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {unitOfTime} from 'moment';
import * as moment from 'moment';

import {
    DateParserStrategy,
    DateParserStrategyInclusivityType
} from '../../app/shared/ui/dates/date-parser.strategy';

export class DateParserStrategyStub implements DateParserStrategy {
    public startOf(referenceDate = moment(), unit?: unitOfTime.StartOf): moment.Moment {
        return referenceDate.clone().startOf(unit);
    }

    public endOf(referenceDate = moment(), unit?: unitOfTime.StartOf): moment.Moment {
        return referenceDate.clone().endOf(unit);
    }

    public startOfWeek(referenceDate = moment()): moment.Moment {
        return this.startOf(referenceDate, 'w');
    }

    public endOfWeek(referenceDate = moment()): moment.Moment {
        return this.endOf(referenceDate, 'w');
    }

    public isSame(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.isSame(referenceDateB, granularity);
    }

    public isSameOrBefore(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.isSameOrBefore(referenceDateB, granularity);
    }

    public isSameOrAfter(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.isSameOrAfter(referenceDateB, granularity);
    }

    public isBetween(referenceDate: moment.Moment,
                     referenceDateFrom: moment.Moment,
                     referenceDateTo: moment.Moment,
                     granularity?: unitOfTime.StartOf,
                     inclusivity?: DateParserStrategyInclusivityType): boolean {
        return referenceDate.isBetween(referenceDateFrom, referenceDateTo, granularity, inclusivity);
    }

    public week(referenceDate: moment.Moment): number {
        return referenceDate.week();
    }

    public weekday(referenceDate: moment.Moment): number {
        return referenceDate.weekday();
    }
}
