/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    merge,
    Observable,
    of,
} from 'rxjs';
import {map} from 'rxjs/operators';

import {WeekDaysEnum} from '../../misc/enums/weekDays.enum';
import {EnumHelper} from '../../misc/helpers/enum.helper';

export enum DateFormatEnum {
    Xs = 'xs',
}

export enum DateUnitsEnum {
    Second = 's',
    Minute = 'm',
    Hour = 'h',
    Day = 'd',
    Week = 'w',
    Year = 'y',
}

export const DateFormatEnumHelper = new EnumHelper('Generic', DateFormatEnum);
export const DateUnitsEnumHelper = new EnumHelper('Generic', DateUnitsEnum);

export const MOMENT_YEAR_MONTH_DAY_FORMAT = 'YYYY-MM-DD';

export const WEEK_DAYS_MOMENT_SORTED = [
    WeekDaysEnum.SUNDAY,
    WeekDaysEnum.MONDAY,
    WeekDaysEnum.TUESDAY,
    WeekDaysEnum.WEDNESDAY,
    WeekDaysEnum.THURSDAY,
    WeekDaysEnum.FRIDAY,
    WeekDaysEnum.SATURDAY,
];

@Injectable({
    providedIn: 'root',
})
export class DateHelper {

    constructor(private _translateService: TranslateService) {
    }

    public static isSameDay(a: moment.Moment | null, b: moment.Moment | null): boolean {
        return (!a && !b) || (!!a && !!b && a.isSame(b, DateUnitsEnum.Day));
    }

    public static getWeekDayMomentNumber(weekDay: WeekDaysEnum): number {
        return WEEK_DAYS_MOMENT_SORTED.indexOf(weekDay);
    }

    public getFormattedDate(date: string, format: DateFormatEnum): string {
        return this._getFormattedRelativeDateFromPast(date, format);
    }

    public observeDate(date: string, format: DateFormatEnum): Observable<string> {
        const onDefaultLangChangeObservable = this._translateService.onDefaultLangChange;
        const currentLangObservable = of(this._translateService.defaultLang);

        return merge(onDefaultLangChangeObservable, currentLangObservable)
            .pipe(
                map(() =>
                    this.getFormattedDate(date, format))
            );
    }

    public getRelativeDateByTimeUnitPairFromPast(dateRef: string): DateTimeUnitPair {
        const date: moment.Moment = moment(dateRef);
        const relativeDate: moment.Moment = moment();
        const units: DateUnitsEnum[] = [
            DateUnitsEnum.Minute,
            DateUnitsEnum.Hour,
            DateUnitsEnum.Day,
            DateUnitsEnum.Week,
            DateUnitsEnum.Year,
        ];

        const unitIndex = units.findIndex(u => {
            const relativeInUnit = relativeDate.clone().subtract(1, u);
            return date.isAfter(relativeInUnit);
        });

        const unit = unitIndex ? (unitIndex !== -1 ? units[unitIndex - 1] : units[units.length - 1]) : units[unitIndex];
        const time = unitIndex === 0 ? 1 : Math.abs(date.diff(relativeDate, unit));

        return {time, unit};
    }

    private _getFormattedRelativeDateFromPast(dateRef: string, format: DateFormatEnum): string {
        const {time, unit} = this.getRelativeDateByTimeUnitPairFromPast(dateRef);
        return this._getRelativeDateFormatted(time, format, unit);
    }

    private _getRelativeDateFormatted(time: number, format: DateFormatEnum, unit: DateUnitsEnum): string {
        const key = `Generic_DateRelative${DateFormatEnumHelper.getKeyByValue(format)}`;
        return this._translateService.instant(key, {time, unit: this._getUnitLabelByFormat(unit, format)});
    }

    private _getUnitLabelByFormat(unit: DateUnitsEnum, format: DateFormatEnum): string {
        const unitKey = `${DateUnitsEnumHelper.getLabelByValue(unit)}${DateFormatEnumHelper.getKeyByValue(format)}`;
        return this._translateService.instant(unitKey);
    }

}

export enum DateTimeInstanceEnum {
    Absolute = 'abs',
    Relative = 'rel',
}

export interface DateTimeUnitPair {
    time: number;
    unit: DateUnitsEnum;
}
