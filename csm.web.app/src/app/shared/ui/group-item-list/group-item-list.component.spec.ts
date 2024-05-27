/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../translation/translation.module';
import {
    GroupItem,
    GroupItemListComponent,
} from './group-item-list.component';
import {GroupItemListTestComponent} from './group-item-list-test.component';

describe('Group Item List Component', () => {
    let testHostComp: GroupItemListTestComponent;
    let fixture: ComponentFixture<GroupItemListTestComponent>;

    const clickEvent: MouseEvent = new MouseEvent('click');
    const groupItemListSelector = '[data-automation="ss-group-item-list"]';
    const groupItemListTitleSelector = '[data-automation="ss-group-item-list-title"]';
    const loadMoreButtonSelector = '[data-automation="ss-group-item-list-load-more-button"]';
    const groupItemListItemSelector = '[data-automation^="ss-group-item-list-item-"]';

    const groupItemWithTwoItemsAndTitle: GroupItem = {
        id: 'foo',
        title: 'Title',
        items: [
            {id: '1'},
            {id: '2'},
        ],
    };
    const groupItemWithoutItemsAndTitle: GroupItem = {
        id: 'bar',
        items: [],
    };

    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;
    const getElements = (selector: string): DebugElement[] => fixture.debugElement.queryAll(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        imports: [
            TranslationModule,
        ],
        declarations: [
            GroupItemListComponent,
            GroupItemListTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupItemListTestComponent);
        testHostComp = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display the group item list when the current list has items', () => {
        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(groupItemListSelector)).toBeTruthy();
    });

    it('should not display the group item list when the current list has no items', () => {
        testHostComp.groupItem = groupItemWithoutItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(groupItemListSelector)).toBeFalsy();
    });

    it('should display the group item title when the current list has title', () => {
        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(groupItemListTitleSelector)).toBeTruthy();
    });

    it('should not display the group item title when the current list has no title', () => {
        testHostComp.groupItem = groupItemWithoutItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(groupItemListTitleSelector)).toBeFalsy();
    });

    it('should display the load more button when the list has more items to show', () => {
        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(loadMoreButtonSelector)).toBeTruthy();
    });

    it('should not display the load more button after the load more button is clicked', () => {
        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        getElement(loadMoreButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(loadMoreButtonSelector)).toBeFalsy();
    });

    it('should not display the load more button when the current list has less items than the itemsPerGroupItem', () => {
        testHostComp.itemsPerGroupItem = 3;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElement(loadMoreButtonSelector)).toBeFalsy();
    });

    it('should display the full list of items when the current list has less items that the itemsPerGroupItem', () => {
        const expectedListLength = groupItemWithTwoItemsAndTitle.items.length;

        testHostComp.itemsPerGroupItem = 3;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElements(groupItemListItemSelector).length).toBe(expectedListLength);
    });

    it('should display a fraction of the items when the component inits', () => {
        const expectedListLength = 1;

        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElements(groupItemListItemSelector).length).toBe(expectedListLength);
    });

    it('should display the full list of items when the load more button is clicked', () => {
        const expectedPartialListLength = 1;
        const expectedFullListLength = groupItemWithTwoItemsAndTitle.items.length;

        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();

        expect(getElements(groupItemListItemSelector).length).toBe(expectedPartialListLength);

        getElement(loadMoreButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElements(groupItemListItemSelector).length).toBe(expectedFullListLength);
    });

    it('should display the load more button when a new group item arrives and load more button has not been clicked', () => {
        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();
        expect(getElement(loadMoreButtonSelector)).toBeTruthy();

        testHostComp.groupItem = cloneDeep(groupItemWithTwoItemsAndTitle);
        fixture.detectChanges();
        expect(getElement(loadMoreButtonSelector)).toBeTruthy();
    });

    it('should not display the load more button when a new group item arrives and load more button has been clicked', () => {
        testHostComp.itemsPerGroupItem = 1;
        fixture.detectChanges();

        testHostComp.groupItem = groupItemWithTwoItemsAndTitle;
        fixture.detectChanges();
        expect(getElement(loadMoreButtonSelector)).toBeTruthy();

        getElement(loadMoreButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(getElement(loadMoreButtonSelector)).toBeFalsy();

        testHostComp.groupItem = cloneDeep(groupItemWithTwoItemsAndTitle);
        fixture.detectChanges();
        expect(getElement(loadMoreButtonSelector)).toBeFalsy();
    });
});
