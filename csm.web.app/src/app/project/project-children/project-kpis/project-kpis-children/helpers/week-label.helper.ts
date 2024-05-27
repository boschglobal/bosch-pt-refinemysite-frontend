/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {BreakpointHelper} from '../../../../../shared/misc/helpers/breakpoint.helper';
import {ProjectNumberOfWeeksEnum} from '../../../../project-common/enums/project-number-of-weeks.enum';

@Injectable({
    providedIn: 'root',
})
export class WeekLabelHelper {

    constructor(private _breakpointHelper: BreakpointHelper,
                private _translateService: TranslateService) {
    }

    public getWeekLabelByResolutionAndDuration(weekNumber: number, currentDuration: number): string {
        const currentBreakpoint = this._breakpointHelper.currentBreakpoint();
        return currentDuration === ProjectNumberOfWeeksEnum.month && currentBreakpoint !== 'xs'
            ? this.getWeekLabelExtended(weekNumber)
            : weekNumber.toString();
    }

    public getWeekLabelExtended(weekNumber: number): string {
        return `${this._translateService.instant('Generic_Week')} ${weekNumber}`;
    }
}
