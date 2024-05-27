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

import {isElementPropertyColor} from '../../../../../../test/helpers';
import {MOCK_TASK} from '../../../../../../test/mocks/tasks';
import {CRAFT_COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {
    TasksCardPreviewComponent,
    TasksCardPreviewModel
} from './tasks-card-preview.component';

describe('Tasks Card Preview Component', () => {
    let fixture: ComponentFixture<TasksCardPreviewComponent>;
    let comp: TasksCardPreviewComponent;
    let de: DebugElement;

    const cssClassSelected = 'ss-task-card-preview--selected';
    const cssClassFocused = 'ss-task-card-preview--focused';
    const cssClassDimmedOut = 'ss-task-card-preview--dimmed-out';
    const cssClassCssHasSupported = 'ss-task-card-preview--css-has-supported';
    const tasksCardPreviewModel: TasksCardPreviewModel = {
        constraints: MOCK_TASK.constraints,
        color: CRAFT_COLORS[0],
        description: MOCK_TASK.company.displayName,
        selected: false,
        focused: false,
        dimmed: false,
        statistics: MOCK_TASK.statistics,
        status: MOCK_TASK.status,
        title: MOCK_TASK.name,
    };

    const dataAutomationPreviewSelector = '[data-automation="task-card-preview"]';
    const dataAutomationTitleSelector = '[data-automation="task-card-preview-title"]';
    const dataAutomationDescriptionSelector = '[data-automation="task-card-preview-description"]';
    const dataAutomationMarkerSelector = '[data-automation="task-card-preview__marker"]';

    const getElement = (selector: string): DebugElement => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [TasksCardPreviewComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksCardPreviewComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.task = tasksCardPreviewModel;

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should render task title', () => {
        const element = getElement(dataAutomationTitleSelector).nativeElement;

        expect(element.textContent.trim()).toBe(tasksCardPreviewModel.title);
    });

    it('should render task description', () => {
        const element = getElement(dataAutomationDescriptionSelector).nativeElement;

        expect(element.textContent.trim()).toBe(tasksCardPreviewModel.description);
    });

    it('should mark task as selected the task is selected', () => {
        comp.task.selected = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).toContain(cssClassSelected);
    });

    it('should not mark task as selected if the task isn\'t selected', () => {
        comp.task.selected = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).not.toContain(cssClassSelected);
    });

    it('should mark task as focused the task is selected', () => {
        comp.task.focused = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).toContain(cssClassFocused);
    });

    it('should not mark task as focused if the task isn\'t selected', () => {
        comp.task.focused = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).not.toContain(cssClassFocused);
    });

    it('should mark task as dimmed out the task is selected', () => {
        comp.task.dimmed = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).toContain(cssClassDimmedOut);
    });

    it('should not mark task as dimmed out if the task isn\'t selected', () => {
        comp.task.dimmed = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).not.toContain(cssClassDimmedOut);
    });

    it('should set the task solid color as background-color and border of the card', () => {
        const {solid} = comp.task.color;

        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'background-color', solid)).toBeTruthy();
        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'border-color', solid)).toBeTruthy();
    });

    it('should set the task light color as background-color and solid task color as border of the card when focused', () => {
        const {solid, light} = comp.task.color;

        comp.task.focused = true;

        fixture.detectChanges();

        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'background-color', light)).toBeTruthy();
        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'border-color', solid)).toBeTruthy();
    });

    it('should set "white" as background-color and solid task color as border of the card when selected', () => {
        const {solid} = comp.task.color;

        comp.task.selected = true;

        fixture.detectChanges();

        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'background-color', 'white')).toBeTruthy();
        expect(isElementPropertyColor(getElement(dataAutomationPreviewSelector).nativeElement, 'border-color', solid)).toBeTruthy();
    });

    it('should render news marker when there are news', () => {
        comp.hasNews = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationMarkerSelector).properties.isVisible).toBe(true);
    });

    it('should not render news marker when there are no news', () => {
        comp.hasNews = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationMarkerSelector).properties.isVisible).toBe(false);
    });

    it(`should add ${cssClassCssHasSupported} class when css has is supported`, () => {
        comp.isCssHasSupported = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).toContain(cssClassCssHasSupported);
    });

    it(`should not add ${cssClassCssHasSupported} class when css has isn't supported`, () => {
        comp.isCssHasSupported = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationPreviewSelector).nativeElement.classList).not.toContain(cssClassCssHasSupported);
    });
});
