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

import {isElementPropertyColor} from '../../../../../test/helpers';
import {MOCK_PROJECT_CRAFT_A} from '../../../../../test/mocks/crafts';
import {TaskCraftLabelComponent} from './task-craft-label.component';

describe('Task Craft Label Component', () => {
    let component: TaskCraftLabelComponent;
    let fixture: ComponentFixture<TaskCraftLabelComponent>;
    let de: DebugElement;

    const craftLabelColorSelector = '[data-automation="task-craft-label-color"]';
    const craftLabelNameSelector = '[data-automation="task-craft-label-name"]';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            TaskCraftLabelComponent
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskCraftLabelComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        component.craft = MOCK_PROJECT_CRAFT_A;
        fixture.detectChanges();
    });

    it('should render square with right color', () => {
        const expectedResult = MOCK_PROJECT_CRAFT_A.color;

        component.craft = MOCK_PROJECT_CRAFT_A;
        fixture.detectChanges();

        const craftLabelColor = de.query(By.css(craftLabelColorSelector)).nativeElement;

        expect(isElementPropertyColor(craftLabelColor, 'background-color', expectedResult)).toBeTruthy();
    });

    it('should render right craft name', () => {
        const expectedResult = MOCK_PROJECT_CRAFT_A.name;

        component.craft = MOCK_PROJECT_CRAFT_A;
        fixture.detectChanges();

        expect(de.query(By.css(craftLabelNameSelector)).nativeElement.textContent.trim()).toBe(expectedResult);
    });
});
