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

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutDirective} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {
    MenuItem,
    MenuItemsList
} from '../../menus/menu-list/menu-list.component';
import {DropdownMenuComponent} from './dropdown-menu.component';
import {DropdownMenuTestComponent} from './dropdown-menu.test.component';

describe('Dropdown Menu Component', () => {
    let testHostComp: DropdownMenuTestComponent;
    let comp: DropdownMenuComponent;
    let fixture: ComponentFixture<DropdownMenuTestComponent>;
    let flyoutService: FlyoutService;
    let de: DebugElement;

    const dropdownMenuComponentSelector = 'ss-dropdown-menu';
    const dropdownMenuButtonSelector = '[data-automation="ss-dropdown-menu-button"]';
    const dropdownMenuIconSelector = '[data-automation="ss-dropdown-menu-icon"]';
    const dropdownMenuLabelSelector = '[data-automation="ss-dropdown-menu-label"]';
    const dropdownMenuCustomContentSelector = '[data-automation="ss-dropdown-menu-custom-content"]';

    const mockMenuItem: MenuItem = {
        id: 'item-1',
        label: 'Item 1',
        type: 'button',
    };
    const items: MenuItemsList[] = [{
        items: [mockMenuItem],
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
            DropdownMenuComponent,
            DropdownMenuTestComponent,
            FlyoutDirective,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownMenuTestComponent);
        testHostComp = fixture.componentInstance;
        testHostComp.items = items;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(dropdownMenuComponentSelector));
        comp = de.componentInstance;
        flyoutService = TestBed.inject(FlyoutService);
    });

    it('should render the dropdown button when there are menu items to show', () => {
        testHostComp.items = items;
        fixture.detectChanges();

        expect(getElement(dropdownMenuButtonSelector)).toBeTruthy();
    });

    it('should not render the dropdown button when there are no menu items no show', () => {
        testHostComp.items = [];
        fixture.detectChanges();

        expect(getElement(dropdownMenuButtonSelector)).toBeFalsy();
    });

    it('should render the icon when it is provided', () => {
        testHostComp.icon = 'icon';
        fixture.detectChanges();

        expect(getElement(dropdownMenuIconSelector)).toBeTruthy();
    });

    it('should not render the icon when it is not provided', () => {
        testHostComp.icon = undefined;
        fixture.detectChanges();

        expect(getElement(dropdownMenuIconSelector)).toBeFalsy();
    });

    it('should render the label when it is provided', () => {
        testHostComp.label = 'label';
        fixture.detectChanges();

        expect(getElement(dropdownMenuLabelSelector)).toBeTruthy();
    });

    it('should not render the label when it is not provided', () => {
        testHostComp.label = undefined;
        fixture.detectChanges();

        expect(getElement(dropdownMenuLabelSelector)).toBeFalsy();
    });

    it('should render the custom content injected in the dropdown menu', () => {
        testHostComp.customContent = true;
        fixture.detectChanges();

        expect(getElement(dropdownMenuCustomContentSelector).childElementCount).toBe(1);

        testHostComp.customContent = false;
        fixture.detectChanges();

        expect(getElement(dropdownMenuCustomContentSelector).childElementCount).toBe(0);
    });

    it('should emit itemClicked when handleItemClicked is called', () => {
        spyOn(comp.itemClicked, 'emit').and.callThrough();

        comp.handleItemClicked(mockMenuItem);

        expect(comp.itemClicked.emit).toHaveBeenCalledWith(mockMenuItem);
    });

    it('should emit itemsChange when handleItemsListChange is called', () => {
        spyOn(comp.itemsChange, 'emit').and.callThrough();

        comp.handleItemsListChange(items);

        expect(comp.itemsChange.emit).toHaveBeenCalledWith(items);
    });

    it('should close the items flyout when handleItemClicked is called and closeOnItemClick is set to true', () => {
        testHostComp.closeOnItemClick = true;
        fixture.detectChanges();

        spyOn(flyoutService, 'close').and.callThrough();
        comp.handleItemClicked(mockMenuItem);

        expect(flyoutService.close).toHaveBeenCalledWith(comp.flyoutId);

    });

    it('should not close the items flyout when itemClicked emits and closeOnItemClick is set to false', () => {
        testHostComp.closeOnItemClick = false;
        fixture.detectChanges();

        spyOn(flyoutService, 'close');
        comp.handleItemClicked(mockMenuItem);

        expect(flyoutService.close).not.toHaveBeenCalled();
    });

    it('should emit flyoutStateChange with true when the items flyout opens', () => {
        spyOn(comp.flyoutStateChange, 'emit');

        flyoutService.openEvents.next(comp.flyoutId);

        expect(comp.flyoutStateChange.emit).toHaveBeenCalledWith(true);
    });

    it('should emit flyoutStateChange with false when the items flyout closes', () => {
        spyOn(comp.flyoutStateChange, 'emit');

        flyoutService.closeEvents.next(comp.flyoutId);

        expect(comp.flyoutStateChange.emit).toHaveBeenCalledWith(false);
    });
});
