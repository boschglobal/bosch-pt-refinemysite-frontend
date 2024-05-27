/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
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
import {TranslateService} from '@ngx-translate/core';

import {isElementPropertyColor} from '../../../../../../test/helpers';
import {MOCK_TASK_3} from '../../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {
    COLORS,
    CRAFT_COLORS,
    CraftColor
} from '../../../../../shared/ui/constants/colors.constant';
import {
    TasksStackedPreviewComponent,
    TasksStackedPreviewModel,
} from './tasks-stacked-preview.component';

describe('Tasks Stacked Preview Component', () => {
    let component: TasksStackedPreviewComponent;
    let fixture: ComponentFixture<TasksStackedPreviewComponent>;
    let de: DebugElement;
    let changeDetectorRef: ChangeDetectorRef;

    const amount = 0;
    const dataAutomationTasksStackedTopCard = '[data-automation="tasks-stacked-preview-card-top"]';
    const dataAutomationTasksStackedCardCount = '[data-automation="tasks-stacked-preview-card-count"]';
    const dataAutomationTasksStackedBackgroundCard = '[data-automation="tasks-stacked-preview-card-background"]';
    const dataAutomationTasksStackedCardTitle = '[data-automation="tasks-stacked-preview-card-title"]';
    const dataAutomationTasksStackedCardDescription = '[data-automation="tasks-stacked-preview-card-description"]';

    const getCraftColor = (solidColor: string): CraftColor => CRAFT_COLORS.find(color => color.solid === solidColor);

    const cssClassDimmedOut = 'ss-tasks-stacked-preview__card--dimmed-out';
    const topCard: TasksStackedPreviewModel = {
        title: MOCK_TASK_3.name,
        description: MOCK_TASK_3.company.displayName,
        color: getCraftColor(CRAFT_COLORS[0].solid),
        dimmed: false,
    };
    const backgroundCard: TasksStackedPreviewModel = {
        color: getCraftColor(CRAFT_COLORS[1].solid),
        dimmed: false,
    };

    const getElement = (selector: string): DebugElement => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            TasksStackedPreviewComponent,
        ],
        providers: [
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
        fixture = TestBed.createComponent(TasksStackedPreviewComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);

        component.topCard = topCard;
        component.backgroundCard = backgroundCard;
        component.cardCount = amount;

        changeDetectorRef.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should set the top task color as border-color of the top card', () => {
        const topCardDebugElement = getElement(dataAutomationTasksStackedTopCard).nativeElement;

        expect(isElementPropertyColor(topCardDebugElement, 'border-color', topCard.color.solid)).toBeTruthy();
    });

    it('should set the background task color as border-color of the background card', () => {
        const backgroundCardDebugElement = getElement(dataAutomationTasksStackedBackgroundCard).nativeElement;

        expect(isElementPropertyColor(backgroundCardDebugElement, 'border-color', backgroundCard.color.solid)).toBeTruthy();
    });

    it('should render the top card content', () => {
        const descriptionElement = getElement(dataAutomationTasksStackedCardDescription).nativeElement;
        const titleElement = getElement(dataAutomationTasksStackedCardTitle).nativeElement;

        expect(titleElement.innerText).toBe(topCard.title);
        expect(descriptionElement.innerText).toBe(topCard.description);
    });

    it('should render the card count with the correct amount', () => {
        const cardCountElement = getElement(dataAutomationTasksStackedCardCount).nativeElement;

        expect(cardCountElement.innerText).toEqual(amount.toString());
    });

    it('should set the top task color as background-color of the card count', () => {
        const cardCountElement = getElement(dataAutomationTasksStackedCardCount).nativeElement;

        expect(isElementPropertyColor(cardCountElement, 'background-color', COLORS.light_blue)).toBeTruthy();
    });

    it('should mark task as dimmed out the task is selected', () => {
        component.topCard = {
            ...topCard,
            dimmed: true,
        };
        component.backgroundCard = {
            ...backgroundCard,
            dimmed: false,
        };

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationTasksStackedTopCard).nativeElement.classList).toContain(cssClassDimmedOut);
        expect(getElement(dataAutomationTasksStackedBackgroundCard).nativeElement.classList).not.toContain(cssClassDimmedOut);
    });

    it('should not mark task as dimmed out if the task isn\'t selected', () => {
        component.topCard = {
            ...topCard,
            dimmed: false,
        };
        component.backgroundCard = {
            ...backgroundCard,
            dimmed: true,
        };

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationTasksStackedTopCard).nativeElement.classList).not.toContain(cssClassDimmedOut);
        expect(getElement(dataAutomationTasksStackedBackgroundCard).nativeElement.classList).toContain(cssClassDimmedOut);
    });
});
