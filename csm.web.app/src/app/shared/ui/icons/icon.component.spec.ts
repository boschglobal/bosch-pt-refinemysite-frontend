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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AnimationModule} from '../../animation/animation.module';
import {IconComponent} from './icon.component';
import {IconModule} from './icon.module';

describe('Icon Component', () => {
    let fixture: ComponentFixture<IconComponent>;
    let comp: IconComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const animatedIconSelector = 'ng-lottie';
    const iconSelector = '.ss-icon';
    const iconComponentSelector = 'ss-icon';
    const dataAutomationRootElementSelector = `[data-automation="${iconComponentSelector}"]`;
    const dataAutomationBadgeSelector = `[data-automation="${iconComponentSelector}-badge"]`;
    const getAnimatedIconElement = () => de.query(By.css(animatedIconSelector));
    const getRootElement = () => de.query(By.css(dataAutomationRootElementSelector));
    const getBadgeElement = () => de.query(By.css(dataAutomationBadgeSelector));
    const moduleDef: TestModuleMetadata = {
        imports: [
            AnimationModule.forRoot(),
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IconComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should set a number dimension', () => {
        comp.dimension = 10;
        fixture.detectChanges();
        expect(el.querySelector(iconSelector).getAttribute('width')).toBe('10px');
    });

    it('should set a dimension for a default keyword', () => {
        comp.dimension = 'large';
        fixture.detectChanges();
        expect(el.querySelector(iconSelector).getAttribute('width')).toBe('48px');
    });

    it('should set badge element SVG r style attribute to 24px when input badge is set to true', () => {
        comp.badge = true;
        fixture.detectChanges();
        expect(getBadgeElement().styles['r']).toBe('24px');
    });

    it('should set badge element SVG r style attribute to 0px when input badge is set to false', () => {
        comp.badge = false;
        fixture.detectChanges();
        expect(getBadgeElement().styles['r']).toBe('0px');
    });

    it('should set rotation style to svg element', () => {
        const rotate = 179;

        comp.rotate = rotate;
        fixture.detectChanges();

        expect(getRootElement().styles.transform).toEqual(`rotate(${rotate}deg)`);
    });

    it('should render animated icon instead of static icon when animated is TRUE', () => {
        comp.animated = true;
        fixture.detectChanges();

        expect(getAnimatedIconElement()).not.toBeNull();
        expect(getRootElement()).toBeNull();
    });

    it('should render static icon instead of animated icon when animated is FALSE', () => {
        comp.animated = false;
        fixture.detectChanges();

        expect(getRootElement()).not.toBeNull();
        expect(getAnimatedIconElement()).toBeNull();
    });

    it('should set a dimension of an animated icon', () => {
        const dimension = 10;
        const expectedDimension = `${dimension}px`;

        comp.animated = true;
        comp.dimension = dimension;
        fixture.detectChanges();

        expect(getAnimatedIconElement().componentInstance.width).toBe(expectedDimension);
        expect(getAnimatedIconElement().componentInstance.height).toBe(expectedDimension);
    });
});
