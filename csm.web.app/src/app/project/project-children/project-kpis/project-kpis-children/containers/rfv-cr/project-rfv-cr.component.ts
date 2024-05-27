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
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../../../shared/misc/helpers/breakpoint.helper';
import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../../shared/rest/constants/date-format.constant';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {
    DayCardMetricsResourceRfv,
    MetricsResource
} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {REASONS_FOR_VARIANCE_COLORS} from '../../../../../project-common/constants/reasons-for-variance-colors.constant';
import {
    ChartTypeEnum,
    ChartTypeEnumHelper
} from '../../../../../project-common/enums/chart-type.enum';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {WeekLabelHelper} from '../../helpers/week-label.helper';
import {ProjectRfvCrLegendListItem} from '../../presentationals/rfv-cr-legend/project-rfv-cr-legend.component';

@Component({
    selector: 'ss-project-rfv-cr',
    templateUrl: './project-rfv-cr.component.html',
    styleUrls: ['./project-rfv-cr.component.scss'],
})
export class ProjectRfvCrComponent implements OnInit, OnDestroy {

    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    public chartData: NameSeriesPair[] = [];

    public chartTypeList: MenuItemsList[] = [];

    public currentChart: ChartTypeEnum = ChartTypeEnum.StackedBar;

    public iconInfoMarkerColor: string = COLORS.dark_blue;

    public isLoading = false;

    public noReasonsForVarianceAllData = false;

    public rfvControlList: ProjectRfvCrLegendListItem[] = [];

    public rfvSeriesColor: NameValuePair[];

    public reasonsForVarianceAllChartSettings = {
        xAxisTickFormatting: (date: string): string => {
            const weekNumber = this._dateParser.week(moment(date, API_DATE_YEAR_MONTH_DAY_FORMAT));

            return this._weekLabelHelper.getWeekLabelByResolutionAndDuration(weekNumber, this._timeFilters.duration);
        },
        yScaleMax: null,
    };

    private _disposableSubscriptions: Subscription = new Subscription();

    private _rfvDataByWeek: NameSeriesPair[];

    private _rfvDataByRfv: NameSeriesPair[];

    private _reasonsForVarianceAllData: MetricsResource;

    public _timeFilters: ProjectMetricsTimeFilters;

    constructor(private _breakpointHelper: BreakpointHelper,
                private _dateParser: DateParserStrategy,
                private _metricsQueries: MetricsQueries,
                private _store: Store<State>,
                private _translateService: TranslateService,
                private _weekLabelHelper: WeekLabelHelper) {
    }

    ngOnInit() {
        this._setSubscription();
        this._setDropdownItems();
    }

    ngOnDestroy() {
        this._unsetSubscription();
    }

    public handleChartTypeChange(chart: MenuItem): void {
        this.currentChart = chart.id as ChartTypeEnum;
        this._updateChartData();
        this._updateChartSettings();
    }

    public rfvControlListItemSelection(rfv: ProjectRfvCrLegendListItem): void {
        rfv.active = !rfv.active;
        this._updateChartData();
    }

    public resetRfvControlList(): void {
        this.rfvControlList.forEach(item => item.active = false);
        this._handleReasonsForVarianceAllChange(this._reasonsForVarianceAllData);
    }

    public toggleRfvSerieColor(rfv: ProjectRfvCrLegendListItem, enter: boolean): void {
        const rfvControlListItem = this._getRfvControlListFiltered().find(item => item.id === rfv.id);

        if (!rfvControlListItem) {
            return;
        }

        this.rfvSeriesColor = this.rfvSeriesColor
            .map(item => {
                const rfvItem = this._getRfvControlList().find(el => el.name === item.name);
                const rfvItemId = rfvItem.id;
                const rfvColours = REASONS_FOR_VARIANCE_COLORS[rfvItemId];
                if (item.name !== rfv.name) {
                    item.value = enter ? rfvColours.faded : rfvColours.normal;
                }
                return item;
            });
    }

    private _setDropdownItems(): void {
        const items: { id: ChartTypeEnum; icon: string }[] = [
            {id: ChartTypeEnum.Line, icon: 'chart-line'},
            {id: ChartTypeEnum.StackedBar, icon: 'chart-stacked-bar'},
            {id: ChartTypeEnum.GroupedBar, icon: 'chart-grouped-bar'},
        ];

        this.chartTypeList = [{
            customFigureTemplate: this.iconTemplate,
            items:
                items.map(item => ({
                    id: item.id,
                    type: 'select',
                    label: ChartTypeEnumHelper.getLabelByValue(item.id),
                    selected: this.currentChart === item.id,
                    customData: item.icon,
                })),
        }];
    }

    private _getRfvControlList(): ProjectRfvCrLegendListItem[] {
        return this._reasonsForVarianceAllData.totals.rfv
            .map(({reason: {key, name}}) => {
                const rfvItem = this.rfvControlList.find(rfv => rfv.id === key);

                return {
                    name,
                    id: key,
                    active: rfvItem ? rfvItem.active : false,
                    color: rfvItem ? rfvItem.color : REASONS_FOR_VARIANCE_COLORS[key].normal,
                };
            });
    }

    private _updateRfvSeriesColor(): void {
        this.rfvSeriesColor = this._getRfvSeriesColor();
    }

