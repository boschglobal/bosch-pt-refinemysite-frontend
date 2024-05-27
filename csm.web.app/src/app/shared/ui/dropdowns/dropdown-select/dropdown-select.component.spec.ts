/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutDirective} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';
import {DropdownSelectComponent} from './dropdown-select.component';
import {DropdownSelectTestComponent} from './dropdown-select.test.component';

describe('Dropdown Select Component', () => {
    let testHostComp: DropdownSelectTestComponent;
    let comp: DropdownSelectComponent;
    let fixture: ComponentFixture<DropdownSelectTestComponent>;
    let flyoutService: FlyoutService;
    let de: DebugElement;

    const dropdownSelectComponentSelector = 'ss-dropdown-select';
    const dropdownSelectButtonSelector = '[data-automation="ss-dropdown-select-button"]';
    const dropdownSelectLabelSelector = '[data-automation="ss-dropdown-select-label"]';
    const dropdownSelectCustomTemplateSelector = '[data-automation="ss-dropdown-select-custom-template"]';

    const mockMenuItem1: MenuItem = {
        id: 'item-1',
        label: 'Item 1',
        type: 'select',
    };
    const mockMenuItem2: MenuItem = {
        id: 'item-2',
        label: 'Item 2',
        type: 'select',
    };
    const items: MenuItemsList[] = [{
        items: [
            mockMenuItem1,
            mockMenuItem2,
        ],
    }];

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            DropdownSelectComponent,
            DropdownSelectTestComponent,
            FlyoutDirective,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownSelectTestComponent);
        testHostComp = fixture.componentInstance;
        testHostComp.items = cloneDeep(items);
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(dropdownSelectComponentSelector));
        comp = de.componentInstance;
        flyoutService = TestBed.inject(FlyoutService);
    });

    it('should render the dropdown button when there are menu items to show', () => {
        testHostComp.items = items;
        fixture.detectChanges();

        expect(getElement(dropdownSelectButtonSelector)).toBeTruthy();
    });

    it('should not render the dropdown button when there are no menu items no show', () => {
        testHostComp.items = [];
        fixture.detectChanges();

        expect(getElement(dropdownSelectButtonSelector)).toBeFalsy();
    });

    it('should mark the first item as selected when there are no selected item', () => {
        const firstItem = comp.items[0].items[0];

        expect(firstItem.selected).toBeTruthy();
    });

    it('should not mark the first item as selected when there are already a selected item', () => {
        testHostComp.items = [{
            items: [
                mockMenuItem1,
                {
                    ...mockMenuItem2,
                    selected: true,
                },
            ],
        }];
        fixture.detectChanges();

        expect(comp.items[0].items[0].selected).toBeFalsy();
        expect(comp.items[0].items[1].selected).toBeTruthy();
    });

    it('should set the selectedItem with the selected one when the items are provided', () => {
        const selectedItem = comp.items[0].items[0];

        expect(comp.selectedItem).toBe(selectedItem);
    });

    it('should not set the selectedItem when there are no items provided', () => {
        testHostComp.items = [];
        fixture.detectChanges();

        expect(comp.selectedItem).toBeUndefined();
    });

    it('should set the customFigureTemplate with the template of the item list that the selected item belong', () => {
        testHostComp.items = items.map(itemsList => ({
            ...itemsList,
            customFigureTemplate: testHostComp.customFigureTemplate,
        }));
        fixture.detectChanges();

        expect(comp.customFigureTemplate).toBe(testHostComp.customFigureTemplate);
    });

    it('should not set the customFigureTemplate when the item list that the selected item belongs doesn\'t have one', () => {
        expect(comp.customFigureTemplate).toBeUndefined();
    });

    it('should not set the customFigureTemplate when there are no items provided', () => {
        testHostComp.items = [];
        fixture.detectChanges();

        expect(comp.customFigureTemplate).toBeUndefined();
    });

    it('should inject the custom figure of the selected item to the dropdown button when the list that the item belongs has ' +
        'the template', () => {
        testHostComp.items = [{
            customFigureTemplate: testHostComp.customFigureTemplate,
            items: [mockMenuItem1],
        }];
        fixture.detectChanges();

        expect(getElement(dropdownSelectCustomTemplateSelector)).toBeTruthy();
    });

    it('should not inject the custom figure of the selected item to the dropdown button when the list that the item belongs doesn\'t ' +
        'have the template', () => {
        testHostComp.items = [{
            items: [mockMenuItem1],
        }];
        fixture.detectChanges();

        expect(getElement(dropdownSelectCustomTemplateSelector)).toBeFalsy();
    });

    it('should render the selected item label when it has one', () => {
        const selectedItemLabel = comp.items[0].items[0].label;

        expect(getElement(dropdownSelectLabelSelector).innerText).toBe(selectedItemLabel);
    });

    it('should not render the selected item label when it doesn\'t have one', () => {
        testHostComp.items = [{
            items: [
                {
                    ...mockMenuItem1,
                    label: '',
                },
            ],
        }];
        fixture.detectChanges();

        expect(getElement(dropdownSelectLabelSelector)).toBeFalsy();
    });

    it('should emit itemClicked when handleItemClicked is called', () => {
        spyOn(comp.itemClicked, 'emit').and.callThrough();

        comp.handleItemClicked(mockMenuItem1);

        expect(comp.itemClicked.emit).toHaveBeenCalledWith(mockMenuItem1);
    });

    it('should emit itemsChange when handleItemsListChange is called', () => {
        spyOn(comp.itemsChange, 'emit').and.callThrough();

        comp.handleItemsListChange(items);

        expect(comp.itemsChange.emit).toHaveBeenCalledWith(items);
    });

    it('should close the items flyout when handleItemClicked is called', () => {
        fixture.detectChanges();

        spyOn(flyoutService, 'close').and.callThrough();
        comp.handleItemClicked(mockMenuItem1);

        expect(flyoutService.close).toHaveBeenCalledWith(comp.flyoutId);
    });

    it('should rotate the arrow icon up when the items flyout open', () => {
        flyoutService.openEvents.next(comp.flyoutId);

        expect(comp.iconRotation).toBe(90);
    });

    it('should rotate the arrow icon down when the items flyout close', () => {
        flyoutService.closeEvents.next(comp.flyoutId);

        expect(comp.iconRotation).toBe(-90);
    });
});
