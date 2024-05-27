/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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

import {DateParserStrategyStub} from '../../../../test/stubs/date-parser.strategy.stub';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {DateParserStrategy} from '../dates/date-parser.strategy';
import {FlyoutDirective} from '../flyout/directive/flyout.directive';
import {FlyoutService} from '../flyout/service/flyout.service';
import {DatepickerCalendarComponent} from '../forms/datepicker-calendar/datepicker-calendar.component';
import {
    CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN,
    ScopeDropdownComponent
} from './scope-dropdown.component';
import {ScopeDropdownTestComponent} from './scope-dropdown.test.component';

describe('Scope Dropdown Component', () => {
    let component: ScopeDropdownComponent;
    let testHostComp: ScopeDropdownTestComponent;
    let debugElement: DebugElement;
    let fixture: ComponentFixture<ScopeDropdownTestComponent>;
    let flyoutService: FlyoutService;
    let translateService: TranslateService;

    const scopeDropdownComponentSelector = 'ss-scope-dropdown';
    const scopeDropdownLabelSelector = '[data-automation="scope-dropdown-label"]';
    const scopeDropdownButtonSelector = '[data-automation="scope-dropdown"]';

    const getScopeDropdownLabel = () => debugElement.query(By.css(scopeDropdownLabelSelector));
    const getScopeDropdownButtonElement = () => debugElement.query(By.css(scopeDropdownButtonSelector)).nativeElement;

    const scopeStart = moment('2021-07-05');
    const scopeDuration = 42;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            DatepickerCalendarComponent,
            FlyoutDirective,
            ScopeDropdownComponent,
            ScopeDropdownTestComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScopeDropdownTestComponent);
        testHostComp = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css(scopeDropdownComponentSelector));
        component = debugElement.componentInstance;

        flyoutService = TestBed.inject(FlyoutService);
        translateService = TestBed.inject(TranslateService);

        testHostComp.scopeStart = scopeStart;
        testHostComp.scopeDuration = scopeDuration;

        fixture.detectChanges();
    });

    it('should render the right label when scope within the same year', () => {
        const start = moment('2021-07-22').startOf('week');
        const duration = 42;
        const formattedStart = start.clone()
            .startOf('week')
            .format('MMM');
        const formattedEnd = start.clone()
            .startOf('week')
            .add(duration - 1, 'd')
            .endOf('week')
            .format('MMM YYYY');
        const expectedResult = `${formattedStart} – ${formattedEnd}`;

        testHostComp.scopeStart = start;
        testHostComp.scopeDuration = duration;
        fixture.detectChanges();

        expect(getScopeDropdownLabel().nativeElement.innerText).toBe(expectedResult);
    });

    it('should render the right label when scope traverses years', () => {
        const start = moment('2021-12-25').startOf('week');
        const duration = 42;
        const formattedStart = start.clone()
            .startOf('week')
            .format('MMM YYYY');
        const formattedEnd = start.clone()
            .startOf('week')
            .add(duration - 1, 'd')
            .endOf('week')
            .format('MMM YYYY');
        const expectedResult = `${formattedStart} – ${formattedEnd}`;

        testHostComp.scopeStart = start;
        testHostComp.scopeDuration = duration;
        fixture.detectChanges();

        expect(getScopeDropdownLabel().nativeElement.innerText).toBe(expectedResult);
    });

    it('should update label when language changes', () => {
        const start = moment('2021-07-05');
        const duration = 42;
        const newLanguage = 'de';
        const formattedStartEN = start.clone()
            .startOf('week')
            .format('MMM');
        const formattedEndEN = start.clone()
            .startOf('week')
            .add(duration - 1, 'd')
            .endOf('week')
            .format('MMM YYYY');
        const formattedStartDE = start.clone()
            .locale(newLanguage)
            .startOf('week')
            .format('MMM');
        const formattedEndDE = start.clone()
            .locale(newLanguage)
            .startOf('week')
            .add(duration - 1, 'd')
            .endOf('week')
            .format('MMM YYYY');
        const expectedResultEN = `${formattedStartEN} – ${formattedEndEN}`;
        const expectedResultDE = `${formattedStartDE} – ${formattedEndDE}`;

        testHostComp.scopeStart = start;
        testHostComp.scopeDuration = duration;
        fixture.detectChanges();

        expect(getScopeDropdownLabel().nativeElement.innerText).toBe(expectedResultEN);

        translateService.setDefaultLang(newLanguage);
        fixture.detectChanges();

        expect(getScopeDropdownLabel().nativeElement.innerText).toBe(expectedResultDE);
    });

    it('should round the received scopeStart to the start of the ISO Week', () => {
        const startOfWeek = moment().startOf('week');
        const start = startOfWeek.clone().add(2, 'd').startOf('week');

        testHostComp.scopeStart = start;
        fixture.detectChanges();

        expect(component.scopeStart.format()).toEqual(startOfWeek.format());
    });

    it('should emit scopeStartChange when a new date is picked and close the calendar', () => {
        spyOn(component.scopeStartChange, 'emit');
        spyOn(flyoutService, 'close');
        const start = moment().startOf('week');

        component.handleScopeStartChange(start);

        expect(component.scopeStartChange.emit).toHaveBeenCalledWith(start);
        expect(flyoutService.close).toHaveBeenCalledWith(component.flyoutId);
    });

    it('should round the picked start to the start of the ISO Week before emitting scopeStartChange', () => {
        spyOn(component.scopeStartChange, 'emit');
        const startOfWeek = moment().startOf('week');
        const start = startOfWeek.clone().add(2, 'd');

        component.handleScopeStartChange(start);

        expect(component.scopeStartChange.emit).toHaveBeenCalledWith(startOfWeek);
    });

    it('should add CSS_CLASS_CALENDAR_IS_OPEN when the calendar is opened', () => {
        flyoutService.openEvents.next(component.flyoutId);

        expect(getScopeDropdownButtonElement().classList).toContain(CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN);
    });

    it('should remove CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN when the calendar is closed', () => {
        flyoutService.openEvents.next(component.flyoutId);

        expect(getScopeDropdownButtonElement().classList).toContain(CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN);

        flyoutService.closeEvents.next(component.flyoutId);

        expect(getScopeDropdownButtonElement().classList).not.toContain(CSS_CLASS_SCOPE_DROPDOWN_IS_OPEN);
    });

    it('should set right icon rotation when the calendar is opened', () => {
        flyoutService.openEvents.next(component.flyoutId);

        expect(component.iconRotation).toBe(90);
    });

    it('should set right icon rotation when the calendar is closed', () => {
        flyoutService.closeEvents.next(component.flyoutId);

        expect(component.iconRotation).toBe(-90);
    });
});
