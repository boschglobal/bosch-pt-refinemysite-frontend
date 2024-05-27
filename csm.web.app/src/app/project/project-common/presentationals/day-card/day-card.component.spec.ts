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
import {TranslateModule} from '@ngx-translate/core';

import {MOCK_DAY_CARD_A} from '../../../../../test/mocks/day-cards';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {DayCard} from '../../models/day-cards/day-card';
import {
    CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT,
    CSS_CLASS_DAY_CARD_COPYING,
    CSS_CLASS_DAY_CARD_HAS_SELECTED_ITEMS,
    CSS_CLASS_DAY_CARD_MOVABLE,
    CSS_CLASS_DAY_CARD_MULTI_SELECTING,
    CSS_CLASS_DAY_CARD_RELEVANT,
    CSS_CLASS_DAY_CARD_SELECTED,
    DayCardComponent
} from './day-card.component';
import {DayCardTestComponent} from './day-card.test.component';

describe('Day Card Component', () => {
    let fixture: ComponentFixture<DayCardTestComponent>;
    let comp: DayCardComponent;
    let testHostComp: DayCardTestComponent;
    let de: DebugElement;

    const dayCard: DayCard = MOCK_DAY_CARD_A;

    const dayCardHostSelector = 'ss-day-card';
    const dataAutomationSelectorCard = '[data-automation="day-card"]';
    const dataAutomationSelectorTitle = '[data-automation="day-card-title"]';
    const dataAutomationSelectorManpower = '[data-automation="day-card-manpower"]';
    const dataAutomationSelectorStatus = '[data-automation="day-card-status"]';

    const getElement = (selector: string): HTMLElement => de.nativeElement.querySelector(selector);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslateModule.forRoot()],
        declarations: [
            DayCardComponent,
            DayCardTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(dayCardHostSelector));
        comp = de.componentInstance;

        testHostComp.dayCard = dayCard;
        testHostComp.isCopying = false;
        testHostComp.isRelevant = true;
        fixture.detectChanges();
    });

    it('should render title', () => {
        const expectedResult = dayCard.title;

        expect(getElement(dataAutomationSelectorTitle).textContent.trim()).toBe(expectedResult);
    });

    it('should render manpower', () => {
        const expectedResult = dayCard.manpower.toString();

        expect(getElement(dataAutomationSelectorManpower).textContent.trim()).toBe(expectedResult);
    });

    it('should not render status icon for Open status', () => {
        testHostComp.dayCard = Object.assign({}, dayCard, {
            status: DayCardStatusEnum.Open,
        });
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorStatus)).toBeNull();
    });

    it('should render status icon for Approved status', () => {
        testHostComp.dayCard = Object.assign({}, dayCard, {
            status: DayCardStatusEnum.Approved,
        });
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorStatus)).toBeTruthy();
    });

    it('should retrieve right configuration for Approved status', () => {
        const expectedIconModel: IconModel = {
            name: 'day-card-status-approved-filled',
            color: COLORS.light_green,
        };

        testHostComp.dayCard = Object.assign({}, dayCard, {
            status: DayCardStatusEnum.Approved,
        });
        fixture.detectChanges();

        expect(comp.dayCardStatusIcon).toEqual(expectedIconModel);
    });

    it('should retrieve right configuration for Done status', () => {
        const expectedIconModel: IconModel = {
            name: 'day-card-status-done-frame',
            color: COLORS.light_green,
        };

        testHostComp.dayCard = Object.assign({}, dayCard, {
            status: DayCardStatusEnum.Done,
        });
        fixture.detectChanges();

        expect(comp.dayCardStatusIcon).toEqual(expectedIconModel);
    });

    it('should retrieve right configuration for NotDone status', () => {
        const expectedIconModel: IconModel = {
            name: 'day-card-status-notdone-frame',
            color: COLORS.red,
        };

        testHostComp.dayCard = Object.assign({}, dayCard, {
            status: DayCardStatusEnum.NotDone,
        });
        fixture.detectChanges();

        expect(comp.dayCardStatusIcon).toEqual(expectedIconModel);
    });

    it('should add CSS_CLASS_DAY_CARD_RELEVANT when card is relevant', () => {
        testHostComp.isRelevant = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_RELEVANT);
    });

    it('should not add CSS_CLASS_DAY_CARD_RELEVANT when card is not relevant', () => {
        testHostComp.isRelevant = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_RELEVANT);
    });

    it('should add CSS_CLASS_DAY_CARD_MOVABLE when card is draggable', () => {
        testHostComp.dayCard = Object.assign({}, dayCard, {
            _links: {
                update: new ResourceLink(),
            },
        });
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_MOVABLE);
    });

    it('should not add CSS_CLASS_DAY_CARD_MOVABLE when card is not draggable', () => {
        testHostComp.dayCard = Object.assign({}, dayCard, {
            permissions: Object.assign({}, dayCard.permissions, {
                canUpdate: false,
            }),
        });
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_MOVABLE);
    });

    it('should add CSS_CLASS_DAY_CARD_COPYING when card is copying and is relevant', () => {
        testHostComp.isRelevant = true;
        testHostComp.isCopying = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_COPYING);
    });

    it('should not add CSS_CLASS_DAY_CARD_COPYING when card is not copying and is relevant', () => {
        testHostComp.isRelevant = true;
        testHostComp.isCopying = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_COPYING);
    });

    it('should not add CSS_CLASS_DAY_CARD_COPYING when card is copying and is not relevant', () => {
        testHostComp.isRelevant = false;
        testHostComp.isCopying = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_COPYING);
    });

    it('should not add CSS_CLASS_DAY_CARD_MOVABLE when card is copying and is relevant', () => {
        testHostComp.isRelevant = true;
        testHostComp.isCopying = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_MOVABLE);
    });

    it('should not add CSS_CLASS_DAY_CARD_MOVABLE when multi selecting', () => {
        testHostComp.isMultiSelecting = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_MOVABLE);
    });

    it('should not add CSS_CLASS_DAY_CARD_MOVABLE when has selected items', () => {
        testHostComp.hasSelectedItems = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_MOVABLE);
    });

    it('should add CSS_CLASS_DAY_CARD_MULTI_SELECTING when multi selecting', () => {
        testHostComp.isMultiSelecting = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_MULTI_SELECTING);
    });

    it('should add CSS_CLASS_DAY_CARD_HAS_SELECTED_ITEMS when has selected items', () => {
        testHostComp.hasSelectedItems = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_HAS_SELECTED_ITEMS);
    });

    it('should add CSS_CLASS_DAY_CARD_SELECTED when card is selected', () => {
        testHostComp.isSelected = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_SELECTED);
    });

    it('should set not-allowed cursor when multi selecting a not relevant dayCard', () => {
        const notAllowedCursorStyle = 'not-allowed';

        testHostComp.isMultiSelecting = true;
        testHostComp.isRelevant = false;
        fixture.detectChanges();

        expect(getComputedStyle(getElement(dataAutomationSelectorCard)).cursor).toEqual(notAllowedCursorStyle);
    });

    it('should set not-allowed cursor when multi selecting a daycard that can not be selected', () => {
        const notAllowedCursorStyle = 'not-allowed';

        testHostComp.isMultiSelecting = true;
        testHostComp.canMultiSelect = false;
        fixture.detectChanges();

        expect(getComputedStyle(getElement(dataAutomationSelectorCard)).cursor).toEqual(notAllowedCursorStyle);
    });

    it('should not set not-allowed cursor when multi selecting a relevant dayCard that can be selected', () => {
        const notAllowedCursorStyle = 'not-allowed';

        testHostComp.isMultiSelecting = true;
        testHostComp.isRelevant = true;
        testHostComp.canMultiSelect = true;
        fixture.detectChanges();

        expect(getComputedStyle(getElement(dataAutomationSelectorCard)).cursor).not.toEqual(notAllowedCursorStyle);
    });

    it('should add CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT class when daycard can be multi selected', () => {
        testHostComp.canMultiSelect = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT);
    });

    it('should not add CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT when dayccard can not be multi selected', () => {
        testHostComp.canMultiSelect = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT);
    });
});
