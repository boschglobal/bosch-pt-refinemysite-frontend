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
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../../../app.reducers';
import {TimeScope} from '../../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../../../shared/misc/helpers/breakpoint.helper';
import {
    NameSeriesPair,
    NameSeriesPairParser
} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {
    NameValuePair,
    NameValuePairParser
} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';
import {DIMENSIONS} from '../../../../../../shared/ui/constants/dimensions.constant';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {TrafficLightSettings} from '../../../../../../shared/ui/traffic-light/traffic-light.component';
import {
    DayCardMetricsResource,
    DayCardMetricsResourceRfv,
    DayCardMetricsResourceSerie,
    MetricsResource
} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {PROJECT_KPIS_COLOR_RANGES} from '../../../../../project-common/constants/project-kpis-color-ranges.constant';
import {MetricsActions} from '../../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../../project-common/store/metrics/slice/project-metrics-filters';
import {WeekLabelHelper} from '../../helpers/week-label.helper';

@Component({
    selector: 'ss-project-ppc-all',
    templateUrl: './project-ppc-all.component.html',
    styleUrls: ['./project-ppc-all.component.scss'],
})
export class ProjectPpcAllComponent implements OnInit, OnDestroy {

    public iconInfoMarker: string = COLORS.dark_blue;

    public isLoading = false;

    public flyoutTooltipPpcAllId = 'ssProjectKpisPpcAllTooltip';

    public fulfilledDayCardsAll: MetricsResource;

    public fulfilledDayCardsAllGraphData: NameSeriesPair;

    public fulfilledDayCardsAllGraphSettings = {
        xAxisTickFormatting: (weekNumber: string): string => this._weekLabelHelper
            .getWeekLabelByResolutionAndDuration(Number(weekNumber), this._timeFilters.duration),
    };

    public fulfilledDayCardsAllRfvListTotals: NameValuePair[];

    public fulfilledDayCardsAllRfvListByWeek: NameValuePair[];

    public fulfilledDayCardsAllTimeInterval: {};

    public trafficLightsLegendList = [
        {
            label: 'Project_Kpis_PpcAllInfoRedTooltipValueLabel',
            value: 0,
        },
        {
            label: 'Project_Kpis_PpcAllInfoGreenTooltipValueLabel',
            value: 80,
        },
        {
            label: 'Project_Kpis_PpcAllInfoYellowTooltipValueLabel',
            value: 50,
        },
        {
            label: 'Project_Kpis_PpcAllInfoBlackTooltipValueLabel',
            value: 100,
        },
    ];

    public trafficLightSettings: TrafficLightSettings = {
        size: DIMENSIONS.base_dimension,
        ranges: PROJECT_KPIS_COLOR_RANGES,
    };

    private _disposableSubscriptions: Subscription = new Subscription();

    private _nameSeriesPairParser;

    public _timeFilters: ProjectMetricsTimeFilters;

    constructor(private _breakpointHelper: BreakpointHelper,
                private _dateParser: DateParserStrategy,
                private _metricsQueries: MetricsQueries,
                private _store: Store<State>,
                private _weekLabelHelper: WeekLabelHelper) {
    }

    ngOnInit(): void {
        this._setupParsers();
        this._setSubscription();
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    private _handleFulfilledDayCardsAllChange(fulfilledDayCardsAll: MetricsResource): void {
        this.fulfilledDayCardsAll = fulfilledDayCardsAll;

        this.fulfilledDayCardsAllGraphData = this._getFulfilledDayCardsAllGraphData();

        this.fulfilledDayCardsAllRfvListTotals = this._getRfvListTotals();

        this.fulfilledDayCardsAllRfvListByWeek = this._getRfvListByWeek();

        this.fulfilledDayCardsAllTimeInterval = this._getFulfilledDayCardsAllTimeInterval();
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _getFulfilledDayCardsAllGraphData(): NameSeriesPair {
        return this._nameSeriesPairParser.parse(this.fulfilledDayCardsAll.series);
    }

    private _getFulfilledDayCardsAllTotals(): DayCardMetricsResource {
        return this.fulfilledDayCardsAll.totals;
    }

    private _getRfvListByWeek(): NameValuePair[] {
        return this.fulfilledDayCardsAll.series.map(item => ({
            name: this._dateParser.week(moment(item.start)).toString(),
            value: (item.metrics.rfv || []).map(rfv => {
                const {reason: {name}, value} = rfv;

                return {value, name};
            }).sort(this._sortReasons),
        }));
    }

    private _getRfvListTotals(): NameValuePair[] {
        return this._getFulfilledDayCardsAllTotalsRfv()
            .map(({reason: {name}, value}) => ({
                name,
                value,
            }))
            .sort(this._sortReasons);
    }

    private _sortReasons(a: NameValuePair, b: NameValuePair): number {
        const valueDifference = b.value - a.value;

        return valueDifference === 0 ? a.name.localeCompare(b.name) : valueDifference;
    }

    private _getFulfilledDayCardsAllTotalsRfv(): DayCardMetricsResourceRfv[] {
        const totals = this._getFulfilledDayCardsAllTotals();
        return totals.rfv;
    }

    private _getFulfilledDayCardsAllTimeInterval(): TimeScope {
        return {start: moment(this.fulfilledDayCardsAll.start), end: moment(this.fulfilledDayCardsAll.end)};
    }

    private _requestFulfilledDayCardsAll(): void {
        this._store.dispatch(new MetricsActions.Request.FulfilledDayCardsAll());
    }

    private _setSubscription(): void {

        this._disposableSubscriptions.add(
            this._metricsQueries.observeTimeFilters()
                .subscribe((timeFilters) => {
                    this._timeFilters = timeFilters;
                    this._requestFulfilledDayCardsAll();
                })
        );

        this._disposableSubscriptions.add(
            this._metricsQueries.observeFulfilledDayCardsAll()
                .pipe(
                    filter(fulfilledDayCardsAll => !!(fulfilledDayCardsAll && fulfilledDayCardsAll[0]))
                )
                .subscribe(fulfilledDayCardsAll => this._handleFulfilledDayCardsAllChange(fulfilledDayCardsAll[0]))
        );

        this._disposableSubscriptions.add(
            this._metricsQueries.observeFulfilledDayCardsAllRequestStatus()
                .subscribe(status => this._handleRequestStatusChange(status))
        );

        this._disposableSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this.fulfilledDayCardsAllGraphData = this._getFulfilledDayCardsAllGraphData())
        );
    }

    private _setupParsers(): void {
        const seriesItemParser = (item: DayCardMetricsResourceSerie) => ({
            name: this._dateParser.week(moment(item.start)).toString(),
            value: 'ppc' in item.metrics ? item.metrics.ppc : null,
        });

        this._nameSeriesPairParser = new NameSeriesPairParser('ProjectPpcAllGraph', new NameValuePairParser(seriesItemParser));
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }

}
