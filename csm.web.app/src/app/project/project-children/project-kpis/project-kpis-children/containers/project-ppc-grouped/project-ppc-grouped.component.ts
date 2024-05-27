/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../../../shared/misc/helpers/breakpoint.helper';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {BREAKPOINTS_RANGE} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';
import {DIMENSIONS} from '../../../../../../shared/ui/constants/dimensions.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {TrafficLightWithLabelSettings} from '../../../../../../shared/ui/traffic-light/traffic-light-with-label.component';
import {
    DayCardMetricsResourceRfv,
    MetricsResource
} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {PROJECT_KPIS_COLOR_RANGES} from '../../../../../project-common/constants/project-kpis-color-ranges.constant';
import {
    DayMonthDateFormatEnum,
    DayMonthYearDateFormatEnum
} from '../../../../../project-common/enums/date-format.enum';
import {ProjectNumberOfWeeksEnum} from '../../../../../project-common/enums/project-number-of-weeks.enum';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {WeekLabelHelper} from '../../helpers/week-label.helper';
import {
    PpcGroupedTableCell,
    PpcGroupedTableColumn,
    PpcGroupedTableRow
} from '../../presentationals/ppc-grouped-table/ppc-grouped-table.component';

@Component({
    selector: 'ss-project-ppc-grouped',
    templateUrl: './project-ppc-grouped.component.html',
    styleUrls: ['./project-ppc-grouped.component.scss'],
})
export class ProjectPpcGroupedComponent implements OnInit, OnDestroy {

    public iconInfoMarker: string = COLORS.dark_blue;

    public isLoading = false;

    public columns: PpcGroupedTableColumn[] = [];

    public rows: PpcGroupedTableRow[] = [];

    public addTotalColumn = false;

    public trafficLightSettings: TrafficLightWithLabelSettings = {
        size: DIMENSIONS.base_dimension__x2,
        ranges: PROJECT_KPIS_COLOR_RANGES,
        valueFormatter: this._labelFormatter.bind(this),
    };

    private _timeFilters: ProjectMetricsTimeFilters;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _fulfilledDayCards: MetricsResource[] = [];

    constructor(private _breakpointHelper: BreakpointHelper,
                private _dateParser: DateParserStrategy,
                private _metricsQueries: MetricsQueries,
                private _store: Store<State>,
                private _translateService: TranslateService,
                private _weekLabelHelper: WeekLabelHelper) {
    }

    ngOnInit() {
        this._setSubscription();
    }

    ngOnDestroy() {
        this._unsetSubscription();
    }

    public showUnit(): boolean {
        return BREAKPOINTS_RANGE.md.min <= BREAKPOINTS_RANGE[this._breakpointHelper.currentBreakpoint()].min;
    }

    private _refreshIconSize(): void {
        this.trafficLightSettings.size = this._timeFilters.duration === ProjectNumberOfWeeksEnum.trimester
            ? DIMENSIONS.base_dimension
            : DIMENSIONS.base_dimension__x2;
    }

    private _labelFormatter(v: string | number): string {
        const value = v ? v : 0;

        return this.showUnit() ? `${value} %` : `${value}`;
    }

    private _handleFulfilledDayCards(fulfilledDayCards: MetricsResource[]): void {
        this.addTotalColumn = BREAKPOINTS_RANGE.md.min <= BREAKPOINTS_RANGE[this._breakpointHelper.currentBreakpoint()].min;

        this._fillColumns(fulfilledDayCards, this.addTotalColumn);
        this._fillRows(fulfilledDayCards, this.addTotalColumn);
    }

    private _fillColumns(fulfilledDayCards: MetricsResource[], addTotalColumn: boolean): void {
        if (fulfilledDayCards.length > 0) {

            this.columns = fulfilledDayCards[0].series.map(serie => ({
                title: this._dateToTitle(serie.start),
                subtitle: this._dateRangeToTitle(serie.start, serie.end),
            } as PpcGroupedTableColumn));

            if (addTotalColumn) {
                this.columns.push({
                    title: this._dateToTitle(fulfilledDayCards[0].start, fulfilledDayCards[0].end, true),
                    subtitle: this._dateRangeToTitle(fulfilledDayCards[0].start, fulfilledDayCards[0].end),
                });
            }
        } else {
            this.columns = [];
        }
    }

