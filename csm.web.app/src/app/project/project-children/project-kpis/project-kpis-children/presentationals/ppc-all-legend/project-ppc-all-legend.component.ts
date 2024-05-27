/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';
import {Moment} from 'moment';

import {TimeScope} from '../../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';

@Component({
    selector: 'ss-project-ppc-all-legend',
    templateUrl: './project-ppc-all-legend.component.html',
    styleUrls: ['./project-ppc-all-legend.component.scss'],
})

export class ProjectPpcAllLegendComponent {

    @Input()
    public set rfvListTotals(data: NameValuePair[]) {
        this._rfvListTotals = data || [];
        this.totalNumberOfRfv = this._getTotalNumberOfRfv();
    }

    @Input()
    public set dataTimeInterval(timeInterval: TimeScope) {
        this._dataTimeInterval = timeInterval;
        this.timeInterval = this._getTimeIntervalLabel();
    }

    public get rfvListTotals(): NameValuePair[] {
        return this._rfvListTotals;
    }

    public get dataTimeInterval(): TimeScope {
        return this._dataTimeInterval;
    }

    public totalNumberOfRfv: number;

    public timeInterval: string;

    private _dataTimeInterval: TimeScope;

    private _rfvListTotals: NameValuePair[] = [];

    constructor(private _dateParser: DateParserStrategy) {
    }

    private _getTotalNumberOfRfv(): number {
        return this.rfvListTotals
            .reduce((total, rfv) => {
                total += rfv.value;
                return total;
            }, 0);
    }

    private _getTimeIntervalLabel(): string {
        if (!this.dataTimeInterval) {
            return null;
        }
        const {start, end} = this.dataTimeInterval;
        return `${this._getWeekNumberByDate(start)} - ${this._getWeekNumberByDate(end)}`;
    }

    private _getWeekNumberByDate(date: Moment): number {
        return this._dateParser.week(date);
    }
}
