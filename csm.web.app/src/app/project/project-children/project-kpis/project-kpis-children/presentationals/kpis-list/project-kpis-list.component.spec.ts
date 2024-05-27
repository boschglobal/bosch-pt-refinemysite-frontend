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
import {
    NameValuePair,
    NameValuePairParser
} from '../../../../../../shared/misc/parsers/name-value-pair.parser';
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {ProjectKpisListComponent} from './project-kpis-list.component';

describe('KPIs list component', () => {
    let comp: ProjectKpisListComponent;
    let fixture: ComponentFixture<ProjectKpisListComponent>;
    let de: DebugElement;

    const dataAutomationLegendListItemSelector = '[data-automation="project-kpis-list-item"]';
    const dataAutomationLegendListItemTotalSelector = '[data-automation="project-kpis-list-total"]';

    const nameValueParserFn = (item: DayCardMetricsResourceRfv) => ({name: item.reason.name, value: item.value});
    const nameValuePairParserInstance = new NameValuePairParser(nameValueParserFn);
    const data: NameValuePair[] = MOCK_METRICS_ITEM_ALL_A.totals.rfv.map(item => nameValuePairParserInstance.parse(item));
    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectKpisListComponent
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
        fixture = TestBed.createComponent(ProjectKpisListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.data = data;
        comp.showTotal = false;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should render all RFVs entries', () => {
        const expectedResult = data.length;

        expect(de.queryAll(By.css(dataAutomationLegendListItemSelector)).length).toBe(expectedResult);
    });

    it('should render the correct RFV value for a given RFV', () => {
        const expectedResult = data[0].value.toString();
        const getFirstItemValue = (listItemsElement) => listItemsElement[0].children[0].nativeElement.innerText;

        expect(getFirstItemValue(de.queryAll(By.css(dataAutomationLegendListItemSelector)))).toBe(expectedResult);
    });

    it('should not render total item by default', () => {
        expect(de.query(By.css(dataAutomationLegendListItemTotalSelector))).toBeFalsy();
    });

    it('should render the correct total value', () => {
        comp.showTotal = true;
        const expectedResult = data.reduce((acc, cur) => acc + cur.value, 0).toString();

        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationLegendListItemTotalSelector))).toBeTruthy();
        expect(de.query(By.css(dataAutomationLegendListItemTotalSelector)).children[0].nativeElement.innerText).toBe(expectedResult);
    });

    it('should not render color tag when none of the items have a color', () => {
        de.queryAll(By.css(dataAutomationLegendListItemSelector)).forEach(item => {
            expect(item.children[0].nativeElement.classList.contains('ss-project-kpis-list__item-color')).toBeFalsy();
        });
    });

    it('should render color tag on all elements when some of the items have a color', () => {
        comp.data = data.map((d, i) => {
            return {
                ...d,
                color: i % 2 === 0 ? '#FF00000' : null
            };
        });

        fixture.detectChanges();

        de.queryAll(By.css(dataAutomationLegendListItemSelector)).forEach(item => {
            expect(item.children[0].nativeElement.classList.contains('ss-project-kpis-list__item-color')).toBeTruthy();
        });
    });
});
