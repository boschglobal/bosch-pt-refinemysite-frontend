/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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

import {TranslationModule} from '../../../translation/translation.module';
import {CardContactComponent} from './card-contact.component';

describe('Card Contact Component', () => {
    let fixture: ComponentFixture<CardContactComponent>;
    let comp: CardContactComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const contactEmail = 'test@test.pt';
    const contactPhone = '+1 234 567';
    const defaultPathImage = `url('resources/icons/common/contact.svg')`;
    const dataAutomationSelectorPhone = '[data-automation="contact-phone"] a';
    const dataAutomationSelectorEmail = '[data-automation="contact-email"]';

    const moduleDef: TestModuleMetadata = {
        imports: [TranslationModule.forRoot()],
        declarations: [CardContactComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardContactComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        comp.contact = {
            email: contactEmail,
            phone: contactPhone
        };
        fixture.detectChanges();
    });

    it('should return default contact image', () => {
        expect(comp.getImage()).toBe(defaultPathImage);
    });

    it('should check contact email has the received input', () => {
        expect(comp.getEmail()).toBe(contactEmail);
    });

    it('should check if contact email is rendered', () => {
        expect(el.querySelector(dataAutomationSelectorEmail).innerHTML).toBe(contactEmail);
    });

    it('should check contact phone has the received input', () => {
        expect(comp.getPhone()).toBe(contactPhone);
    });

    it('should check if contact phone is rendered', () => {
        expect(el.querySelector(dataAutomationSelectorPhone).innerHTML).toBe(contactPhone);
    });

    it('should check if anchor is only rendered when phone is greater than 1', () => {
        comp.contact = {
            email: contactEmail,
            phone: '-'
        };
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationSelectorPhone)).toBeNull();
    });
});
