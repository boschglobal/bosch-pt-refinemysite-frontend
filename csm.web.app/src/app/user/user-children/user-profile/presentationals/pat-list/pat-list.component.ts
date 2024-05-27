/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {DayMonthFullYearDateTimeFormatEnum} from '../../../../../project/project-common/enums/date-format.enum';
import {
    PAT_LIST_HEADERS,
    PAT_LIST_HEADERS_SMALL
} from '../../../../../shared/help/constants/pat-list.constant';
import {TableSettings} from '../../../../../shared/ui/table/table.component';
import {PatContentModel} from '../../containers/pat-content-model/pat-content.model';

@Component({
    selector: 'ss-pat-list',
    templateUrl: './pat-list.component.html',
    styleUrls: ['./pat-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatListComponent implements OnInit {

    @Input()
    public set pats(pats: PatContentModel[]) {
        this.patsList = pats.map(pat => ({
            ...pat,
            expiresAt: this._getFormattedDate(pat.expiresAt, this._translateService),
        }));
    }

    @Output()
    public patDeleteClicked: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    public patEditClicked: EventEmitter<string> = new EventEmitter<string>();

    public patsList: PatContentModel[];

    public settings: TableSettings;

    public settingsSmall: TableSettings;

    constructor(private _translateService: TranslateService) {}

    ngOnInit() {
        this._setSettings();
    }

    public onClickDelete(id: string): void {
        this.patDeleteClicked.emit(id);
    }

    public onClickEdit(id: string): void {
        this.patEditClicked.emit(id);
    }

    private _setSettings(): void {
        this.settings = {
            headers: PAT_LIST_HEADERS,
            messages: {
                empty: 'Generic_NoRecordsFound',
                loading: 'Generic_LoadingRecords',
            },
            allowMultipleSort: false,
            allowNeutralSort: false,
        };

        this.settingsSmall = {
            ...this.settings,
            headers: PAT_LIST_HEADERS_SMALL,
        };
    }

    private _getFormattedDate(date: string, translateService: TranslateService): string {
        const currentLang: string = translateService.defaultLang;
        const dateFormat: string = DayMonthFullYearDateTimeFormatEnum[currentLang];

        return moment(date).locale(currentLang).format(dateFormat);
    }
}
