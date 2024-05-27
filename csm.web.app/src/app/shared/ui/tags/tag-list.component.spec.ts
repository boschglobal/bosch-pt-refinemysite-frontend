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
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {UIModule} from '../ui.module';
import {Tag} from './tag/tag.component';
import {TagListComponent} from './tag-list/tag-list.component';

describe('Tag List Component', () => {
    let fixture: ComponentFixture<TagListComponent>;
    let comp: TagListComponent;
    let de: DebugElement;

    const tagListItems = '[data-automation="tag-list-items"]';
    const tagListItemsText = '.ss-tag__text';
    const testTagItem: Tag = {id: '1', displayName: 'item'};
    const testTagItems = [
        {id: '1', displayName: 'item'},
        {id: '2', displayName: 'item two'},
        {id: '3', displayName: 'Chicken Here'},
        {id: '4', displayName: 'From: 2017-09-01'},
    ];

    const getElement = (selector: string) => {
        return de.query(By.css(selector));
    };

    const getAllElements = (selector: string) => {
        return de.queryAll(By.css(selector));
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagListComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should render tag list', () => {
        comp.items = testTagItems;
        fixture.detectChanges();
        expect(getElement(tagListItems)).toBeTruthy();
    });

    it('should render 4 tag elements', () => {
        comp.items = testTagItems;
        fixture.detectChanges();
        expect(getAllElements(tagListItemsText).length).toBe(4);
    });

    it('should emit close event', () => {
        spyOn(comp.onRemoveTag, 'emit');

        comp.clearTag(testTagItem);
        expect(comp.onRemoveTag.emit).toHaveBeenCalled();
    });

    it('should emit close all event when clicking on the close all button', () => {
        spyOn(comp.onRemoveAllTags, 'emit');

        comp.clearAllTags();
        expect(comp.onRemoveAllTags.emit).toHaveBeenCalled();
    });
});
