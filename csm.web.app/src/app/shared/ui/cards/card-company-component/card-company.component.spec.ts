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

import {CardCompanyComponent} from './card-company.component';

describe('Card Company Component', () => {
    let fixture: ComponentFixture<CardCompanyComponent>;
    let comp: CardCompanyComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const companyDisplayName = 'Test company';
    const dataAutomationSelectorName = '[data-automation="company-name"]';

    const moduleDef: TestModuleMetadata = {
        declarations: [CardCompanyComponent]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardCompanyComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        comp.company = {
            displayName: companyDisplayName
        };
        fixture.detectChanges();
    });

    it('should check company name has the received input', () => {
        expect(comp.getDisplayName()).toBe(companyDisplayName);
    });

    it('should check if company name is rendered', () => {
        expect(el.querySelector(dataAutomationSelectorName).innerHTML).toBe(companyDisplayName);
    });
});
