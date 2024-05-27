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

import {MOCK_METRICS_ITEM_ALL_A} from '../../../../../../../test/mocks/metrics';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {ProjectKpisTooltipComponent} from './project-kpis-tooltip.component';

describe('KPIs tooltip component', () => {
    let fixture: ComponentFixture<ProjectKpisTooltipComponent>;
    let comp: ProjectKpisTooltipComponent;
    let de: DebugElement;

    const KPIS_DATA_BY_WEEK = MOCK_METRICS_ITEM_ALL_A.series.map(item => ({
        name: item.start.toString(),
        value: (item.metrics.rfv || []).map(rfv => ({name: rfv.reason.name, value: rfv.value})),
    }));
    const defaultRfvList = KPIS_DATA_BY_WEEK[0].value;
    const dataAutomationSelectorTooltipTitle = '[data-automation="ss-project-kpis-tooltip-title"]';
    const getNativeElement = (selector: string) => {
        return de.query(By.css(selector)).nativeElement;
    };
    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectKpisTooltipComponent
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectKpisTooltipComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should render the correct title when there are weekly day cards not fulfilled and weekLabel is defined', () => {
        const weekLabel = '54';
        const expectedResult = `Project_Kpis_RfvInWeekTitle ${weekLabel}`;

        comp.list = defaultRfvList;
        comp.weekLabel = weekLabel;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTooltipTitle).innerText).toEqual(expectedResult);
    });

    it('should not render title when weekLabel is not defined', () => {
        expect(de.query(By.css(dataAutomationSelectorTooltipTitle))).toBeNull();
    });

    it('should render the correct title when all weekly day cards have been fulfilled', () => {
        const expectedResult = 'Project_Kpis_AllDayCardsFulfilled';

        comp.value = 100;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTooltipTitle).innerText).toEqual(expectedResult);
    });

    it('should render the correct title when there are no planned day cards for a given week', () => {
        const expectedResult = 'Project_Kpis_NoPlannedDayCards';

        comp.value = 0;
        comp.list = [];

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTooltipTitle).innerText).toEqual(expectedResult);

        comp.value = null;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationSelectorTooltipTitle).innerText).toEqual(expectedResult);
    });

    it('should format correctly the value for Traffic Light Value Pair component', () => {
        const value = 100;
        const expectedResult = `${value} %`;

        expect(comp.trafficLightWithLabelSettings.valueFormatter(value)).toEqual(expectedResult);
    });

});
