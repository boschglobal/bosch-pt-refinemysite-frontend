/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {FlyoutDirective} from '../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {
    DAYCARD_SLOT_LOCKED,
    DAYCARD_SLOT_LOCKED_HOLIDAY,
    DayCardLockedComponent,
} from './day-card-locked.component';
import {DayCardLockedTestComponent} from './day-card-locked.test.component';

describe('Day Card Locked Component', () => {
    let testHostComp: DayCardLockedTestComponent;
    let component: DayCardLockedComponent;
    let fixture: ComponentFixture<DayCardLockedTestComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;

    const tooltipFlyoutId = 'ssDayCardLockedTooltip';

    const dayCardLockedComponentSelector = 'ss-day-card-locked';
    const dataAutomationDayCardLocked = '[data-automation="day-card-locked"]';
    const dataAutomationHolidayNameLabel = '[data-automation="holiday-name"]';
    const dataAutomationDefaultMessageLabel = '[data-automation="default-message"]';
    const dataAutomationTooltipFlyoutSelector = '[data-automation="day-card-locked-tooltip-flyout"]';

    const mouseEnterEvent: Event = new Event('mouseenter');

    const getFlyoutContent = (selector: string) =>
        (document.querySelector(dataAutomationTooltipFlyoutSelector)).querySelector(selector).innerHTML;
    const openFlyout = () => de.query(By.css(dataAutomationDayCardLocked)).nativeElement.dispatchEvent(mouseEnterEvent);
    const clearFlyout = () => {
        if (flyoutService.isFlyoutOpen(tooltipFlyoutId)) {
            flyoutService.close(tooltipFlyoutId);
        }
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslateModule],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
        declarations: [
            DayCardLockedComponent,
            DayCardLockedTestComponent,
            FlyoutDirective,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardLockedTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(dayCardLockedComponentSelector));
        component = de.componentInstance;

        flyoutService = TestBed.inject(FlyoutService);

        fixture.detectChanges();
    });

    afterEach((done) => {
        clearFlyout();
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display holiday name when an holiday is provided', () => {
        const holiday = {name: 'foo', date: moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT)};
        testHostComp.holiday = holiday;

        fixture.detectChanges();

        openFlyout();

        expect(getFlyoutContent(dataAutomationHolidayNameLabel)).toContain(holiday.name);
    });

    it('should display default message when an holiday is not provided', () => {
        testHostComp.holiday = undefined;

        fixture.detectChanges();

        openFlyout();

        expect(getFlyoutContent(dataAutomationDefaultMessageLabel)).toContain('DayCard_Locked_TooltipMessage');
    });

    it(`should set icon name to ${DAYCARD_SLOT_LOCKED_HOLIDAY} when slot is holiday`, () => {
        testHostComp.holiday = {name: 'foo', date: moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT)};

        fixture.detectChanges();

        expect(component.icon.name).toEqual(DAYCARD_SLOT_LOCKED_HOLIDAY);
    });

    it(`should set icon name to ${DAYCARD_SLOT_LOCKED} when slot is not holiday`, () => {
        testHostComp.holiday = undefined;

        fixture.detectChanges();

        expect(component.icon.name).toEqual(DAYCARD_SLOT_LOCKED);
    });
});
