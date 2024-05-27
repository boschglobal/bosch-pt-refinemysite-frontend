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

import {UIModule} from '../ui.module';
import {
    Tag,
    TagComponent
} from './tag/tag.component';

describe('Tag Component', () => {
    let fixture: ComponentFixture<TagComponent>;
    let comp: TagComponent;
    let de: DebugElement;

    const testTagItem: Tag = {id: '1', displayName: 'item'};
    const tagItem = `[data-automation="tag-${testTagItem.id}"]`;

    const getNativeElement = (selector: string) => {
        return de.query(By.css(selector)).nativeElement;
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should render tag', () => {
        comp.item = testTagItem;
        fixture.detectChanges();

        expect(getNativeElement(tagItem)).toBeTruthy();
    });

    it('should render tag element text', () => {
        comp.item = testTagItem;
        fixture.detectChanges();

        expect(getNativeElement(tagItem).textContent).toContain(testTagItem.displayName);
    });

    it('should trigger event remove', () => {
        spyOn(comp.onRemoveTag, 'emit');

        comp.removeTag(testTagItem);
        expect(comp.onRemoveTag.emit).toHaveBeenCalled();
    });
});
