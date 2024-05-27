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

import {MailLinkComponent} from './mail-link.component';

describe('Mail Link Component', () => {
    let comp: MailLinkComponent;
    let fixture: ComponentFixture<MailLinkComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const email = 'foo+bar@baz.com';
    const encodedEmail = 'foo%2Bbar%40baz.com';
    const text = 'Send an e-mail';
    const encodedText = 'Send%20an%20e-mail';
    const emptyText = '';

    const getIconDebugElement = () => {
        return de.query(By.css('[data-automation="mail-link-icon"]'));
    };

    const moduleDef: TestModuleMetadata = {
        declarations: [
            MailLinkComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MailLinkComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        comp.email = email;
        fixture.detectChanges();
        el = de.query(By.css('a')).nativeElement;
    });

    it('should display the e-mail as link\'s content if no text is defined', () => {
        expect(el.textContent.trim()).toBe(email);
    });

    it('should display the text as link\'s content if a text is defined', () => {
        comp.text = text;
        fixture.detectChanges();
        expect(el.textContent.trim()).toBe(text);
    });

    it('should display the e-mail as link\'s content if empty text is defined', () => {
        comp.text = emptyText;
        fixture.detectChanges();
        expect(el.textContent.trim()).toBe(email);
    });

    it('should encode all URL parts', () => {
        comp.cc = email;
        comp.bcc = email;
        comp.subject = text;
        comp.body = text;
        fixture.detectChanges();

        const href: string = el.attributes['href'].value;

        expect(href).toContain('mailto:' + encodedEmail);
        expect(href).toContain('cc=' + encodedEmail);
        expect(href).toContain('bcc=' + encodedEmail);
        expect(href).toContain('subject=' + encodedText);
        expect(href).toContain('body=' + encodedText);
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
