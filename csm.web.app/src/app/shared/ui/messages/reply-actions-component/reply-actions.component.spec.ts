/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslationModule} from '../../../translation/translation.module';
import {IconModule} from '../../icons/icon.module';
import {MarkerComponent} from '../../marker/marker.component';
import {ReplyActionsComponent} from './reply-actions.component';

describe('Reply Actions Component', () => {
    let fixture: ComponentFixture<ReplyActionsComponent>;
    let comp: ReplyActionsComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const clickEvent: Event = new Event('click');
    const dataAutomationReplyCounter = '[data-automation="reply-counter"]';
    const dataAutomationReplyMarker = '[data-automation="reply-marker"]';
    const dataAutomationReplyExpand = '[data-automation="reply-expand"]';

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
        ],
        declarations: [
            MarkerComponent,
            ReplyActionsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReplyActionsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should validate number of replies', () => {
        const replyAmount = 5;

        comp.replyAmount = replyAmount;
        fixture.detectChanges();
        expect(el.querySelector(dataAutomationReplyCounter).textContent).toContain(replyAmount.toString());
    });

    it('should set reply key to Reply_Single_Label when replyAmount is 1', () => {
        const replyAmount = 1;
        const expectedReplyKey = 'Reply_Single_Label';

        comp.replyAmount = replyAmount;
        comp.ngOnChanges();

        expect(comp.replyKey).toBe(expectedReplyKey);
    });

    it('should set reply key to Reply_Multiple_Label when replyAmount is more than 1', () => {
        const replyAmount = 5;
        const expectedReplyKey = 'Reply_Multiple_Label';

        comp.replyAmount = replyAmount;
        comp.ngOnChanges();

        expect(comp.replyKey).toBe(expectedReplyKey);
    });

    it('should emit clickedReply when reply-expand is clicked', () => {
        spyOn(comp.clickedReply, 'emit').and.callThrough();
        comp.replyAmount = 5;
        fixture.detectChanges();

        el.querySelector(dataAutomationReplyExpand).dispatchEvent(clickEvent);

        expect(comp.clickedReply.emit).toHaveBeenCalled();
    });

    it('should emit clickedReply when reply-counter is clicked', () => {
        spyOn(comp.clickedReply, 'emit').and.callThrough();
        comp.replyAmount = 5;
        fixture.detectChanges();

        el.querySelector(dataAutomationReplyCounter).dispatchEvent(clickEvent);

        expect(comp.clickedReply.emit).toHaveBeenCalled();
    });

    it('should show marker when hasMarker is true', () => {
        comp.hasMarker = true;
        comp.replyAmount = 1;
        fixture.detectChanges();
        const markerDebugElement = de.query(By.css(dataAutomationReplyMarker));
        const markerComponent = markerDebugElement.componentInstance as MarkerComponent;
        expect(markerComponent.isVisible).toBe(true);
    });

    it('should not show marker when hasMarker is false', () => {
        comp.hasMarker = false;
        comp.replyAmount = 1;
        fixture.detectChanges();

        const markerDebugElement = de.query(By.css(dataAutomationReplyMarker));
        const markerComponent = markerDebugElement.componentInstance as MarkerComponent;
        expect(markerComponent.isVisible).toBe(false);
    });
});
