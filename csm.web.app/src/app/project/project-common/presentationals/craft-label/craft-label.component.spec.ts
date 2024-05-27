/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {By} from '@angular/platform-browser';

import {isElementPropertyColor} from '../../../../../test/helpers';
import {MOCK_PROJECT_CRAFT_A} from '../../../../../test/mocks/crafts';
import {CraftLabelComponent} from './craft-label.component';
import {CraftLabelTestComponent} from './craft-label.test.component';

describe('CraftLabelComponent', () => {
    let fixture: ComponentFixture<CraftLabelTestComponent>;
    let testHostComp: CraftLabelTestComponent;
    let de: DebugElement;

    const craftLabelHostSelector = 'ss-craft-label';
    const craftLabelClass = '.ss-craft-label';
    const dataAutomationCraftContentPositionSelector = '[data-automation="craft-label-position"]';
    const dataAutomationCraftContentColorSelector = '[data-automation="craft-label-color"]';
    const dataAutomationCraftContentNameSelector = '[data-automation="craft-label-name"]';
    const ellipsisClass = 'ss-craft-label--ellipsis';
    const getElement = (selector: string): HTMLElement => de.query((By.css(selector)))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            CraftLabelComponent,
            CraftLabelTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CraftLabelTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(craftLabelHostSelector));
        testHostComp.craft = MOCK_PROJECT_CRAFT_A;
        fixture.detectChanges();
    });

    it('should show craft position when component is loaded', () => {
        const expectedResult = MOCK_PROJECT_CRAFT_A.position;
        const craftPositionElement = getElement(dataAutomationCraftContentPositionSelector);

        expect(craftPositionElement.innerText).toContain(`${expectedResult}.`);
    });

    it('should show craft background color when component is loaded', () => {
        const expectedResult = MOCK_PROJECT_CRAFT_A.color;
        const craftColorElement = getElement(dataAutomationCraftContentColorSelector);

        expect(isElementPropertyColor(craftColorElement, 'background-color', expectedResult)).toBeTruthy();
    });

    it('should have craft label name when component is loaded', () => {
        const craftColorElement = getElement(dataAutomationCraftContentNameSelector);
        expect(craftColorElement.innerText).toBe(MOCK_PROJECT_CRAFT_A.name);
    });

    it('should have ellipsis class when hasEllipsis is true', () => {
        testHostComp.hasEllipsis = true;
        fixture.detectChanges();
        expect(getElement(craftLabelClass).classList.contains(ellipsisClass)).toBeTruthy();
    });

    it('should NOT have ellipsis class when hasEllipsis is false', () => {
        testHostComp.hasEllipsis = false;
        fixture.detectChanges();
        expect(getElement(craftLabelClass).classList.contains(ellipsisClass)).toBeFalsy();
    });

    it('should NOT have ellipsis class when hasEllipsis is not defined', () => {
        expect(getElement(craftLabelClass).classList.contains(ellipsisClass)).toBeFalsy();
    });
});
