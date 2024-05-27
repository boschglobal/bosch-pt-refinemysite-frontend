/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_METRICS_LIST_ALL,
    MOCK_METRICS_LIST_GROUPED,
} from '../../../../../test/mocks/metrics';
import {ProjectMetricsTimeFilters} from '../../store/metrics/slice/project-metrics-filters';
import {
    MetricsService,
    ProjectMetricsTypeFilters
} from './metrics.service';
import {MetricsListResource} from './resources/metrics-list.resource';

describe('Metrics Service', () => {
    let metricsService: MetricsService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const projectId = '1234';
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}/projects/${projectId}/metrics`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    const getTimeFilterParamsAll = (timeFilters?: ProjectMetricsTimeFilters): ProjectMetricsTimeFilters => {
        const defaultFilters: ProjectMetricsTimeFilters = new ProjectMetricsTimeFilters();
        defaultFilters.startDate = '2018-03-01';
        defaultFilters.duration = 4;
        return Object.assign({}, defaultFilters, timeFilters);
    };

    const getTypeFilterParamsAll = (typeFilters?: ProjectMetricsTypeFilters): ProjectMetricsTypeFilters => {
        const defaultFilters: ProjectMetricsTypeFilters = new ProjectMetricsTypeFilters();
        defaultFilters.type = ['rfv', 'ppc'];
        defaultFilters.grouped = true;
        return Object.assign({}, defaultFilters, typeFilters);
    };

    const getFilterParams2String = (filter): string => {
        return Object.keys(filter).reduce((queryString, param): any => {
            queryString.push(`${param}=${filter[param]}`);
            return queryString;
        }, []).join('&');
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        metricsService = TestBed.inject(MetricsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll with all query parameters and return metrics from a project', () => {
        const timeFilter = getTimeFilterParamsAll();
        const typeFilter = getTypeFilterParamsAll();
        const findAllParamUrl = `${baseUrl}?${[getFilterParams2String(timeFilter), getFilterParams2String(typeFilter)].join('&')}`;

        metricsService.findAll(projectId, timeFilter, typeFilter)
            .subscribe((response: MetricsListResource) =>
                expect(response).toEqual(MOCK_METRICS_LIST_GROUPED));

        request = httpMock.expectOne(findAllParamUrl);
        request.flush(MOCK_METRICS_LIST_GROUPED);
    });

    it('should call findAll with query parameter `grouped` set to false and return metrics from a project', () => {
        const timeFilter = getTimeFilterParamsAll();
        const typeFilter = getTypeFilterParamsAll({grouped: false, type: ['rfv', 'ppc']});
        const findAllParamUrl = `${baseUrl}?${[getFilterParams2String(timeFilter), getFilterParams2String(typeFilter)].join('&')}`;

        metricsService.findAll(projectId, timeFilter, typeFilter)
            .subscribe((response: MetricsListResource) =>
                expect(response).toEqual(MOCK_METRICS_LIST_ALL));

        request = httpMock.expectOne(findAllParamUrl);
        request.flush(MOCK_METRICS_LIST_ALL);
    });

});
