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
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    BehaviorSubject,
    Subscription
} from 'rxjs';
import {
    delay,
    tap
} from 'rxjs/operators';

import {NameSeriesPair} from '../../../../../../shared/misc/parsers/name-series-pair.parser';
import {NameValuePair} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-project-ppc-all-graph',
    templateUrl: './project-ppc-all-graph.component.html',
    styleUrls: ['./project-ppc-all-graph.component.scss']
})

export class ProjectPpcAllGraphComponent implements OnInit, OnDestroy {

    @Input() set data(data: NameSeriesPair) {
        this._kpisData.next(data);
    }

    get data(): NameSeriesPair {
        return this._kpisData.getValue();
    }

    @Input() set rfvListByWeek(list: NameValuePair[]) {
        this._rfvListByWeek = list;
    }

    @Input() set settings(settings) {
        this.graphSettings = Object.assign(this.graphSettings, settings);
    }

    get rfvListByWeek(): NameValuePair[] {
        return this._rfvListByWeek;
    }

    public graphData: NameSeriesPair[] = [];

    private defaultGraphSettings = {
        animations: true,
        referenceLines: [],
        seriesTooltipDisabled: true,
        showRefLabels: false,
        showRefLines: true,
        scheme: {
            domain: [COLORS.dark_grey_75]
        },
        tooltipDisabled: false,
        xAxis: true,
        xAxisTicks: [],
        yAxis: true,
        yAxisTickFormatting: this._yAxisTickFormatting.bind(this),
        yAxisTicks: [],
        yScaleMax: 100,
        xAxisTickFormatting: value => value
    };

    public graphSettings = this.defaultGraphSettings;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _kpisData: BehaviorSubject<NameSeriesPair> = new BehaviorSubject(null);

    private _rfvListByWeek: NameValuePair[];

    ngOnInit(): void {
        this._setSubscription();
    }

    ngOnDestroy(): void {
        this._unsetSubscription();
    }

    public getWeekRfvList(week: string): NameValuePair[] {
        return this.rfvListByWeek.find(item => item.name === week).value;
    }

    /**
     * @description Returns graph data
     * @private
     * @return Array<NameSeriesPair>
     */
    private _getGraphData(): NameSeriesPair[] {
        return this.data ? [this._normalizeGraphData(this.data)] : [];
    }

    /**
     * @description Returns Y graph ticks
     * @private
     * @return Array<numbers>
     */
    private _getGraphYAxisTicks() {
        const defaultTicks = [0, 20, 40, 60, 80, 100];
        const seriesMean = this._getSeriesMean();
        const mean = seriesMean ? [seriesMean] : [];

        return [...defaultTicks, ...mean];
    }

    /**
     * @description Returns X graph ticks
     * @private
     * @return Array<strings>
     */
    private _getGraphXAxisTicks(): string[] {
        return this._getSeries().map((serie: NameValuePair) => serie.name);
    }

    /**
     * @description Return series
     * @private
     * @return Array<NameValuePair>
     */
    private _getSeries(): NameValuePair[] {
        return this.data && this.data.series ? this.data.series : [];
    }

    /**
     * @description Get mean for a given serie
     * @private
     * @return number
     */
    private _getSeriesMean(): number {
        const series: NameValuePair[] = this._getSeries();
        const seriesWidthValues: NameValuePair[] = series.filter(entry => entry.value !== null);
        const seriesPpcSum = seriesWidthValues.reduce((total, current) => (total + current.value), 0);
        return Math.round(seriesPpcSum / seriesWidthValues.length);
    }

    /**
     * @description Resets graph series values to zero
     * @private
     * @return void
     */
    private _resetGraphData(): void {
        this.graphData = this._getGraphData().map(item => ({
            name: item.name,
            series: item.series.map(serie => ({
                name: serie.name,
                value: 0,
            }) as NameValuePair)
        } as NameSeriesPair));
    }

    /**
     * @description Converts null values to 0
     * @param data
     * @private
     * @return NameSeriesPair
     */
    private _normalizeGraphData(data: NameSeriesPair): NameSeriesPair {
        return {
            ...data,
            series: data.series.map(item => ({
                ...item,
                value: item.value || 0,
            }))
        };
    }

    /**
     * @description Sets graph settings
     * @private
     */
    private _setGraphSettings(): void {
        const seriesMean = this._getSeriesMean();

        this.graphSettings.xAxisTicks = this._getGraphXAxisTicks();
        this.graphSettings.yAxisTicks = this._getGraphYAxisTicks();
        this.graphSettings.referenceLines = seriesMean ? [{name: 'mean', value: seriesMean}] : [];
    }

    private _setSubscription(): void {
        this._disposableSubscriptions.add(
            this._kpisData
                .pipe(
                    tap(() => {
                        this.graphSettings.animations = false;
                        this._resetGraphData();
                        this._setGraphSettings();
                    }),
                    delay(0)
                )
                .subscribe(() => {
                    this.graphSettings.animations = true;
                    this.graphData = this._getGraphData();
                    this._setGraphSettings();
                })
        );
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    /**
     * @description Formats Y ticks label
     * @param tickValue
     * @private
     * @returns string
     */
    private _yAxisTickFormatting(tickValue: number): string {
        const tickOverlapOffset = 3;
        const tickOverlapInterval = {min: tickValue - tickOverlapOffset, max: tickValue + tickOverlapOffset};
        const seriesMean = this._getSeriesMean();
        const tickOverlap = () => seriesMean >= tickOverlapInterval.min && seriesMean <= tickOverlapInterval.max;

        return (seriesMean && seriesMean !== tickValue && tickOverlap()) ? '' : `${tickValue}%`;
    }

}
