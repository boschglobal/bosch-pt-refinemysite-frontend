/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {By} from '@angular/platform-browser';
import * as moment from 'moment';
import {
    anything,
    instance,
    mock,
    when
} from 'ts-mockito';

import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {IfMediaQueryDirective} from '../../../../../shared/ui/directives/if-media-query.directive';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {
    TasksCalendarModeEnum,
    TasksCalendarModeEnumHelper
} from '../../../../project-common/enums/tasks-calendar-mode.enum';
import {ProjectDateParserStrategy} from '../../../../project-common/helpers/project-date-parser.strategy';
import {TasksCalendarMappingsComponent} from './tasks-calendar-mappings.component';

describe('Tasks Calendar Mappings Component', () => {
    let comp: TasksCalendarMappingsComponent;
    let fixture: ComponentFixture<TasksCalendarMappingsComponent>;

    const dateParserStrategyMock = mock(ProjectDateParserStrategy);
    const calendarScopeHelperMock: CalendarScopeHelper = mock(CalendarScopeHelper);

    const clickEvent = new MouseEvent('click');
    const todayButtonSelector = '[data-automation="today"]';

    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;

    const scopeStart = moment('2018-03-05');
    const modeItems: MenuItem[] = TasksCalendarModeEnumHelper.getMenuItems('select-icon');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            TasksCalendarMappingsComponent,
            IfMediaQueryDirective,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useValue: instance(dateParserStrategyMock),
            },
            {
                provide: CalendarScopeHelper,
                useValue: instance(calendarScopeHelperMock),
            },
        ],
    };

    when(calendarScopeHelperMock.getModeDuration(TasksCalendarModeEnum.SixWeeks)).thenReturn(7 * 6);
    when(calendarScopeHelperMock.getModeDuration(TasksCalendarModeEnum.EighteenWeeks)).thenReturn(7 * 18);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksCalendarMappingsComponent);
        comp = fixture.componentInstance;
        fixture.detectChanges();

        comp.scopeStart = scopeStart;
        comp.mode = TasksCalendarModeEnum.SixWeeks;

        fixture.detectChanges();
    });

    it('should emit scopeStartChange when handlePreviousWeek is called', () => {
        const expectedScopeStart = scopeStart.clone().subtract(1, 'w').startOf('week');

        spyOn(comp.scopeStartChange, 'emit').and.callThrough();

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(expectedScopeStart);

        comp.handleWeekNavigation(-1);
        fixture.detectChanges();

        expect(comp.scopeStartChange.emit).toHaveBeenCalledWith(expectedScopeStart);
    });

    it('should emit scopeStartChange when handleNextWeek is called', () => {
        const expectedScopeStart = scopeStart.clone().add(1, 'w').startOf('week');

        spyOn(comp.scopeStartChange, 'emit').and.callThrough();

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(expectedScopeStart);

        comp.handleWeekNavigation(1);
        fixture.detectChanges();

        expect(comp.scopeStartChange.emit).toHaveBeenCalledWith(expectedScopeStart);
    });

    it('should emit scopeStartChange when currentWeek is called', () => {
        const expectedScopeStart = moment().clone().startOf('week');

        spyOn(comp.scopeStartChange, 'emit').and.callThrough();

        when(dateParserStrategyMock.startOfWeek(anything())).thenReturn(expectedScopeStart);

        comp.handleScopeStartChange();
        fixture.detectChanges();

        expect(comp.scopeStartChange.emit).toHaveBeenCalledWith(expectedScopeStart);
    });

    it('should emit scopeStartChange when handleScopeStartChange is called with a date not within the current week', () => {
        const newScopeStart = scopeStart.clone().add(1, 'w');
        const expectedScopeStart = newScopeStart.clone().startOf('week');

        spyOn(comp.scopeStartChange, 'emit').and.callThrough();

        when(dateParserStrategyMock.startOfWeek(newScopeStart)).thenReturn(expectedScopeStart);
        when(dateParserStrategyMock.isSame(comp.scopeStart, newScopeStart, 'w')).thenReturn(false);

        comp.handleScopeStartChange(newScopeStart);
        fixture.detectChanges();

        expect(comp.scopeStartChange.emit).toHaveBeenCalledWith(expectedScopeStart);
    });

    it('should not emit scopeStartChange when handleScopeStartChange is called with a date within the current week', () => {
        const referenceDate = moment();

        comp.scopeStart = moment().clone().startOf('week');

        spyOn(comp.scopeStartChange, 'emit').and.callThrough();

        when(dateParserStrategyMock.isSame(comp.scopeStart, referenceDate, 'w')).thenReturn(true);

        comp.handleScopeStartChange(referenceDate);
        fixture.detectChanges();

        expect(comp.scopeStartChange.emit).not.toHaveBeenCalled();
    });

    it('should emit modeChange when handleMenuItemClicked is called with a value different from the currently selected', () => {
        const selectedModeItem = modeItems.find(mode => mode.value !== comp.selectedMode);

        spyOn(comp.modeChange, 'emit').and.callThrough();

        comp.handleMenuItemClicked(selectedModeItem);
        fixture.detectChanges();

        expect(comp.modeChange.emit).toHaveBeenCalledWith(selectedModeItem.value);
    });

    it('should not emit modeChange when handleMenuItemClicked is called and new mode is already selected', () => {
        const selectedModeItem = modeItems[1];

        spyOn(comp.modeChange, 'emit').and.callThrough();

        comp.mode = selectedModeItem.value;
        comp.handleMenuItemClicked(selectedModeItem);
        fixture.detectChanges();

        expect(comp.modeChange.emit).not.toHaveBeenCalled();
    });

    it('should emit todayButtonClicked when today button is clicked', () => {
        spyOn(comp.todayButtonClicked, 'emit');

        getElement(todayButtonSelector).dispatchEvent(clickEvent);

        expect(comp.todayButtonClicked.emit).toHaveBeenCalled();
    });
});
