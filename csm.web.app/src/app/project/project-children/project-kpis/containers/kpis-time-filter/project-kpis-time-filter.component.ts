/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {
    fromEvent,
    Subscription
} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {BreakpointsEnum} from '../../../../../shared/ui/constants/breakpoints.constant';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectNumberOfWeeksEnum} from '../../../../project-common/enums/project-number-of-weeks.enum';
import {MetricsActions} from '../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../project-common/store/metrics/slice/project-metrics-filters';

export const KPIS_TIME_FILTERS_DURATION_LIST: MenuItem<ProjectNumberOfWeeksEnum>[] =
    [
        {
            id: 'project-kpis-time-filter-last-4-weeks',
            type: 'select',
            label: 'Generic_TimeLast4Weeks',
            value: ProjectNumberOfWeeksEnum.month,
        },
        {
            id: 'project-kpis-time-filter-last-12-weeks',
            type: 'select',
            label: 'Generic_TimeLast12Weeks',
            value: ProjectNumberOfWeeksEnum.trimester,
        },
    ];

@Component({
    selector: 'ss-project-kpis-time-filter',
    templateUrl: './project-kpis-time-filter.component.html',
    styleUrls: ['./project-kpis-time-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectKpisTimeFilterComponent implements OnInit, OnDestroy {

    public currentTimeFiltersInWeeks: string;

    public kpisTimeFiltersDurationList: MenuItemsList<ProjectNumberOfWeeksEnum>[] = [{items: KPIS_TIME_FILTERS_DURATION_LIST}];

    public timeFiltersCurrentOption: MenuItem<ProjectNumberOfWeeksEnum>;

    private _dateOffsetWeek = 1;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute,
                private _changeDetectorRef: ChangeDetectorRef,
                private _dateParser: DateParserStrategy,
                private _metricsQueries: MetricsQueries,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setInitTimeFilters();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    /**
     * @description Callback form when an option changes
     * @param option<MenuItem>
     */
    public timeFiltersOptionChange(option: MenuItem): void {
        const timeFilters = this._getTimeFiltersByDuration(option.value);
        this._updateTimeFilters(timeFilters);
    }

    /**
     * @description Retrieve initial time filters
     * @private
     * @return Object<ProjectMetricsTimeFilters>
     */
    private _getInitTimeFilters(): ProjectMetricsTimeFilters {
        const urlQueryParameterDuration: number = parseInt(this._activatedRoute.snapshot.queryParamMap.get('duration'), 10);
        const hasUrlQueryParameterDuration = !!this._getTimeFiltersOptionByDuration(urlQueryParameterDuration);
        const duration = window.innerWidth < BreakpointsEnum.sm || !hasUrlQueryParameterDuration ?
            ProjectNumberOfWeeksEnum.month : urlQueryParameterDuration;

        return this._getTimeFiltersByDuration(duration);
    }

    /**
     * @description Retrieves a Moment the amount of weeks ago from the reference date
     * @param amount<number>
     * @private
     * @return Moment
     */
    private _getDateWeeksAgo(amount: number): moment.Moment {
        const referenceDate = this._dateParser.startOfWeek();

        return referenceDate.clone().subtract(amount, 'week');
    }

    /**
     * @description Retrieve option by a given duration
     * @param value<number>
     * @private
     * @return SelectButtonOption
     */
    private _getTimeFiltersOptionByDuration(value: number): MenuItem {
        return KPIS_TIME_FILTERS_DURATION_LIST.find(option => option.value === value);
    }

    /**
     * @description Retrieve time filters by a specific duration
     * @param duration
     * @private
     * @return Object<ProjectMetricsTimeFilters>
     */
    private _getTimeFiltersByDuration(duration: number): ProjectMetricsTimeFilters {
        const startDate = this._getDateWeeksAgo(duration).format('YYYY-MM-DD');
        return {startDate, duration};
    }

    /**
     * @description Set current time filters interval in weeks
     * @private
     */
    private _setCurrentTimeFiltersIntervalInWeeks() {
        const startWeek = this._getDateWeeksAgo(this.timeFiltersCurrentOption.value).week();
        const endWeek = this._getDateWeeksAgo(this._dateOffsetWeek).week();

        this.currentTimeFiltersInWeeks = `${startWeek} - ${endWeek}`;
    }

    /**
     * @description Set initial time filters
     * @private
     */
    private _setInitTimeFilters(): void {
        const timeFilters: ProjectMetricsTimeFilters = this._getInitTimeFilters();

        this._updateTimeFilters(timeFilters);
    }

    /**
     * @description Set current time filter on component
     * @param filters<ProjectMetricsTimeFilters>
     */
    private _setTimeFilters(filters: ProjectMetricsTimeFilters): void {
        this.timeFiltersCurrentOption = this._getTimeFiltersOptionByDuration(filters.duration);

        this._setCurrentTimeFiltersIntervalInWeeks();
        this._setKpisTimeFiltersDurationList(filters.duration);
        this._setUrlQueryParams({duration: filters.duration});

        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Set the list of kpis time filters duration for the dropdown
     * @param duration<number>
     */
    private _setKpisTimeFiltersDurationList(duration: number): void {
        this.kpisTimeFiltersDurationList = [{
            items: KPIS_TIME_FILTERS_DURATION_LIST.map(item => ({
                ...item,
                selected: duration === item.value,
            })),
        }];
    }

    /**
     * @description Set query parameters on browser URL
     * @param params
     * @private
     */
    private _setUrlQueryParams(params): void {
        this._router.navigate([], {
            relativeTo: this._activatedRoute,
            queryParams: params,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    /**
     * @description Set component subscriptions
     * @private
     */
    private _setSubscriptions(): void {
        const $resizeEvent = fromEvent(window, 'resize');

        this._disposableSubscriptions.add(
            this._metricsQueries.observeTimeFilters()
                .subscribe(timeFilters => this._setTimeFilters(timeFilters))
        );

        this._disposableSubscriptions.add(
            $resizeEvent
                .subscribe(() => this._checkWindowSize())
        );

    }

    /**
     * @description Unsets component subscriptions
     * @private
     */
    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    /**
     * @description Dispatches action to store to update Time Filters
     * @param timeFilters
     * @private
     */
    private _updateTimeFilters(timeFilters: ProjectMetricsTimeFilters) {
        this._store.dispatch(new MetricsActions.Set.TimeFilters(timeFilters));
    }

    /**
     * @description Verify browsers window size and updates component internal state
     * @private
     */
    private _checkWindowSize(): void {
        const initTimeFilters: ProjectMetricsTimeFilters = this._getInitTimeFilters();

        if (initTimeFilters.duration !== this.timeFiltersCurrentOption.value) {
            this._updateTimeFilters(initTimeFilters);
        }

    }
}
