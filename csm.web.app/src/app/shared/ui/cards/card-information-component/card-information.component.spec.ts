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

import {TranslationModule} from '../../../translation/translation.module';
import {
    CardInformationComponent,
    CSS_CLASS_CARD_INFORMATION_CALL_FOR_ACTION
} from './card-information.component';

describe('Card Information Component', () => {
    let fixture: ComponentFixture<CardInformationComponent>;
    let comp: CardInformationComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationSelectorCard = '[data-automation="card-information"]';
    const dataAutomationSelectorTitle = '[data-automation="card-information-title"]';
    const dataAutomationSelectorDescription = '[data-automation="card-information-description"]';

    const icon = 'icon';
    const title = 'Test';
    const description = 'Test test test test test';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [CardInformationComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardInformationComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.icon = icon;
        comp.title = title;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(comp).toBeDefined();
    });

    it('should have call for action css class when card is call for action', () => {
        comp.callForAction = true;
        fixture.detectChanges();

        expect(el.querySelector(dataAutomationSelectorCard).classList).toContain(CSS_CLASS_CARD_INFORMATION_CALL_FOR_ACTION);
    });

    it('should not have call for action css class when card is not call for action', () => {
        comp.callForAction = false;
        fixture.detectChanges();

        expect(el.querySelector(dataAutomationSelectorCard).classList).not.toContain(CSS_CLASS_CARD_INFORMATION_CALL_FOR_ACTION);
    });

    it('should render title', () => {
        expect(el.querySelector(dataAutomationSelectorTitle).textContent.trim()).toBe(title);
    });

    it('should render description when it exists', () => {
        comp.description = description;
        fixture.detectChanges();

        expect(el.querySelector(dataAutomationSelectorDescription).textContent.trim()).toBe(description);
    });

    it('should not render description when it does not exists', () => {
        expect(el.querySelector(dataAutomationSelectorDescription)).toBeNull();
    });

    it('should return class with size bindded to component', () => {
        comp.size = 'small';
        fixture.detectChanges();
        const smallClass = 'someClass';
        const finalObject = {
            [`${smallClass}--small`]: true
        };

        expect(finalObject.toString).toBe(comp.getCssClassModifier(smallClass).toString);
    });
});