    private _dateToTitle = (date: Date, endDate?: Date, forceExtendedLabel = false) => {
        const parsedStartDate = moment(date);
        const parsedEndDate = moment(endDate);
        const startWeekNumber = this._dateParser.week(parsedStartDate);
        const endWeekNumber = endDate ? this._dateParser.week(parsedEndDate) : null;
        const weekLabel = forceExtendedLabel ? this._weekLabelHelper.getWeekLabelExtended(startWeekNumber) :
            this._weekLabelHelper.getWeekLabelByResolutionAndDuration(startWeekNumber, this._timeFilters.duration);

        const endWeek = endWeekNumber ? ` - ${endWeekNumber}` : '';

        return `${weekLabel}${endWeek}`;
    };

    private _dateRangeToTitle(start: Date, end: Date): string {

        if (this._timeFilters.duration === ProjectNumberOfWeeksEnum.trimester ||
            BREAKPOINTS_RANGE.xs.max >= BREAKPOINTS_RANGE[this._breakpointHelper.currentBreakpoint()].max) {
            return null;
        }

        const momentEnd = moment(end);
        const momentStart = moment(start);

        const lang = this._translateService.defaultLang;

        const startDate = momentEnd.year() === momentStart.year()
            ? momentStart.format(DayMonthDateFormatEnum[lang])
            : momentStart.format(DayMonthYearDateFormatEnum[lang]);
        const endDate = momentEnd.format(DayMonthYearDateFormatEnum[lang]);

        return `${startDate} - ${endDate}`;
    }

    private _mapReasons(reason: DayCardMetricsResourceRfv): NameValuePair {
        const {reason: {name}, value} = reason;

        return {
            name,
            value,
        };
    }

    private _sortMetrics(a: string, b: string): number {
        if (a === undefined) {
            return 1;
        } else if (b === undefined) {
            return -1;
        } else {
            return a.localeCompare(b);
        }
    }

    private _sortReasons(a: NameValuePair, b: NameValuePair): number {
        const valueDifference = b.value - a.value;

        return valueDifference === 0 ? a.name.localeCompare(b.name) : valueDifference;
    }

    private _fillRows(fulfilledDayCards: MetricsResource[], addTotalColumn: boolean): void {
        this.rows = fulfilledDayCards.map(company => ({
            cells: this._getRowCells(company, addTotalColumn),
            title: company.company ? company.company.displayName : this._translateService.instant('Generic_NoCompany'),
            subtitle: company.projectCraft ? company.projectCraft.displayName : '',
        }));
    }

    private _getRowCells(company: MetricsResource, addTotalColumn: boolean): PpcGroupedTableCell[] {
        const cells: PpcGroupedTableCell[] = company.series.map(serie => ({
            ppc: serie.metrics.ppc === undefined ? null : serie.metrics.ppc,
            week: this._dateParser.week(moment(serie.start)).toString(),
            reasons: serie.metrics.rfv === undefined ? [] : serie.metrics.rfv.map(this._mapReasons).sort(this._sortReasons),
        } as PpcGroupedTableCell));

        if (addTotalColumn) {
            const weekStartLabel = this._dateParser.week(moment(company.start));
            const weekEndLabel = this._dateParser.week(moment(company.end));

            cells.push({
                ppc: company.totals.ppc === undefined ? null : company.totals.ppc,
                week: `${weekStartLabel} - ${weekEndLabel}`,
                reasons: company.totals.rfv === undefined ? [] : company.totals.rfv.map(this._mapReasons).sort(this._sortReasons),
            });
        }

        return cells;
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _requestFulfilledDayCards(): void {
        this._store.dispatch(new MetricsActions.Request.FulfilledDayCardsGrouped());
    }

    private _setSubscription(): void {

        this._disposableSubscriptions.add(
            this._metricsQueries.observeTimeFilters()
                .subscribe(timeFilters => {
                    this._timeFilters = timeFilters;
                    this._requestFulfilledDayCards();
                    this._refreshIconSize();
                })
        );

        this._disposableSubscriptions.add(
            this._metricsQueries.observeFulfilledDayCardsGrouped()
                .pipe(map(fulfilledDayCards => [...fulfilledDayCards]
                    .sort((a, b) => this._sortMetrics(a.projectCraft?.displayName, b.projectCraft?.displayName))
                    .sort((a, b) => this._sortMetrics(a.company?.displayName, b.company?.displayName))
                ))
                .subscribe(fulfilledDayCards => {
                    this._fulfilledDayCards = fulfilledDayCards;
                    this._handleFulfilledDayCards(fulfilledDayCards);
                })
        );

        this._disposableSubscriptions.add(
            this._metricsQueries.observeFulfilledDayCardsGroupedRequestStatus()
                .subscribe(status => this._handleRequestStatusChange(status))
        );

        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this._handleFulfilledDayCards(this._fulfilledDayCards))
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
