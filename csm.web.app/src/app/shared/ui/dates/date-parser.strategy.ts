/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {unitOfTime} from 'moment';
import * as moment from 'moment/moment';

export abstract class DateParserStrategy {

    public abstract startOf(referenceDate?: moment.Moment, unit?: unitOfTime.StartOf): moment.Moment;

    public abstract startOfWeek(referenceDate?: moment.Moment): moment.Moment;

    public abstract endOf(referenceDate?: moment.Moment, unit?: unitOfTime.StartOf): moment.Moment;

    public abstract endOfWeek(referenceDate?: moment.Moment): moment.Moment;

    public abstract isSame(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean;

    public abstract isSameOrBefore(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean;

    public abstract isSameOrAfter(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean;

    public abstract isBetween(referenceDate: moment.Moment,
                              referenceDateFrom: moment.Moment,
                              referenceDateTo: moment.Moment,
                              granularity?: unitOfTime.StartOf,
                              inclusivity?: DateParserStrategyInclusivityType): boolean;

    public abstract weekday(referenceDate: moment.Moment): number;

    public abstract week(referenceDate: moment.Moment): number;
}

export type DateParserStrategyInclusivityType = '()' | '[)' | '(]' | '[]';
