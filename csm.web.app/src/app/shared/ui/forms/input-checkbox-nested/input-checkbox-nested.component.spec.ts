/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    waitForAsync
} from '@angular/core/testing';
import {
    AbstractControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormArray,
    UntypedFormGroup
} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {cloneDeep} from 'lodash';

import {UIModule} from '../../ui.module';
import {
    InputCheckboxNestedComponent,
    InputCheckboxNestedOption
} from './input-checkbox-nested.component';
import {InputCheckboxNestedTestComponent} from './input-checkbox-nested.test.component';

describe('Input Checkbox Nested Component', () => {
    let testHostComponent: InputCheckboxNestedTestComponent;
    let component: InputCheckboxNestedComponent;
    let fixture: ComponentFixture<InputCheckboxNestedTestComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let options: InputCheckboxNestedOption[];
    let form: UntypedFormGroup;
    let baseOption: InputCheckboxNestedOption;

    const inputCheckboxNestedComponentSelector = 'ss-input-checkbox-nested';
    const dataAutomationOption = '[data-automation="input-checkbox-nested-option"]';
    const dataAutomationOptionText = '[data-automation="input-checkbox-nested-option-text"]';
    const dataAutomationOptionWithGroupTitle = '[data-automation="input-checkbox-nested-option-group-text"]';
    const dataAutomationCustomOptionTemplate = '[data-automation="custom-option-template"]';
    const dataAutomationOptionContent = '[data-automation="input-checkbox-nested-option-content"]';

    const getElements = (selector: string): NodeListOf<HTMLElement> | undefined => el.querySelectorAll(selector);
    const getNativeElement = (selector: string): HTMLElement | undefined => de.query(By.css(selector))?.nativeElement;

    const getOptionFormGroupById = (optionId: string,
                                    formArray: UntypedFormArray = form.get('children') as UntypedFormArray): AbstractControl => {
        const formArrayControls = formArray?.controls || [];

        for (let i = 0, leni = formArrayControls.length; i < leni; i++) {
            if (formArrayControls[i].get('id').value === optionId) {
                return formArrayControls[i];
            }
            const validFormGroup = getOptionFormGroupById(optionId, formArrayControls[i].get('children') as UntypedFormArray);
            if (validFormGroup) {
                return validFormGroup;
            }
        }
    };
    const flatOptions = (array: InputCheckboxNestedOption[]): any[] =>
        array.reduce((acc: any[], curr: InputCheckboxNestedOption) => {
            acc.push({id: curr.id, text: curr.text});
            if (curr.children) {
                acc.push(...flatOptions(curr.children));
            }
            return acc;
        }, []);

    const optionsList: InputCheckboxNestedOption[] = [
        {
            id: 'foo', text: 'foo', value: false, children: [
                {id: 'foo1', text: 'foo1', value: false},
                {id: 'foo2', text: 'foo2', value: false},
                {id: 'foo3', text: 'foo3', value: false},
            ],
        },
    ];
    const optionsListDeepNested: InputCheckboxNestedOption[] = [
        {
            id: 'bar', text: 'bar', value: false, children: [
                {
                    id: 'bar1', text: 'bar1', value: false, children: [
                        {
                            id: 'bar2', text: 'bar2', value: false, children: [
                                {
                                    id: 'bar3', text: 'bar3', value: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            FormsModule,
            ReactiveFormsModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            InputCheckboxNestedTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputCheckboxNestedTestComponent);
        testHostComponent = fixture.componentInstance;
        testHostComponent.form = form = new UntypedFormGroup({});
        testHostComponent.options = options = cloneDeep(optionsList);

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(inputCheckboxNestedComponentSelector));
        el = de.nativeElement;
        component = de.componentInstance;

        baseOption = options[0];
    });

    it('should check sub options when parent option is checked and uncheck sub options when parent option is unchecked', () => {
        const optionsListDeepNestedBaseOptionId = 'bar';
        const optionsListDeepNestedFormGroupIds = ['bar1', 'bar2', 'bar3'];

        testHostComponent.options = optionsListDeepNested;

        fixture.detectChanges();

        getOptionFormGroupById(optionsListDeepNestedBaseOptionId).get('value').setValue(true);

        for (let i = 0, leni = optionsListDeepNestedFormGroupIds.length; i < leni; i++) {
            const childOptionFormControl = getOptionFormGroupById(optionsListDeepNestedFormGroupIds[i]);

            expect(childOptionFormControl.get('value').value).toBeTruthy();
        }

        getOptionFormGroupById(optionsListDeepNestedBaseOptionId).get('value').setValue(false);

        for (let i = 0, leni = optionsListDeepNestedFormGroupIds.length; i < leni; i++) {
            const childOptionFormControl = getOptionFormGroupById(optionsListDeepNestedFormGroupIds[i]);

            expect(childOptionFormControl.get('value').value).toBeFalsy();
        }
    });

    it('should check parent option when all sub options are checked and uncheck parent option when all sub options are unchecked', () => {
        const baseOptionFormGroup = getOptionFormGroupById(baseOption.id);
        const baseOptionChildrenFormArray = baseOptionFormGroup.get('children') as UntypedFormArray;

        baseOptionChildrenFormArray.controls.forEach(option => {
            const childOptionFormControl = getOptionFormGroupById(option.get('id').value);

            childOptionFormControl.get('value').setValue(true);
        });

        expect(baseOption.value).toBeTruthy();
        expect(baseOptionFormGroup.get('value').value).toBeTruthy();

        baseOptionChildrenFormArray.controls.forEach(option => {
            const childOptionFormControl = getOptionFormGroupById(option.get('id').value);

            childOptionFormControl.get('value').setValue(false);
        });

        expect(baseOption.value).toBeFalsy();
        expect(baseOptionFormGroup.get('value').value).toBeFalsy();
    });

    it('should set indeterminate state to true on parent option when sub options have checked and unchecked items', () => {
        const childOption1 = baseOption.children[0];
        const childOption2 = baseOption.children[1];
        const childOption1FormControl = getOptionFormGroupById(childOption1.id);
        const childOption2FormControl = getOptionFormGroupById(childOption2.id);

        childOption1FormControl.get('value').setValue(true);
        childOption2FormControl.get('value').setValue(false);

        expect(baseOption.isIndeterminate).toBeTruthy();
    });

    it('should not set indeterminate state to true on parent option when sub options have all checked items', () => {
        const baseOptionFormGroup = getOptionFormGroupById(baseOption.id);
        const baseOptionChildrenFormArray = baseOptionFormGroup.get('children') as UntypedFormArray;

        baseOptionChildrenFormArray.controls.forEach(option => {
            const childOptionFormControl = getOptionFormGroupById(option.get('id').value);

            childOptionFormControl.get('value').setValue(true);
        });

        expect(baseOption.isIndeterminate).toBeFalsy();
    });

    it('should not set indeterminate state to true on parent option when sub options have all unchecked items', () => {
        const baseOptionFormGroup = getOptionFormGroupById(baseOption.id);
        const baseOptionChildrenFormArray = baseOptionFormGroup.get('children') as UntypedFormArray;

        baseOptionChildrenFormArray.controls.forEach(option => {
            const childOptionFormControl = getOptionFormGroupById(option.get('id').value);

            childOptionFormControl.get('value').setValue(false);
        });

        expect(baseOption.isIndeterminate).toBeFalsy();
    });

    it('should remove unused options form controls when option list changes', () => {
        const newOptions = [{id: 'foo4', text: 'foo4', value: false}];

        testHostComponent.options = newOptions;

        fixture.detectChanges();

        expect(getOptionFormGroupById(baseOption.id)).toBeUndefined();
    });

    it('should add new options form controls when option list changes', () => {
        const newOptions = [{id: 'foo4', text: 'foo4', value: false}];

        testHostComponent.options = newOptions;

        fixture.detectChanges();

        expect(getOptionFormGroupById(newOptions[0].id)).toBeDefined();
    });

    it('should update existing option form control value when option list has new values', () => {
        const childOptionFormControl = getOptionFormGroupById(baseOption.id);

        baseOption.value = true;

        testHostComponent.options = [...options];

        fixture.detectChanges();

        expect(childOptionFormControl.get('value').value).toBeTruthy();
    });

    it('should emit optionValueChanged and updateParentOptionByChildValueChange when option value changes', () => {
        spyOn(component.optionValueChanged, 'emit').and.callThrough();
        spyOn(component.updateParentOptionByChildValueChange, 'emit').and.callThrough();

        const baseOptionFormGroup = getOptionFormGroupById(baseOption.id);

        baseOptionFormGroup.get('value').setValue(true);

        expect(component.optionValueChanged.emit).toHaveBeenCalledWith(baseOption);
        expect(component.updateParentOptionByChildValueChange.emit).toHaveBeenCalled();
    });

    it('should render group text for option', () => {
        const optionsWithGroupTitle: InputCheckboxNestedOption[] = [{
            id: 'foo5', text: 'foo5', value: false, groupText: 'foo5', children: [
                {id: 'foo6', text: 'foo6', value: false},
            ],
        }];

        testHostComponent.options = optionsWithGroupTitle;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationOptionWithGroupTitle).innerText).toBe('foo5');
    });

    it('should render correct option text', () => {
        const optionsElement = getElements(dataAutomationOptionText);
        const optionsFlattened = flatOptions(cloneDeep(options));

        optionsElement.forEach((option, index) => expect(option.innerText).toEqual(optionsFlattened[index].text));
    });

    it('should render correct custom option template', () => {
        const optionsFlattened: InputCheckboxNestedOption[] = flatOptions(cloneDeep(options));
        const optionsWithCustomTemplate = optionsFlattened.map((option: InputCheckboxNestedOption) =>
            Object.assign({}, {...option}, {
                customVisualContent: {
                    template: testHostComponent.optionTemplate,
                    data: option,
                },
            })
        );

        testHostComponent.options = optionsWithCustomTemplate;

        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(inputCheckboxNestedComponentSelector));

        expect(getNativeElement(dataAutomationCustomOptionTemplate)).toBeDefined();
    });

    it('should create a new Form Control \'children\' when a new input Form Group is given and use the same if exists', () => {
        const newFormGroup = new UntypedFormGroup({children: new UntypedFormArray([])});
        const newChildrenFormGroup = newFormGroup.get('children');
        const existingChildrenFormGroup = testHostComponent.form.get('children');

        testHostComponent.form = new UntypedFormGroup({});

        fixture.detectChanges();

        expect(testHostComponent.form.get('children')).not.toEqual(existingChildrenFormGroup);

        testHostComponent.form = newFormGroup;

        fixture.detectChanges();

        expect(testHostComponent.form.get('children')).toEqual(newChildrenFormGroup);
    });

    it('should return the correct formGroup by ID', () => {
        expect(component.getOptionFormGroupById(baseOption.id)).toBeDefined();
        expect(component.getOptionFormGroupById('WRONG_OPTION')).toBeUndefined();
    });

    it('should apply the separator modifier class when the separator property is set', () => {
        const expectedCssClass = 'ss-input-checkbox-nested__option--separator';
        testHostComponent.options = [{id: 'foo', text: 'foo', value: false, separator: true}];

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationOption).classList).toContain(expectedCssClass);
    });

    it('should render the correct title attribute value for each option', () => {
        const optionsContentElement = getElements(dataAutomationOptionContent);
        const optionsText = flatOptions(optionsList).map(({text}) => text);

        optionsContentElement.forEach(({title}, index) => expect(title).toEqual(optionsText[index]));
    });
});
