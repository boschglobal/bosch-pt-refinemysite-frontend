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

import {StickyService} from '../api/sticky.service';
import {StickyModule} from '../sticky.module';
import {StickyTestComponent} from './sticky.test.component';

describe('Sticky Directive', () => {
    let fixture: ComponentFixture<StickyTestComponent>;
    let comp: StickyTestComponent;
    let de: DebugElement;
    let stickyService: StickyService;

    const dataAutomationStickyElementFirstSelector = '[data-automation="sticky-element-0"]';
    const dataAutomationStickyElementSecondSelector = '[data-automation="sticky-element-1"]';
    const scrollEvent: Event = new Event('scroll');
    const resizeEvent: Event = new Event('resize');
    const testDataTwoStickies: any[] = [
        {
            id: 'foo',
            index: 100,
            top: 50,
        },
        {
            id: 'bar',
            index: 100,
            top: 100,
            bottom: 16,
        },
    ];

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const elementDistanceToTop = (selector: string) => getElement(selector).getBoundingClientRect().top;

    const moduleDef: TestModuleMetadata = {
        imports: [StickyModule],
        declarations: [StickyTestComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StickyTestComponent);
        fixture.detectChanges();
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        stickyService = TestBed.inject(StickyService);
    });

    afterAll(() => {
        fixture.destroy();
        window.scrollTo(0, 0);
    });

    it('should register 2 elements as sticky', () => {
        spyOn(stickyService, 'register').and.callThrough();
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        expect(stickyService.register).toHaveBeenCalledTimes(2);
    });

    it('should unregister 2 elements as sticky', () => {
        spyOn(stickyService, 'unregister').and.callThrough();
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        comp.stickyElements = [];
        fixture.detectChanges();
        expect(stickyService.unregister).toHaveBeenCalledTimes(2);
    });

    it('should stick elements after scroll and conditions are matched', () => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 3000);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();
        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
        expect(elementDistanceToTop(dataAutomationStickyElementSecondSelector)).toBe(testDataTwoStickies[1].top);
    });

    it('should unstick elements after scroll and conditions are matched', () => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 3000);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();
        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
        expect(elementDistanceToTop(dataAutomationStickyElementSecondSelector)).toBe(testDataTwoStickies[1].top);
        window.scrollTo(0, 0);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();
        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).not.toBe(testDataTwoStickies[0].top);
        expect(elementDistanceToTop(dataAutomationStickyElementSecondSelector)).not.toBe(testDataTwoStickies[1].top);
    });

    it('should stick elements after resize and conditions are matched', () => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 3000);
        window.dispatchEvent(resizeEvent);
        fixture.detectChanges();
        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
        expect(elementDistanceToTop(dataAutomationStickyElementSecondSelector)).toBe(testDataTwoStickies[1].top);
    });

    it('should only stick first element after scroll and conditions are matched', () => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 2000);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();

        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
        expect(elementDistanceToTop(dataAutomationStickyElementSecondSelector)).not.toBe(testDataTwoStickies[1].top);
    });

    it('should update sticky after view is checked and height changed', (done) => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 2000);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();

        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
        comp.spacerHeight = '3500px';
        comp.elementHeight = '100px';
        fixture.detectChanges();

        setTimeout(() => {
            expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).not.toBe(testDataTwoStickies[0].top);
            done();
        }, 200);
    });

    it('should not update sticky after view is checked and height is the same', (done) => {
        comp.stickyElements = testDataTwoStickies;
        fixture.detectChanges();
        window.scrollTo(0, 2000);
        window.dispatchEvent(scrollEvent);
        fixture.detectChanges();

        expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);

        setTimeout(() => {
            // trigger 1st check in the UI with not changes
            fixture.detectChanges();
        }, 200);

        setTimeout(() => {
            // trigger 2nd check in the UI with not changes
            fixture.detectChanges();
        }, 400);

        setTimeout(() => {
            // check that element is still in place
            expect(elementDistanceToTop(dataAutomationStickyElementFirstSelector)).toBe(testDataTwoStickies[0].top);
            done();
        }, 600);
    });
});
