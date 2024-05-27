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

import {BREAKPOINTS_RANGE} from '../../constants/breakpoints.constant';
import {
    CSS_DRAWER_OPEN_CLASS,
    DrawerComponent,
} from './drawer.component';
import {DrawerTestComponent} from './drawer.test.component';

declare const viewport: any;

describe('Drawer Component', () => {
    let testHostComp: DrawerTestComponent;
    let fixture: ComponentFixture<DrawerTestComponent>;
    let de: DebugElement;

    const dataAutomationDrawerHeaderSelector = '[data-automation="drawer-header"]';
    const dataAutomationDrawerBodySelector = '[data-automation="drawer-body"]';
    const dataAutomationDrawerFooterSelector = '[data-automation="drawer-footer"]';

    const getElement = (selector: string) => de.query(By.css(selector))?.nativeElement || null;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            DrawerComponent,
            DrawerTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawerTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    afterEach(() => viewport.reset());

    it('should not have a content', () => {
        expect(getElement(dataAutomationDrawerHeaderSelector)).toBeFalsy();
        expect(getElement(dataAutomationDrawerBodySelector)).toBeFalsy();
        expect(getElement(dataAutomationDrawerFooterSelector)).toBeFalsy();
    });

    it('should have an header', () => {
        testHostComp.hasHeader = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationDrawerHeaderSelector)).toBeTruthy();
    });

    it('should have a body', () => {
        testHostComp.hasBody = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationDrawerBodySelector)).toBeTruthy();
    });

    it('should have a footer', () => {
        testHostComp.hasFooter = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationDrawerFooterSelector)).toBeTruthy();
    });

    it(`should add ${CSS_DRAWER_OPEN_CLASS} CSS class to body when drawer is visible`, () => {
        testHostComp.showDrawer = true;
        fixture.detectChanges();

        expect(document.body.classList).toContain(CSS_DRAWER_OPEN_CLASS);
    });

    it(`should remove ${CSS_DRAWER_OPEN_CLASS} CSS class to body when drawer is not visible`, () => {
        testHostComp.showDrawer = true;
        fixture.detectChanges();

        expect(document.body.classList).toContain(CSS_DRAWER_OPEN_CLASS);

        testHostComp.showDrawer = false;
        fixture.detectChanges();

        expect(document.body.classList).not.toContain(CSS_DRAWER_OPEN_CLASS);
    });

    it('should set body style overflow to hidden on XS screens', () => {
        testHostComp.showDrawer = true;
        fixture.detectChanges();

        expect(document.body.classList).toContain(CSS_DRAWER_OPEN_CLASS);

        viewport.set(BREAKPOINTS_RANGE.xs.max);
        expect(getComputedStyle(document.body).overflow).toBe('hidden');
    });

    it('should not set body style overflow to hidden on resolutions higher than XS', () => {
        testHostComp.showDrawer = true;
        fixture.detectChanges();

        expect(document.body.classList).toContain(CSS_DRAWER_OPEN_CLASS);

        viewport.set(BREAKPOINTS_RANGE.sm.min);
        expect(getComputedStyle(document.body).overflow).not.toBe('hidden');

        viewport.set(BREAKPOINTS_RANGE.md.min);
        expect(getComputedStyle(document.body).overflow).not.toBe('hidden');

        viewport.set(BREAKPOINTS_RANGE.lg.min);
        expect(getComputedStyle(document.body).overflow).not.toBe('hidden');

        viewport.set(BREAKPOINTS_RANGE.xl.min);
        expect(getComputedStyle(document.body).overflow).not.toBe('hidden');
    });
});
