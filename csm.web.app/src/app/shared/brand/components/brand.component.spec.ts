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
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {BrandComponent} from './brand.component';
import {BrandTestComponent} from './brand.test.component';

describe('BrandComponent', () => {
    let testHostComponent: BrandTestComponent;
    let fixture: ComponentFixture<BrandTestComponent>;
    let router: Router;
    let de: DebugElement;

    const brandComponentSelector = 'ss-brand';
    const boschBrandLogoLinkSelector = '[data-automation="bosch-brand-logo-link"]';
    const boschLogoSelector = '[data-automation="rms-brand-logo"]';

    const getElement = (selector: string) => {
        return de.query(By.css(selector))?.nativeElement;
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
            ],
            declarations: [
                BrandComponent,
                BrandTestComponent,
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(BrandTestComponent);
        testHostComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(brandComponentSelector));

        fixture.detectChanges();
    });

    it('should render a link to Home', () => {
        const link: HTMLElement = getElement(boschBrandLogoLinkSelector);

        expect(link.textContent).toBe('');
    });

    it('should render the logo', function () {
        expect(getElement(boschLogoSelector)).toBeDefined();
    });
});
