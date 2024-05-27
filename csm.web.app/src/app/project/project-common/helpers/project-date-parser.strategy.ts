/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment/moment';
import {unitOfTime} from 'moment/moment';

import {
    DateParserStrategy,
    DateParserStrategyInclusivityType
} from '../../../shared/ui/dates/date-parser.strategy';
import {ProjectDateLocaleHelper} from './project-date-locale.helper.service';

@Injectable()
export class ProjectDateParserStrategy implements DateParserStrategy {

    private get _projectLocale(): string {
        return this._projectDateLocale.getProjectLocale();
    }

    private get _currentLang(): string {
        return this._projectDateLocale.getCurrentLang();
    }

    constructor(private _projectDateLocale: ProjectDateLocaleHelper) {
    }

    public startOf(referenceDate = moment(), unit: unitOfTime.StartOf): moment.Moment {
        return referenceDate.clone().locale(this._projectLocale).startOf(unit).locale(this._currentLang);
    }

    public endOf(referenceDate = moment(), unit: unitOfTime.StartOf): moment.Moment {
        return referenceDate.clone().locale(this._projectLocale).endOf(unit).locale(this._currentLang);
    }

    public startOfWeek(referenceDate = moment()): moment.Moment {
        return this.startOf(referenceDate, 'w');
    }

    public endOfWeek(referenceDate = moment()): moment.Moment {
        return this.endOf(referenceDate, 'w');
    }

    public isSame(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.clone().locale(this._projectLocale).isSame(referenceDateB, granularity);
    }

    public isSameOrBefore(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.clone().locale(this._projectLocale).isSameOrBefore(referenceDateB, granularity);
    }

    public isSameOrAfter(referenceDateA: moment.Moment, referenceDateB: moment.Moment, granularity?: unitOfTime.StartOf): boolean {
        return referenceDateA.clone().locale(this._projectLocale).isSameOrAfter(referenceDateB, granularity);
    }

    public isBetween(referenceDate: moment.Moment,
                     referenceDateFrom: moment.Moment,
                     referenceDateTo: moment.Moment,
                     granularity?: unitOfTime.StartOf,
                     inclusivity?: DateParserStrategyInclusivityType): boolean {
        return referenceDate.clone().locale(this._projectLocale).isBetween(referenceDateFrom, referenceDateTo, granularity, inclusivity);
    }

    public week(referenceDate: moment.Moment): number {
        return referenceDate.clone().locale(this._projectLocale).week();
    }

    public weekday(referenceDate: moment.Moment): number {
        return referenceDate.clone().locale(this._projectLocale).weekday();
    }
}
