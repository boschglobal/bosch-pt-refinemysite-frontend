/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {updateWindowInnerWidth} from '../../../../../../test/helpers';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../app.reducers';
import {WeekDaysEnum} from '../../../../../shared/misc/enums/weekDays.enum';
import {BreakpointsEnum} from '../../../../../shared/ui/constants/breakpoints.constant';
import {DateHelper} from '../../../../../shared/ui/dates/date.helper.service';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {IfMediaQueryDirective} from '../../../../../shared/ui/directives/if-media-query.directive';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectDateParserStrategy} from '../../../../project-common/helpers/project-date-parser.strategy';
import {MetricsActions} from '../../../../project-common/store/metrics/metrics.actions';
import {MetricsQueries} from '../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../project-common/store/metrics/slice/project-metrics-filters';
import {WorkDaysQueries} from '../../../../project-common/store/work-days/work-days.queries';
import {
    KPIS_TIME_FILTERS_DURATION_LIST,
    ProjectKpisTimeFilterComponent
} from './project-kpis-time-filter.component';

describe('KPIs time filter component', () => {
    let component: ProjectKpisTimeFilterComponent;
    let debugElement: DebugElement;
    let fixture: ComponentFixture<ProjectKpisTimeFilterComponent>;
    let store: Store<State>;
    let router: Router;
    let activatedRoute: ActivatedRouteSnapshot;
    let globalCurrentDuration = KPIS_TIME_FILTERS_DURATION_LIST[1].value;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const kpisTimeFilterLabelSelector = '[data-automation="project-kpis-time-filters__option-label"]';
    const kpisTimeFilterDropdownSelectSelector = '[data-automation="project-kpis-time-filters__dropdown-select"]';
    const initialInnerWidth: number = window.innerWidth;
    const filterOptions: MenuItem[] = KPIS_TIME_FILTERS_DURATION_LIST;
    const monthFilterOption: MenuItem = filterOptions[0];
    const trimesterFilterOption: MenuItem = filterOptions[1];
    const defaultFilterOption: MenuItem = monthFilterOption;
    const storeMock: Store<State> = mock(Store);
    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);
    const dateOffsetWeek = 1;
    const workDaysQueriesMock: WorkDaysQueries = mock(WorkDaysQueries);
    const startOfWeek = WeekDaysEnum.FRIDAY;
    const weekDayNumber = DateHelper.getWeekDayMomentNumber(startOfWeek);
    const projectStartOfWeek = moment().day(weekDayNumber);

    const getDateWeeksAgo = (amount: number): Moment => projectStartOfWeek.clone().subtract(amount, 'week');
    const getTimeFiltersByFilterOption = (option: MenuItem): ProjectMetricsTimeFilters => ({
        duration: option.value,
        startDate: getDateWeeksAgo(option.value).format('YYYY-MM-DD'),
    });
    const getElement = (selector: string): HTMLElement => debugElement.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
            RouterTestingModule,
        ],
        declarations: [
            ProjectKpisTimeFilterComponent,
            IfMediaQueryDirective,
        ],
        providers: [
            MetricsQueries,
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        queryParamMap: {
                            get: () => globalCurrentDuration,
                        },
                    },
                },
            },
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: MetricsQueries,
                useValue: instance(metricsQueriesMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: instance(storeMock),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectKpisTimeFilterComponent);
        debugElement = fixture.debugElement;
        component = fixture.componentInstance;

        when(dateParserStrategyMock.startOfWeek()).thenReturn(projectStartOfWeek.clone());
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(getTimeFiltersByFilterOption(defaultFilterOption)));
        when(workDaysQueriesMock.observeStartOfWeek()).thenReturn(of(startOfWeek));

        component.timeFiltersCurrentOption = defaultFilterOption;

        fixture.detectChanges();

        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        activatedRoute = TestBed.inject<ActivatedRouteSnapshot>(ActivatedRoute as any);
    });

    afterEach(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should dispatch set time filters action when user selects a new time filter', () => {
        const timeFilters = getTimeFiltersByFilterOption(monthFilterOption);
        const expectedResult = new MetricsActions.Set.TimeFilters(timeFilters);

        spyOn(store, 'dispatch').and.callThrough();

        component.timeFiltersOptionChange(monthFilterOption);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set the default filter option when there is no URL duration query parameters set', () => {
        const timeFilters = getTimeFiltersByFilterOption(monthFilterOption);
        const expectedResult = new MetricsActions.Set.TimeFilters(timeFilters);

        globalCurrentDuration = null;

        spyOn(store, 'dispatch').and.callThrough();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);

    });

    it('should set the correct URL duration query parameter when a given option is selected', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(getTimeFiltersByFilterOption(trimesterFilterOption)));

        spyOn(router, 'navigate').and.callThrough();

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith([], {
            relativeTo: activatedRoute,
            queryParams: {duration: trimesterFilterOption.value},
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });

    });

    it('should retrieve the correct time week interval string for the current selected filter', () => {
        const timeFilters = getTimeFiltersByFilterOption(trimesterFilterOption);
        const startWeek = getDateWeeksAgo(timeFilters.duration).week();
        const endWeek = getDateWeeksAgo(dateOffsetWeek).week();
        const output = `${startWeek} - ${endWeek}`;

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(getTimeFiltersByFilterOption(trimesterFilterOption)));

        component.ngOnInit();

        expect(component.currentTimeFiltersInWeeks).toEqual(output);

    });

    it('should set time filters to 4 weeks when resolution is less then sm', () => {
        const currentOption = trimesterFilterOption;
        const defaultTimeFilters = getTimeFiltersByFilterOption(monthFilterOption);
        const expectedResult = new MetricsActions.Set.TimeFilters(defaultTimeFilters);

        spyOn(store, 'dispatch').and.callThrough();

        component.timeFiltersCurrentOption = currentOption;

        updateWindowInnerWidth(BreakpointsEnum.xs);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should render the 4 weeks label when resolution is less then sm', () => {
        component.timeFiltersCurrentOption = trimesterFilterOption;
        component.kpisTimeFiltersDurationList = [{items: KPIS_TIME_FILTERS_DURATION_LIST}];

        updateWindowInnerWidth(BreakpointsEnum.xs);

        fixture.detectChanges();

        expect(getElement(kpisTimeFilterLabelSelector)).toBeTruthy();
    });

    it('should render the time filters select button option when resolution is higher then xs', () => {
        component.timeFiltersCurrentOption = trimesterFilterOption;
        component.kpisTimeFiltersDurationList = [{items: KPIS_TIME_FILTERS_DURATION_LIST}];

        updateWindowInnerWidth(BreakpointsEnum.md);

        fixture.detectChanges();

        expect(getElement(kpisTimeFilterDropdownSelectSelector)).not.toBeNull();
    });
});
