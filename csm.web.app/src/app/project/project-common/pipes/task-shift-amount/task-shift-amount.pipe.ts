/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Pipe,
    PipeTransform
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
    name: 'ssTaskShiftAmount',
})
export class TaskShiftAmountPipe implements PipeTransform {

    private readonly _translationConfig: TaskShiftAmountTranslationConfig = {
        'copy_day_single_neutral': 'TaskShift_Copy',
        'copy_day_single_negative': 'TaskShift_Copy_Day',
        'copy_day_single_positive': 'TaskShift_Copy_Day',
        'copy_day_multiple_neutral': 'TaskShift_Copy',
        'copy_day_multiple_negative': 'TaskShift_Copy_Days',
        'copy_day_multiple_positive': 'TaskShift_Copy_Days',
        'copy_week_single_neutral': 'TaskShift_Copy',
        'copy_week_single_negative': 'TaskShift_Copy_Week',
        'copy_week_single_positive': 'TaskShift_Copy_Week',
        'copy_week_multiple_neutral': 'TaskShift_Copy',
        'copy_week_multiple_negative': 'TaskShift_Copy_Weeks',
        'copy_week_multiple_positive': 'TaskShift_Copy_Weeks',
        'move_day_single_neutral': 'TaskShift_Move',
        'move_day_single_negative': 'TaskShift_Move_Day',
        'move_day_single_positive': 'TaskShift_Move_Day',
        'move_day_multiple_neutral': 'TaskShift_Move',
        'move_day_multiple_negative': 'TaskShift_Move_Days',
        'move_day_multiple_positive': 'TaskShift_Move_Days',
        'move_week_single_neutral': 'TaskShift_Move',
        'move_week_single_negative': 'TaskShift_Move_Week',
        'move_week_single_positive': 'TaskShift_Move_Week',
        'move_week_multiple_neutral': 'TaskShift_Move',
        'move_week_multiple_negative': 'TaskShift_Move_Weeks',
        'move_week_multiple_positive': 'TaskShift_Move_Weeks',
        'resize_day_single_neutral': 'TaskShift_Resize',
        'resize_day_single_negative': 'TaskShift_Resize_DayNegative',
        'resize_day_single_positive': 'TaskShift_Resize_DayPositive',
        'resize_day_multiple_neutral': 'TaskShift_Resize',
        'resize_day_multiple_negative': 'TaskShift_Resize_DaysNegative',
        'resize_day_multiple_positive': 'TaskShift_Resize_DaysPositive',
        'resize_week_single_neutral': 'TaskShift_Resize',
        'resize_week_single_negative': 'TaskShift_Resize_WeekNegative',
        'resize_week_single_positive': 'TaskShift_Resize_WeekPositive',
        'resize_week_multiple_neutral': 'TaskShift_Resize',
        'resize_week_multiple_negative': 'TaskShift_Resize_WeeksNegative',
        'resize_week_multiple_positive': 'TaskShift_Resize_WeeksPositive',
    };

    private _signalIndicatorConfig: TaskShiftAmountSignalIndicatorConfig = {
        positive: '+',
        negative: '-',
        neutral: null,
    };

    constructor(private _translateService: TranslateService) {
    }

    public transform(amount: number, mode: TaskShiftAmountMode, unit: TaskShiftAmountUnit): string {
        const absAmount = Math.abs(amount);
        const multiplicity = this._getMultiplicity(absAmount);
        const signal = this._getSignal(amount);
        const signalIndicator = this._getSignalIndicator(signal);
        const configKey: TaskShiftAmountTranslationConfigKey = `${mode}_${unit}_${multiplicity}_${signal}`;
        const key = this._translationConfig[configKey];

        return this._translateService.instant(key, {amount: absAmount, signalIndicator});
    }

    private _getMultiplicity(amount: number): TaskShiftAmountMultiplicity {
        return amount > 1 ? 'multiple' : 'single';
    }

    private _getSignal(amount: number): TaskShiftAmountSignal {
        if (amount === 0) {
            return 'neutral';
        } else if (amount > 0) {
            return 'positive';
        } else {
            return 'negative';
        }
    }

    private _getSignalIndicator(signal: TaskShiftAmountSignal): TaskShiftAmountSignalIndicator {
        return this._signalIndicatorConfig[signal];
    }
}

export type TaskShiftAmountMode = 'move' | 'copy' | 'resize';

export type TaskShiftAmountUnit = 'day' | 'week';

export type TaskShiftAmountSignalIndicator = '+' | '-';

type TaskShiftAmountMultiplicity = 'single' | 'multiple';

type TaskShiftAmountSignal = 'neutral' | 'positive' | 'negative';

type TaskShiftAmountTranslationConfigKey =
    `${TaskShiftAmountMode}_${TaskShiftAmountUnit}_${TaskShiftAmountMultiplicity}_${TaskShiftAmountSignal}`;

type TaskShiftAmountTranslationConfig = { [key in TaskShiftAmountTranslationConfigKey]: string };

type TaskShiftAmountSignalIndicatorConfig = { [key in TaskShiftAmountSignal]: TaskShiftAmountSignalIndicator };