    private _handleReasonsForVarianceAllChange(rfv: MetricsResource): void {
        this._reasonsForVarianceAllData = rfv;
        this._updateRfvControlList();
        this._updateChartData();
        this._updateChartSettings();
        this._updateRfvSeriesColor();
        this.noReasonsForVarianceAllData = !this._hasReasonsForVarianceAllData(rfv);
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _handleBreakpointChange(breakpoint: string): void {
        if (BreakpointsEnum[breakpoint] < BreakpointsEnum.md) {
            this.resetRfvControlList();
        }
    }

    private _hasReasonsForVarianceAllData(data: MetricsResource): boolean {
        return data.totals.rfv.length > 0;
    }

    private _getChartData(): NameSeriesPair[] {
        switch (this.currentChart) {
            case ChartTypeEnum.Line:
                return this._rfvDataByRfv;
            case ChartTypeEnum.GroupedBar:
                return this._rfvDataByWeek;
            default:
                return this._rfvDataByWeek
                    .map(item => {
                        const seriesReversed = [...item.series].reverse();
                        return ({name: item.name, series: seriesReversed} as NameSeriesPair);
                    });
        }
    }

    private _getRfvDataByWeek(rfv: MetricsResource): NameSeriesPair[] {
        return rfv.series.map(week => ({
            name: week.start.toString(),
            series: this._getRfvControlListFiltered()
                .map(({id, name}) => ({
                    name,
                    value: this._getRfvValueByRfvEnum(id, week.metrics.rfv),
                } as NameValuePair)),
        } as NameSeriesPair));
    }

    private _getRfvDataByRfv(data: MetricsResource): NameSeriesPair[] {
        return this._getRfvControlListFiltered()
            .map(({id, name}) => ({
                name,
                series: data.series.map(entry => ({
                    name: entry.start.toString(),
                    value: this._getRfvValueByRfvEnum(id, entry.metrics.rfv),
                }) as NameValuePair),
            } as NameSeriesPair));
    }

    private _getRfvValueByRfvEnum(key: string, list: DayCardMetricsResourceRfv[] = []): number {
        const rfv = list.find(({reason}) => reason.key === key);
        return rfv ? rfv.value : 0;
    }

    private _getRfvControlListFiltered(): ProjectRfvCrLegendListItem[] {
        const allInactive = !this.rfvControlList.find(item => item.active);
        return allInactive
            ? this.rfvControlList
            : this.rfvControlList.filter(item => item.active);
    }

    private _getRfvSeriesColor(): NameValuePair[] {
        return this._getRfvControlListFiltered()
            .map(item => ({
                name: item.name,
                value: item.color,
            }) as NameValuePair);
    }

    private _requestReasonsForVarianceAll(): void {
        this._store.dispatch(new MetricsActions.Request.ReasonsForVarianceAll());
    }

    private _transformData(rfv: MetricsResource): void {
        this._rfvDataByWeek = this._getRfvDataByWeek(rfv);
        this._rfvDataByRfv = this._getRfvDataByRfv(rfv);
    }

    private _updateChartData(): void {
        this._transformData(this._reasonsForVarianceAllData);
        this.chartData = this._getChartData();
    }

    private _updateChartSettings(): void {
        switch (this.currentChart) {
            case ChartTypeEnum.Line:
            case ChartTypeEnum.GroupedBar:
                this.reasonsForVarianceAllChartSettings.yScaleMax = this._getSeriesByWeekMaxValue(this._reasonsForVarianceAllData);
                break;
            case ChartTypeEnum.StackedBar:
                this.reasonsForVarianceAllChartSettings.yScaleMax = this._getSeriesCumulativeSumByWeekMaxValue(this._reasonsForVarianceAllData);
                break;
        }
    }

    private _getSeriesByWeekMaxValue(data: MetricsResource): number {
        return data.series.reduce((acc, curr) => {
            const weekSum = (curr.metrics.rfv || []).reduce((ac, cur) => cur.value > ac ? cur.value : ac, 0);
            return weekSum > acc ? weekSum : acc;
        }, 0);
    }

    private _getSeriesCumulativeSumByWeekMaxValue(data: MetricsResource): number {
        return data.series.reduce((acc, curr) => {
            const weekSum = (curr.metrics.rfv || []).reduce((ac, cur) => cur.value + ac, 0);
            return weekSum > acc ? weekSum : acc;
        }, 0);
    }

    private _updateRfvControlList(): void {
        this.rfvControlList = this._getRfvControlList();
    }

    private _setSubscription(): void {
        this._disposableSubscriptions.add(
            this._metricsQueries.observeTimeFilters()
                .subscribe(timeFilters => {
                    this._timeFilters = timeFilters;
                    this._requestReasonsForVarianceAll();
                })
        );
        this._disposableSubscriptions.add(
            this._metricsQueries.observeReasonsForVarianceAll()
                .subscribe((rfv: MetricsResource) => this._handleReasonsForVarianceAllChange(rfv))
        );
        this._disposableSubscriptions.add(
            this._metricsQueries.observeReasonsForVarianceAllRequestStatus()
                .subscribe(status => this._handleRequestStatusChange(status))
        );
        this._disposableSubscriptions.add(
            this._breakpointHelper
                .breakpointChange()
                .subscribe((breakpoint: string) => this._handleBreakpointChange(breakpoint))
        );
        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._requestReasonsForVarianceAll())
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }

}
