/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
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
import {TranslateService} from '@ngx-translate/core';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {DayMonthFullYearDateFormatEnum} from '../../enums/date-format.enum';
import {MilestoneMarkerComponent} from '../milestone-marker/milestone-marker.component';
import {MilestoneOverviewCardComponent} from './milestone-overview-card.component';
import {MilestoneOverviewCardTestComponent} from './milestone-overview-card.test.component';

describe('Milestone Overview Card Component', () => {
    let testHostComp: MilestoneOverviewCardTestComponent;
    let component: MilestoneOverviewCardComponent;
    let fixture: ComponentFixture<MilestoneOverviewCardTestComponent>;
    let de: DebugElement;

    const milestoneOverviewCardSelector = 'ss-milestone-overview-card';
    const dataAutomationMilestoneOverviewCardSelector = '[data-automation="milestone-overview-card"]';
    const dataAutomationMilestoneOverviewCardButtonSelector = '[data-automation="milestone-overview-card-button"]';
    const dataAutomationMilestoneOverviewCardSkeletonSelector = '[data-automation="milestone-overview-card-skeleton"]';
    const dataAutomationMilestoneOverviewCardNameSelector = '[data-automation="milestone-overview-card-name"]';
    const dataAutomationMilestoneOverviewCardDateSelector = '[data-automation="milestone-overview-card-date"]';
    const dataAutomationMilestoneOverviewCardLocationSelector = '[data-automation="milestone-overview-card-location"]';
    const dataAutomationMilestoneOverviewCardActionsSelector = '[data-automation="milestone-overview-card-actions"]';

    const milestoneOverviewCardCriticalCssClass = 'ss-milestone-overview-card--critical';
    const milestoneOverviewCardFallbackHasCssClass = 'ss-milestone-overview-card--fallback-has';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            MilestoneOverviewCardComponent,
            MilestoneOverviewCardTestComponent,
            MilestoneMarkerComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneOverviewCardTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(milestoneOverviewCardSelector));
        component = de.componentInstance;

        testHostComp.milestone = MOCK_MILESTONE_WORKAREA;

        fixture.detectChanges();
    });

    it('should set milestoneMarker with the correct data', () => {
        const expectedResult = {
            type: MOCK_MILESTONE_CRAFT.type,
            color: MOCK_MILESTONE_CRAFT.craft.color,
        };

        testHostComp.milestone = MOCK_MILESTONE_CRAFT;

        fixture.detectChanges();

        expect(component.milestoneMarker).toEqual(expectedResult);
    });

    it('should render correct name for milestone card name element', () => {
        expect(getElement(dataAutomationMilestoneOverviewCardNameSelector).innerText).toBe(MOCK_MILESTONE_WORKAREA.name);
    });

    it('should render correct date for milestone card date element', () => {
        const currentLang = 'en';
        const expectedDate = MOCK_MILESTONE_WORKAREA.date.locale(currentLang).format(DayMonthFullYearDateFormatEnum[currentLang]);

        expect(getElement(dataAutomationMilestoneOverviewCardDateSelector).innerText).toBe(expectedDate);
    });

    it('should render correct location for top row milestone card location element', () => {
        testHostComp.milestone = MOCK_MILESTONE_HEADER;

        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardLocationSelector).innerText)
            .toBe('Generic_TopRow');
    });

    it('should render correct location for workArea milestone card location element', () => {
        testHostComp.milestone = MOCK_MILESTONE_WORKAREA;

        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardLocationSelector).innerText)
            .toBe(MOCK_MILESTONE_WORKAREA.workArea.displayName);
    });

    it('should render correct location for without workArea milestone card location element', () => {
        const expectedLabel = 'Generic_WithoutArea';

        testHostComp.milestone = {
            ...MOCK_MILESTONE_WORKAREA,
            workArea: null,
        };

        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardLocationSelector).innerText).toBe(expectedLabel);
    });

    it('should not render task card actions element if card has no actions', () => {
        testHostComp.actions = [];

        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardActionsSelector)).not.toBeDefined();
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

        expect(getElement(dataAutomationMilestoneOverviewCardActionsSelector)).toBeDefined();
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

    it('should render the skeleton when milestone is not provided', () => {
        testHostComp.milestone = null;
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSkeletonSelector)).toBeTruthy();
    });

    it('should not render the skeleton when milestone is provided', () => {
        testHostComp.milestone = MOCK_MILESTONE_CRAFT;
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSkeletonSelector)).toBeFalsy();
    });

    it('should style the milestone card as critical when critical is set to true ', () => {
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSelector).classList).toContain(milestoneOverviewCardCriticalCssClass);
    });

    it('should not style the milestone card as critical when critical is set to false', () => {
        testHostComp.isCritical = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSelector).classList).not.toContain(milestoneOverviewCardCriticalCssClass);
    });

    it('should emit itemClicked when the content area of the card is clicked', () => {
        spyOn(component.itemClicked, 'emit').and.callThrough();
        getElement(dataAutomationMilestoneOverviewCardButtonSelector).dispatchEvent(new Event('click'));

        expect(component.itemClicked.emit).toHaveBeenCalledWith(testHostComp.milestone);
    });

    it('should add the fallback-has class when the browser does not support CSS :has', () => {
        component.useCssHasFallback = true;

        testHostComp.triggerChangeDetection();
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSelector).classList).toContain(milestoneOverviewCardFallbackHasCssClass);
    });

    it('should not add the fallback-has class when the browser supports CSS :has', () => {
        component.useCssHasFallback = false;

        testHostComp.triggerChangeDetection();
        fixture.detectChanges();

        expect(getElement(dataAutomationMilestoneOverviewCardSelector).classList).not.toContain(milestoneOverviewCardFallbackHasCssClass);
    });

});
