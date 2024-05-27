/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TimeScopeLabelFormatEnum} from '../../enums/date-format.enum';

@Component({
    selector: 'ss-milestone-date-label',
    templateUrl: './milestone-date-label.component.html',
    styleUrls: ['./milestone-date-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneDateLabelComponent {

    @Input()
    public date: moment.Moment;

    public get formattedDate(): string {
        const currentLang = this._translateService.defaultLang;
        const dateFormat = TimeScopeLabelFormatEnum[currentLang];

        return this.date.locale(currentLang).format(dateFormat);
    }

    constructor(private _translateService: TranslateService) {
    }
}
