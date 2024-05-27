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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import * as moment from 'moment';

import {isElementPropertyColor} from '../../../../../test/helpers';
import {MOCK_TASK_2} from '../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {IconModule} from '../../../../shared/ui/icons/icon.module';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {DayMonthFullYearDateFormatEnum} from '../../enums/date-format.enum';
import {ProjectTasksStatusLabelComponent} from '../tasks-status-label/project-tasks-status-label.component';
import {TaskOverviewCardComponent} from './task-overview-card.component';
import {TaskOverviewCardTestComponent} from './task-overview-card.test.component';

describe('Task Overview Card Component', () => {
    let testHostComp: TaskOverviewCardTestComponent;
    let component: TaskOverviewCardComponent;
    let fixture: ComponentFixture<TaskOverviewCardTestComponent>;
    let de: DebugElement;
    let mockCssSupportsHas;

    const taskOverviewCardSelector = 'ss-task-overview-card';
    const dataAutomationTaskOverviewCardSelector = '[data-automation="task-overview-card"]';
    const dataAutomationTaskOverviewCardButtonSelector = '[data-automation="task-overview-card-button"]';
    const dataAutomationTaskOverviewCardSkeletonSelector = '[data-automation="task-overview-card-skeleton"]';
    const dataAutomationTaskOverviewCardIconElementSelector = '[data-automation="task-overview-card-icon-element"]';
    const dataAutomationTaskOverviewCardNameSelector = '[data-automation="task-overview-card-name"]';
    const dataAutomationTaskOverviewCardStartDateSelector = '[data-automation="task-overview-card-start-date"]';
    const dataAutomationTaskOverviewCardEndDateSelector = '[data-automation="task-overview-card-end-date"]';
    const dataAutomationTaskOverviewCardTimeScopeSelector = '[data-automation="task-overview-card-time-scope"]';
    const dataAutomationTaskOverviewCardWorkingAreaSelector = '[data-automation="task-overview-card-working-area"]';
    const dataAutomationTaskOverviewCardActionsSelector = '[data-automation="task-overview-card-actions"]';

    const taskOverviewCardCriticalCssClass = 'ss-task-overview-card--critical';
    const taskOverviewCardFallbackHasCssClass = 'ss-task-overview-card--fallback-has';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
            TranslateModule,
            UIModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            ProjectTasksStatusLabelComponent,
            TaskOverviewCardComponent,
            TaskOverviewCardTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskOverviewCardTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(taskOverviewCardSelector));
        component = de.componentInstance;

        mockCssSupportsHas = false;
        CSS.supports = () => mockCssSupportsHas;

        testHostComp.task = MOCK_TASK_2;

        fixture.detectChanges();
    });

    it('should render correct background color for the task card icon element', () => {
        const iconElement = getElement(dataAutomationTaskOverviewCardIconElementSelector);
        const craftColor = MOCK_TASK_2.projectCraft.color;

        expect(isElementPropertyColor(iconElement, 'background-color', craftColor)).toBeTruthy();
    });

    it('should render correct name for task card name element', () => {
        expect(getElement(dataAutomationTaskOverviewCardNameSelector).innerText).toBe(MOCK_TASK_2.name);
    });

    it('should render correct start and end date for task card time scope elements', () => {
        const currentLang = 'en';
        const dateFormat: string = DayMonthFullYearDateFormatEnum[currentLang];
        const start = moment(MOCK_TASK_2.schedule.start).locale(currentLang).format(dateFormat);
        const end = moment(MOCK_TASK_2.schedule.end).locale(currentLang).format(dateFormat);

        expect(getElement(dataAutomationTaskOverviewCardStartDateSelector).innerText).toBe(start);
        expect(getElement(dataAutomationTaskOverviewCardEndDateSelector).innerText).toBe(end);
    });

    it('should add a title to the time scope element', () => {
        const currentLang = 'en';
        const dateFormat: string = DayMonthFullYearDateFormatEnum[currentLang];
        const start = moment(MOCK_TASK_2.schedule.start).locale(currentLang).format(dateFormat);
        const end = moment(MOCK_TASK_2.schedule.end).locale(currentLang).format(dateFormat);
        const timeScope = `${start} - ${end}`;

        expect(getElement(dataAutomationTaskOverviewCardTimeScopeSelector).title).toBe(timeScope);
    });

    it('should render correct working area name for task card working area element', () => {
        expect(getElement(dataAutomationTaskOverviewCardWorkingAreaSelector).innerText).toBe(MOCK_TASK_2.workArea.displayName);
    });

    it('should render Generic_WithoutArea label when task does not have working area', () => {
        const expectedLabel = 'Generic_WithoutArea';
        testHostComp.task = {
            ...MOCK_TASK_2,
            workArea: null,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardWorkingAreaSelector).innerText).toBe(expectedLabel);
    });

    it('should not render task card actions element if card has no actions', () => {
        testHostComp.actions = [];

        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardActionsSelector)).not.toBeDefined();
    });

    it('should render task card actions element if card has actions', () => {
        testHostComp.actions = [{
            items: [{
                id: 'foo',
                label: 'foo',
                type: 'button',
            }],
        }];
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardActionsSelector)).toBeDefined();
    });

    it('should emit actionClicked when handleDropdownItemClicked is called', () => {
        const item: MenuItem = {
            id: 'foo',
            label: 'foo',
            type: 'button',
        };

        spyOn(component.actionClicked, 'emit');

        component.handleDropdownItemClicked(item);

        expect(component.actionClicked.emit).toHaveBeenCalledWith(item);
    });

    it('should render the skeleton when task is not provided', () => {
        testHostComp.task = null;
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSkeletonSelector)).toBeTruthy();
    });

    it('should not render the skeleton when task is provided', () => {
        testHostComp.task = MOCK_TASK_2;
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSkeletonSelector)).toBeFalsy();
    });

    it('should style the task card as critical when isCritical is set to true ', () => {
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSelector).classList).toContain(taskOverviewCardCriticalCssClass);
    });

    it('should not style the task card as critical when isCritical is set to false', () => {
        testHostComp.isCritical = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSelector).classList).not.toContain(taskOverviewCardCriticalCssClass);
    });

    it('should emit itemClicked on click of the content area of the card', () => {
        spyOn(component.itemClicked, 'emit').and.callThrough();

        getElement(dataAutomationTaskOverviewCardButtonSelector).dispatchEvent(new Event('click'));

        expect(component.itemClicked.emit).toHaveBeenCalledWith(component.task);
    });

    it('should add the fallback-has class when the browser does not support CSS :has', () => {
        component.useCssHasFallback = true;

        testHostComp.triggerChangeDetection();
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSelector).classList).toContain(taskOverviewCardFallbackHasCssClass);
    });

    it('should not add the fallback-has class when the browser supports CSS :has', () => {
        component.useCssHasFallback = false;

        testHostComp.triggerChangeDetection();
        fixture.detectChanges();

        expect(getElement(dataAutomationTaskOverviewCardSelector).classList).not.toContain(taskOverviewCardFallbackHasCssClass);
    });

});
