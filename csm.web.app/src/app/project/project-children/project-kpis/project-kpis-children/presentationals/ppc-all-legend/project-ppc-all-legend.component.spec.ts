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
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_METRICS_ITEM_ALL_A} from '../../../../../../../test/mocks/metrics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {TimeScope} from '../../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {
    NameValuePair,
    NameValuePairParser
} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DateParserStrategy} from '../../../../../../shared/ui/dates/date-parser.strategy';
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {ProjectDateParserStrategy} from '../../../../../project-common/helpers/project-date-parser.strategy';
import {ProjectPpcAllLegendComponent} from './project-ppc-all-legend.component';

describe('PPC All legend component', () => {
    let comp: ProjectPpcAllLegendComponent;
    let fixture: ComponentFixture<ProjectPpcAllLegendComponent>;
    let de: DebugElement;

    const dateParserStrategyMock: ProjectDateParserStrategy = mock(ProjectDateParserStrategy);

    const dataAutomationLegendTitle = '[data-automation="project-ppc-all-legend-title"]';
    const dataAutomationNoItems = '[data-automation="project-ppc-all-legend-no-items"]';
    const dataAutomationKpisList = '[data-automation="project-ppc-all-legend-kpis-list"]';
    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const nameValueParserFn = (item: DayCardMetricsResourceRfv) => ({name: item.reason.name, value: item.value});
    const nameValuePairParserInstance = new NameValuePairParser(nameValueParserFn);
    const KPIS_PPC_ALL_LEGEND_DATA: NameValuePair[] = MOCK_METRICS_ITEM_ALL_A.totals.rfv
        .map(item => nameValuePairParserInstance.parse(item));
    const KPIS_PPC_ALL_LEGEND_TIME_INTERVAL_DATA: TimeScope = {
        start: moment('2018-12-24'),
        end: moment('2019-03-17'),
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectPpcAllLegendComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
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
        fixture = TestBed.createComponent(ProjectPpcAllLegendComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should render the correct RFVs totals number in title', () => {
        const expectedResult = KPIS_PPC_ALL_LEGEND_DATA.reduce((total, item) => total + item.value, 0);
        comp.rfvListTotals = KPIS_PPC_ALL_LEGEND_DATA;

        fixture.detectChanges();

        const title = getElement(dataAutomationLegendTitle).innerText.split(' ');
        const totalNumber = parseInt(title[0], 10);

        expect(totalNumber).toEqual(expectedResult);
    });

    it('should display the correct week range label', () => {
        const {start, end} = KPIS_PPC_ALL_LEGEND_TIME_INTERVAL_DATA;
        const startWeekNumber = start.week();
        const endWeekNumber = end.week();
        const expectedResult = `${startWeekNumber} - ${endWeekNumber}`;

        when(dateParserStrategyMock.week(start)).thenReturn(startWeekNumber);
        when(dateParserStrategyMock.week(end)).thenReturn(endWeekNumber);

        comp.dataTimeInterval = KPIS_PPC_ALL_LEGEND_TIME_INTERVAL_DATA;

        fixture.detectChanges();

        expect(comp.timeInterval).toBe(expectedResult);
    });

    it('should display empty week range label when there is no date information', () => {
        comp.dataTimeInterval = null;

        expect(comp.timeInterval).toBeNull();
    });

    it('should return 0 for totalNumberOfRfv when RFV Totals List is set to null', () => {
        comp.rfvListTotals = null;

        expect(comp.totalNumberOfRfv).toBe(0);
    });

    it('should display an empty state when RFV Totals List is empty', () => {
        comp.rfvListTotals = [];

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItems)).toBeTruthy();
        expect(getElement(dataAutomationKpisList)).toBeFalsy();
    });

    it('should not display an empty state when RFV Totals List is not empty', () => {
        comp.rfvListTotals = KPIS_PPC_ALL_LEGEND_DATA;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItems)).toBeFalsy();
        expect(getElement(dataAutomationKpisList)).toBeTruthy();
    });
});
