/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    LangChangeEvent,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

import {WeekDaysEnum} from '../../../shared/misc/enums/weekDays.enum';
import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {DateHelper} from '../../../shared/ui/dates/date.helper.service';

const PROJECT_MOMENT_LOCALE_BASE_NAME = 'project-locale';

export const PROJECT_MOMENT_LOCALES: { [key in LanguageEnum]: string } = {
    [LanguageEnum.EN]: `${PROJECT_MOMENT_LOCALE_BASE_NAME}-${[LanguageEnum.EN]}`,
    [LanguageEnum.FR]: `${PROJECT_MOMENT_LOCALE_BASE_NAME}-${[LanguageEnum.FR]}`,
    [LanguageEnum.ES]: `${PROJECT_MOMENT_LOCALE_BASE_NAME}-${[LanguageEnum.ES]}`,
    [LanguageEnum.PT]: `${PROJECT_MOMENT_LOCALE_BASE_NAME}-${[LanguageEnum.PT]}`,
    [LanguageEnum.DE]: `${PROJECT_MOMENT_LOCALE_BASE_NAME}-${[LanguageEnum.DE]}`,
};

@Injectable({
    providedIn: 'root',
})
export class ProjectDateLocaleHelper {

    private _currentLang = moment.locale();

    private _disposableSubscriptions = new Subscription();

    private _initialMomentLocale = moment.locale();

    constructor(private _translateService: TranslateService) {
        this._setSubscriptions();
    }

    public getCurrentLang(): string {
        return this._currentLang;
    }

    public getMomentByLang(): moment.Moment {
        return moment().locale(this._currentLang);
    }

    public getProjectLocale(): string {
        return PROJECT_MOMENT_LOCALES[this._currentLang];
    }

    public configProjectMomentLocaleFirstDayOfWeek(firstDayOfWeek: WeekDaysEnum): void {
        const weekDayNumber = DateHelper.getWeekDayMomentNumber(firstDayOfWeek);

        moment.updateLocale(this.getProjectLocale(), {
            week: {
                dow: weekDayNumber,
                doy: weekDayNumber,
            },
        });

        this._resetMomentToInitialLocale();
    }

    private _configProjectMomentLocaleAndParentLocale(parentLocale: string): void {
        moment.defineLocale(this.getProjectLocale(), {parentLocale});

        this._resetMomentToInitialLocale();
    }

    private _resetMomentToInitialLocale(): void {
        moment.locale(this._initialMomentLocale);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .pipe(
                    tap((event: LangChangeEvent) => this._currentLang = event.lang))
                .subscribe((event: LangChangeEvent) => this._configProjectMomentLocaleAndParentLocale(event.lang)));
    }
}
