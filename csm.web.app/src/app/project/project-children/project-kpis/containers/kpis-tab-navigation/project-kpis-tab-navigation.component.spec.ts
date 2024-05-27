/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    NavigationTabsComponent,
    NavigationTabsRoutes
} from '../../../../../shared/misc/presentationals/navigation-tabs/navigation-tabs.component';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {MetricsQueries} from '../../../../project-common/store/metrics/metrics.queries';
import {ProjectMetricsTimeFilters} from '../../../../project-common/store/metrics/slice/project-metrics-filters';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';
import {KPIS_TIME_FILTERS_DURATION_LIST} from '../kpis-time-filter/project-kpis-time-filter.component';
import {ProjectKpisTabNavigationComponent} from './project-kpis-tab-navigation.component';

describe('KPIs tab navigation component', () => {
    let component: ProjectKpisTabNavigationComponent;
    let fixture: ComponentFixture<ProjectKpisTabNavigationComponent>;

    const metricsQueriesMock: MetricsQueries = mock(MetricsQueries);
    const filterOptions: MenuItem[] = KPIS_TIME_FILTERS_DURATION_LIST;
    const monthFilterOption: MenuItem = filterOptions[0];
    const trimesterFilterOption: MenuItem = filterOptions[1];
    const defaultFilterOption: MenuItem = monthFilterOption;
    const referenceDate: Moment = moment();
    const routes: NavigationTabsRoutes[] = [
        {
            label: 'Project_Kpis_FulfilledDayCards',
            link: PROJECT_ROUTE_PATHS.ppc,
            queryParams: {},
        },
        {
            label: 'Generic_Variance',
            link: PROJECT_ROUTE_PATHS.rfv,
            queryParams: {},
        },
    ];
    const getTimeFiltersByFilterOption = (option: MenuItem): ProjectMetricsTimeFilters => ({
        duration: option.value,
        startDate: referenceDate.clone().startOf('week').subtract(option.value, 'week').format('YYYY-MM-DD'),
    });

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
            RouterTestingModule,
        ],
        declarations: [
            ProjectKpisTabNavigationComponent,
            NavigationTabsComponent,
        ],
        providers: [
            {
                provide: MetricsQueries,
                useValue: instance(metricsQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectKpisTabNavigationComponent);
        component = fixture.componentInstance;

        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(getTimeFiltersByFilterOption(defaultFilterOption)));

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should update routes queryParams based on the current time filters', () => {
        when(metricsQueriesMock.observeTimeFilters()).thenReturn(of(getTimeFiltersByFilterOption(trimesterFilterOption)));

        const expectedResult = routes.map(route => {
            route.queryParams = Object.assign(route.queryParams, {duration: trimesterFilterOption.value});
            return route;
        });

        component.ngOnInit();

        expect(component.routes).toEqual(expectedResult);
    });
});
