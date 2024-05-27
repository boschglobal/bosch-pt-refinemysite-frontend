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
import {DayCardMetricsResourceRfv} from '../../../../../project-common/api/metrics/resources/metrics.resource';
import {
    ProjectRfvCrLegendComponent,
    ProjectRfvCrLegendListItem
} from './project-rfv-cr-legend.component';

describe('ProjectRfvCrLegendComponent', () => {
    let component: ProjectRfvCrLegendComponent;
    let fixture: ComponentFixture<ProjectRfvCrLegendComponent>;
    let de: DebugElement;

    const listSelector = '[data-automation="project-rfv-cr-legend-list"]';
    const listItemsSelector = '[data-automation="project-rfv-cr-legend-list"] li';
    const clearButtonSelector = '[data-automation="project-rfv-cr-legend-clear"]';
    const itemActiveClass = 'ss-project-rfv-cr-legend__list-item--active';

    const getList = () => de.query(By.css(listSelector));
    const getListItems = () => de.queryAll(By.css(listItemsSelector));
    const getClearButton = () => de.query(By.css(clearButtonSelector));

    const dayCardToLegendItem = (item: DayCardMetricsResourceRfv) => ({
        name: item.reason.name,
        color: item.reason.name,
        active: false
    }) as ProjectRfvCrLegendListItem;

    const clickEvent: Event = new Event('click');
    const enterEvent: Event = new Event('mouseenter');
    const leaveEvent: Event = new Event('mouseleave');

    const MOCK_METRICS_RFV_LEGEND_ITEMS: ProjectRfvCrLegendListItem[] = MOCK_METRICS_ITEM_ALL_A.totals.rfv.map(dayCardToLegendItem);
    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            ProjectRfvCrLegendComponent
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
        fixture = TestBed.createComponent(ProjectRfvCrLegendComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        MOCK_METRICS_RFV_LEGEND_ITEMS.forEach(item => item.active = false);

        component.rfvItems = MOCK_METRICS_RFV_LEGEND_ITEMS;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not have the class "filtered" on the list', () => {
        expect(getList().nativeElement.classList).not.toContain('ss-project-rfv-cr-legend__list--filtered');
    });

    it('should have the class "filtered" on the list when exist active items', () => {
        component.rfvItems[0].active = true;
        fixture.detectChanges();

        expect(getList().nativeElement.classList).toContain('ss-project-rfv-cr-legend__list--filtered');
    });

    it('should render correct number of items on list', () => {
        const expectedResult = MOCK_METRICS_RFV_LEGEND_ITEMS.length;
        const items = getListItems();

        expect(items.length).toEqual(expectedResult);
    });

    it('should not have the class "active" on none of the list items when all items are inactive', () => {
        for (const listItem of getListItems()) {
            expect(listItem.nativeElement.classList).not.toContain(itemActiveClass);
        }
    });

    it('should have the class "active" only on the item that are active', () => {
        const activeItemIndex = 0;
        component.rfvItems[activeItemIndex].active = true;
        fixture.detectChanges();

        const listItems = getListItems();

        for (let i = 0; i < listItems.length; i++) {
            if (i === activeItemIndex) {
                expect(listItems[i].nativeElement.classList).toContain(itemActiveClass);
            } else {
                expect(listItems[i].nativeElement.classList).not.toContain(itemActiveClass);
            }
        }
    });

    it('should not have the clear button when all items are inactive', () => {
        expect(getClearButton()).toBeFalsy();
    });

    it('should have the clear button when some items are active', () => {
        component.rfvItems[0].active = true;
        fixture.detectChanges();

        expect(getClearButton()).toBeTruthy();
    });

    it('should have the clear button when all items are active', () => {
        component.rfvItems.forEach(item => item.active = true);
        fixture.detectChanges();

        expect(getClearButton()).toBeTruthy();
    });

    it('should trigger "rfvItemClick" event when item is clicked', () => {
        spyOn(component.rfvItemClick, 'emit').and.callThrough();
        const index = 0;
        getListItems()[index].nativeElement.dispatchEvent(clickEvent);

        expect(component.rfvItemClick.emit).toHaveBeenCalledWith(MOCK_METRICS_RFV_LEGEND_ITEMS[index]);
    });

    it('should emit rfvReset on reset function call', () => {
        spyOn(component.rfvReset, 'emit').and.callThrough();

        component.reset();

        expect(component.rfvReset.emit).toHaveBeenCalled();
    });

    it('should trigger "rfvItemEnter" event when mouse enter on item area', () => {
        spyOn(component.rfvItemEnter, 'emit').and.callThrough();
        const index = 0;
        getListItems()[index].nativeElement.dispatchEvent(enterEvent);

        expect(component.rfvItemEnter.emit).toHaveBeenCalledWith(MOCK_METRICS_RFV_LEGEND_ITEMS[index]);
    });

    it('should trigger "rfvItemLeave" event when mouse leave on item area', () => {
        spyOn(component.rfvItemLeave, 'emit').and.callThrough();
        const index = 0;
        getListItems()[index].nativeElement.dispatchEvent(leaveEvent);

        expect(component.rfvItemLeave.emit).toHaveBeenCalledWith(MOCK_METRICS_RFV_LEGEND_ITEMS[index]);
    });

});
