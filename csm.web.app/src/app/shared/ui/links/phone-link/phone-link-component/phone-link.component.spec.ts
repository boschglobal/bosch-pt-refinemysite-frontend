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
import {By} from '@angular/platform-browser';

import {PhoneLinkComponent} from './phone-link.component';

describe('Phone Link Component', () => {
    let comp: PhoneLinkComponent;
    let fixture: ComponentFixture<PhoneLinkComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const phoneNumber = '+351 666000';
    const escapedPhoneNumber = '+351666000';
    const text = 'Call me';
    const emptyText = '';

    const getIconDebugElement = () => de.query(By.css('[data-automation="phone-link-icon"]'));

    const moduleDef: TestModuleMetadata = {
        declarations: [
            PhoneLinkComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PhoneLinkComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.phone = phoneNumber;
        fixture.detectChanges();
        el = de.query(By.css('a')).nativeElement;
    });

    it('should display the phone number as link\'s content if no text is defined', () => {
        fixture.detectChanges();
        expect(el.textContent.trim()).toBe(phoneNumber);
    });

    it('should display the text as link\'s content if a text is defined', () => {
        comp.text = text;
        fixture.detectChanges();
        expect(el.textContent.trim()).toBe(text);
    });

    it('should display the phone number as link\'s content if empty text is defined', () => {
        comp.text = emptyText;
        fixture.detectChanges();
        expect(el.textContent.trim()).toBe(phoneNumber);
    });

    it('should remove all white escapes from phone number', () => {
        const href: string = el.attributes['href'].value;
        expect(href).toContain('tel:' + escapedPhoneNumber);
    });

    it('should not render icon by default', () => {
        expect(getIconDebugElement()).toBeNull();
    });

    it('should render icon when showIcon is TRUE', () => {
        comp.showIcon = true;
        fixture.detectChanges();
        expect(getIconDebugElement()).not.toBeNull();
    });
});
