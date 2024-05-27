/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Directive,
    ElementRef,
    Input,
    OnInit
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

@Directive({
    selector: '[ssMessageDate]',
})
export class MessageDateDirective implements OnInit {

    /**
     * @description Property with date instantiated
     * @param date
     */
    @Input()
    public set ssMessageDate(date: Date) {
        this._date = date;
        this._parseDate();
    }

    private _date: Date;

    constructor(private _elementRef: ElementRef,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._parseDate();
    }

    private _parseDate(): void {
        const date: moment.Moment = moment(this._date);
        const yesterday: moment.Moment = moment().clone().subtract(1, 'day');
        const today: moment.Moment = moment();
        const tomorrow: moment.Moment = moment().clone().add(1, 'day');

        const isYesterday = date.isSame(yesterday, 'day');
        const isToday = date.isSame(today, 'day');
        const isTomorrow = date.isSame(tomorrow, 'day');

        let displayDate: string = date
            .locale(this._translateService.defaultLang)
            .format(date.localeData().longDateFormat('L').replace(/YYYY/g, 'YY'));

        if (isYesterday) {
            displayDate = this._translateService.instant('Generic_Yesterday');
        }

        if (isToday) {
            displayDate = this._translateService.instant('Generic_Today');
        }

        if (isTomorrow) {
            displayDate = this._translateService.instant('Generic_Tomorrow');
        }

        this._setDisplayDate(displayDate);
    }

    private _setDisplayDate(date: string): void {
        this._elementRef.nativeElement.innerText = date;
    }
}
