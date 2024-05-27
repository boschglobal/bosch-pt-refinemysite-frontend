/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutDirective} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {CheckboxButtonComponent} from '../../forms/checkbox-button/checkbox-button.component';
import {
    InputCheckboxNestedComponent,
    InputCheckboxNestedOption
} from '../../forms/input-checkbox-nested/input-checkbox-nested.component';
import {
    DropdownMultipleSelectComponent,
    SELECT_ALL_OPTION
} from './dropdown-multiple-select.component';
import {DropdownMultiSelectTestComponent} from './dropdown-multiple-select.test.component';

describe('Dropdown Multiple Select Component', () => {
    let testHostComp: DropdownMultiSelectTestComponent;
    let comp: DropdownMultipleSelectComponent;
    let fixture: ComponentFixture<DropdownMultiSelectTestComponent>;
    let flyoutService: FlyoutService;
    let de: DebugElement;

    const dropdownMenuComponentSelector = 'ss-dropdown-multiple-select';
    const dropdownMenuButtonSelector = '[data-automation="ss-dropdown-multiple-select-button"]';
    const dropdownMenuIconSelector = '[data-automation="ss-dropdown-multiple-select-label-icon"]';
    const dropdownMenuBadgeNumberSelector = '[data-automation="ss-dropdown-multiple-select-label-badge-number"]';
    const dropdownMenuLabelTextSelector = '[data-automation="ss-dropdown-multiple-select-label-text"]';
    const dropdownMenuOptions = '[data-automation="ss-dropdown-multiple-select-options"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const resetedForm = new UntypedFormGroup({});

    const optionsWithoutSelected: InputCheckboxNestedOption[] = [
        {
            separator: true,
            id: 'ali-albatros',
            text: 'Ali Albatros',
            value: false,
        },
        {
            id: 'benjamin-boston',
            text: 'Benjamin Boston',
            value: false,
        },
        {
            id: 'caroline-kripix',
            text: 'Caroline Kripix',
            value: false,
        },
    ];

    const optionsWithSelected: InputCheckboxNestedOption[] = [
        {
            separator: true,
            id: 'ali-albatros',
            text: 'Ali Albatros',
            value: true,
        },
        {
            id: 'benjamin-boston',
            text: 'Benjamin Boston',
            value: false,
        },
        {
            id: 'caroline-kripix',
            text: 'Caroline Kripix',
            value: true,
        },
    ];

    const selectedOption: InputCheckboxNestedOption = {
        id: 'ali-albatros',
        text: 'Ali Albatros',
        value: true,
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
            FormsModule,
            ReactiveFormsModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            DropdownMultipleSelectComponent,
            DropdownMultiSelectTestComponent,
            FlyoutDirective,
            InputCheckboxNestedComponent,
            CheckboxButtonComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropdownMultiSelectTestComponent);
        testHostComp = fixture.componentInstance;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(dropdownMenuComponentSelector));
        comp = de.componentInstance;
        flyoutService = TestBed.inject(FlyoutService);
    });

    it('should render the dropdown button when there are options to show', () => {
        testHostComp.options = optionsWithoutSelected;
        fixture.detectChanges();

        expect(getElement(dropdownMenuButtonSelector)).toBeTruthy();
    });

    it('should not render the dropdown button when there are no options no show', () => {
        testHostComp.options = null;
        fixture.detectChanges();

        expect(getElement(dropdownMenuButtonSelector)).toBeFalsy();
    });

    it('should render icon on dropdown label when provided', () => {
        testHostComp.options = optionsWithoutSelected;
        testHostComp.icon = 'arrow';
        fixture.detectChanges();

        expect(getElement(dropdownMenuIconSelector)).toBeTruthy();
    });

    it('should not render icon on dropdown label when not provided', () => {
        testHostComp.icon = null;
        fixture.detectChanges();

        expect(getElement(dropdownMenuIconSelector)).toBeFalsy();
    });

    it('should render provided label', () => {
        const label = 'EmployeeRoleEnum_CSM';

        testHostComp.options = optionsWithoutSelected;
        testHostComp.label = label;
        fixture.detectChanges();

        expect(getElement(dropdownMenuLabelTextSelector)).toBeTruthy();
        expect(getElement(dropdownMenuLabelTextSelector).innerText).toBe(label);
    });

    it('should add select all option to provided options', () => {
        const label = 'EmployeeRoleEnum_CSM';

        testHostComp.selectAllTextKey = label;
        testHostComp.hasSelectAllOption = true;
        testHostComp.options = optionsWithoutSelected;

        fixture.detectChanges();

        expect(comp.internalOptions[0].id).toBe(SELECT_ALL_OPTION.id);
    });

    it('should not add select all option to provided options', () => {
        testHostComp.options = optionsWithoutSelected;
        testHostComp.hasSelectAllOption = false;
        fixture.detectChanges();

        expect(comp.internalOptions[0].id).not.toBe(SELECT_ALL_OPTION.id);
    });

    it('should show provided select all label when provided', () => {
        const label = 'EmployeeRoleEnum_CSM';

        testHostComp.selectAllTextKey = label;
        testHostComp.hasSelectAllOption = true;
        testHostComp.options = optionsWithoutSelected;

        fixture.detectChanges();

        expect(comp.internalOptions[0].text).toBe(label);
    });

    it('should show default select all label when not provided', () => {
        testHostComp.hasSelectAllOption = true;
        testHostComp.options = optionsWithoutSelected;

        fixture.detectChanges();

        expect(comp.internalOptions[0].text).toBe(comp.selectAllTextKey);
    });

    it('should not render badge number when showBadge is false', () => {
        testHostComp.options = optionsWithoutSelected;
        testHostComp.showBadge = false;
        fixture.detectChanges();

        expect(getElement(dropdownMenuBadgeNumberSelector)).toBeFalsy();
    });

    it('should not render badge number if there are not any selected options', () => {
        testHostComp.options = optionsWithoutSelected;
        testHostComp.showBadge = true;
        fixture.detectChanges();

        expect(getElement(dropdownMenuBadgeNumberSelector)).toBeFalsy();
    });

    it('should render badge number if there are some selected options', () => {
        testHostComp.options = optionsWithSelected;
        testHostComp.showBadge = true;

        fixture.detectChanges();

        expect(getElement(dropdownMenuBadgeNumberSelector)).toBeTruthy();
        expect(getElement(dropdownMenuBadgeNumberSelector).innerText).toBe('2');
    });

    it('should emit optionClicked when an option is selected', () => {
        spyOn(comp.optionClicked, 'emit').and.callThrough();
        testHostComp.options = optionsWithoutSelected;

        fixture.detectChanges();

        getElement(dropdownMenuButtonSelector).dispatchEvent(new Event('click'));

        new DebugElement(document.querySelector(dropdownMenuOptions)).triggerEventHandler('optionValueChanged', selectedOption);

        expect(comp.optionClicked.emit).toHaveBeenCalledWith(selectedOption);
    });

    it('should emit optionsChanged with select all children when an option is selected and hasSelectAllOption is truthy', () => {
        spyOn(comp.optionsChanged, 'emit').and.callThrough();
        testHostComp.options = optionsWithoutSelected;
        testHostComp.hasSelectAllOption = true;

        fixture.detectChanges();

        getElement(dropdownMenuButtonSelector).dispatchEvent(new Event('click'));

        new DebugElement(document.querySelector(dropdownMenuOptions)).triggerEventHandler('optionValueChanged', selectedOption);

        expect(comp.optionsChanged.emit).toHaveBeenCalledWith(optionsWithoutSelected);
    });

    it('should emit optionsChanged with all internal options when an option is selected and hasSelectAllOption is falsy', () => {
        spyOn(comp.optionsChanged, 'emit').and.callThrough();
        testHostComp.options = optionsWithoutSelected;
        testHostComp.hasSelectAllOption = false;

        fixture.detectChanges();

        getElement(dropdownMenuButtonSelector).dispatchEvent(new Event('click'));

        new DebugElement(document.querySelector(dropdownMenuOptions)).triggerEventHandler('optionValueChanged', selectedOption);

        expect(comp.optionsChanged.emit).toHaveBeenCalledWith(optionsWithoutSelected);
    });

    it('should rotate the arrow icon up when the items flyout open', () => {
        flyoutService.openEvents.next(comp.flyoutId);

        expect(comp.iconRotation).toBe(90);
    });

    it('should rotate the arrow icon down when the items flyout close', () => {
        flyoutService.closeEvents.next(comp.flyoutId);

        expect(comp.iconRotation).toBe(-90);
    });

    it('should reset flyoutOptionsForm when form is opened', () => {
        flyoutService.openEvents.next(comp.flyoutId);

        expect(comp.flyoutOptionsForm.value).toEqual(resetedForm.value);
    });

    it('should reset flyoutOptionsForm when form is closed', () => {
        flyoutService.closeEvents.next(comp.flyoutId);

        expect(comp.flyoutOptionsForm.value).toEqual(resetedForm.value);
    });

    it('should reset flyoutOptionsForm when the component receives new options', () => {
        testHostComp.options = optionsWithoutSelected;
        fixture.detectChanges();

        expect(comp.flyoutOptionsForm.value).toEqual(resetedForm.value);
    });
});
