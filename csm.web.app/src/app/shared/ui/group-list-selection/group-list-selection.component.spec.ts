/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {
    GroupItem,
    GroupItemListComponent,
} from '../group-item-list/group-item-list.component';
import {MultipleSelectionToolbarConfirmationModeEnum} from '../multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';
import {UIModule} from '../ui.module';
import {
    GroupListSelectionComponent,
    MultipleSelectionToolbarData
} from './group-list-selection.component';
import {GroupListSelectionTestComponent} from './group-list-selection.test.component';

describe('Group List Selection Component', () => {
    let comp: GroupListSelectionComponent;
    let testHostComp: GroupListSelectionTestComponent;
    let fixture: ComponentFixture<GroupListSelectionTestComponent>;
    let de: DebugElement;

    const clickEvent: MouseEvent = new MouseEvent('click');
    const groupListSelectionComponentSelector = 'ss-group-list-selection';
    const groupListSelectionHeaderSelector = '[data-automation="ss-group-list-selection-header"]';
    const groupListSelectionTitleSelector = '[data-automation="ss-group-list-selection-title"]';
    const groupListSelectionCollapsedButtonSelector = '[data-automation="ss-group-list-selection-collapsed-button"]';
    const groupListSelectionMultipleSelectionToolbarSelector = '[data-automation="ss-group-list-selection-multiple-selection-toolbar"]';
    const groupListSelectionGroupsSelector = '[data-automation="ss-group-list-selection-groups"]';
    const groupItemListComponentSelector = 'ss-group-item-list';

    const title = 'Title';
    const groupsWithItems: GroupItem[] = [
        {
            id: 'group-1',
            title: 'Group 1',
            items: [
                {id: '11'},
                {id: '12'},
            ],
        },
        {
            id: 'group-2',
            title: 'Group 2',
            items: [
                {id: '21'},
                {id: '22'},
            ],
        },
    ];
    const groupsWithoutItems: GroupItem[] = [
        {
            id: 'group-1',
            title: 'Group 1',
            items: [],
        },
        {
            id: 'group-2',
            title: 'Group 2',
            items: [],
        },
    ];
    const multipleSelectionToolbarData: MultipleSelectionToolbarData = {
        itemsCount: 2,
        emptyItemsLabel: 'Select item A',
        selectedItemLabel: 'Add {{itemsCount}} item A',
        selectedItemsLabel: 'Add {{itemsCount}} items A',
        mode: MultipleSelectionToolbarConfirmationModeEnum.Add,
        submitSelection: () => null,
        dismissSelection: () => null,
    };

    const getElement = (selector: string): DebugElement => fixture.debugElement.query(By.css(selector));
    const getElements = (selector: string): DebugElement[] => fixture.debugElement.queryAll(By.css(selector));

    const getGroupItemListElementsCount = (groupItems: GroupItem[]): number =>
        groupItems.reduce((prev, curr) => {
            if (curr.items.length) {
                prev++;
            }
            return prev;
        }, 0);

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            GroupItemListComponent,
            GroupListSelectionComponent,
            GroupListSelectionTestComponent,
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
        fixture = TestBed.createComponent(GroupListSelectionTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(groupListSelectionComponentSelector));
        comp = de.componentInstance;

        testHostComp.title = title;
        testHostComp.groups = groupsWithItems;
        fixture.detectChanges();
    });

    it('should show the title and the total number of the group items', () => {
        const nbsp = String.fromCharCode(160);
        const expectedTitle = `${title}${nbsp}(4)`;

        expect(getElement(groupListSelectionTitleSelector).nativeElement.textContent).toBe(expectedTitle);
    });

    it('should display the collapsed button when the groups have items', () => {
        expect(getElement(groupListSelectionCollapsedButtonSelector)).toBeTruthy();
    });

    it('should not display the collapsed button when the groups does not have items', () => {
        testHostComp.groups = groupsWithoutItems;
        fixture.detectChanges();

        expect(getElement(groupListSelectionCollapsedButtonSelector)).toBeFalsy();
    });

    it('should rotate the arrow icon when the collapsed button is clicked', () => {
        const collapsedRotation = 270;
        const expandedRotation = 90;

        expect(comp.arrowIconRotation).toBe(expandedRotation);

        getElement(groupListSelectionCollapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.arrowIconRotation).toBe(collapsedRotation);

        getElement(groupListSelectionCollapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.arrowIconRotation).toBe(expandedRotation);
    });

    it('should display the multiple selection toolbar confirmation when multipleSelectionToolbarData is set', () => {
        testHostComp.multipleSelectionToolbarData = multipleSelectionToolbarData;
        fixture.detectChanges();

        expect(getElement(groupListSelectionMultipleSelectionToolbarSelector)).toBeTruthy();
    });

    it('should not display the multiple selection toolbar confirmation when multipleSelectionToolbarData is not set', () => {
        testHostComp.multipleSelectionToolbarData = null;
        fixture.detectChanges();

        expect(getElement(groupListSelectionMultipleSelectionToolbarSelector)).toBeFalsy();
    });

    it('should toggle the groups visibility when collapse button is clicked', () => {
        expect(getElement(groupListSelectionGroupsSelector).nativeElement.hidden).toBeFalsy();

        getElement(groupListSelectionCollapsedButtonSelector).nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getElement(groupListSelectionGroupsSelector).nativeElement.hidden).toBeTruthy();
    });

    it('should render ss-group-item-list component if groups have items', () => {
        const expectedNumberOfElements = getGroupItemListElementsCount(groupsWithItems);

        expect(getElements(groupItemListComponentSelector).length).toEqual(expectedNumberOfElements);
    });

    it('should not render ss-group-item-list component if groups do not have items', () => {
        const expectedNumberOfElements = getGroupItemListElementsCount(groupsWithoutItems);

        testHostComp.groups = groupsWithoutItems;
        fixture.detectChanges();

        expect(expectedNumberOfElements).toEqual(0);
        expect(getElements(groupItemListComponentSelector).length).toEqual(0);
    });

    it('should not render the header if the title is left empty', () => {
        testHostComp.title = null;
        fixture.detectChanges();

        expect(getElement(groupListSelectionHeaderSelector)).toBeFalsy();
    });
});
