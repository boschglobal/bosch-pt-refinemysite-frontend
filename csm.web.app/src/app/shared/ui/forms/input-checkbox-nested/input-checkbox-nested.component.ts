/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    TemplateRef
} from '@angular/core';
import {
    AbstractControl,
    UntypedFormArray,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import {Subscription} from 'rxjs';

import {CheckboxDimensionType} from '../checkbox-button/checkbox-button.component';

@Component({
    selector: 'ss-input-checkbox-nested',
    templateUrl: './input-checkbox-nested.component.html',
    styleUrls: ['./input-checkbox-nested.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCheckboxNestedComponent implements OnDestroy, OnChanges {

    @Input()
    public dimension: CheckboxDimensionType = 'tiny';

    @Input()
    public set form(form: UntypedFormGroup) {
        if (!form.get('children')) {
            form.addControl('children', new UntypedFormArray([]));
        }

        this._form = form;
        this._setOptionsFormControls();
    }

    public get form(): UntypedFormGroup {
        return this._form;
    }

    @Input()
    public set options(options: InputCheckboxNestedOption[]) {
        this._options = options;
        this._clearOptionsFormControls();
        this._setOptionsFormControls();
        this._changeDetectorRef.detectChanges();
    }

    public get options(): InputCheckboxNestedOption[] {
        return this._options;
    }

    @Input()
    public optionTemplate: TemplateRef<any>;

    @Output()
    public optionValueChanged: EventEmitter<InputCheckboxNestedOption> = new EventEmitter<InputCheckboxNestedOption>();

    @Output()
    public updateParentOptionByChildValueChange: EventEmitter<null> = new EventEmitter<null>();

    private _disposableSubscriptions: Subscription = new Subscription();

    private _form: UntypedFormGroup;

    private _options: InputCheckboxNestedOption[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnChanges() {
        this.updateParentOptionByChildValueChange.emit();
    }

    ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleOptionValueChange(option: InputCheckboxNestedOption): void {
        this.optionValueChanged.emit(option);
    }

    public handleChildOptionValueChange(option: InputCheckboxNestedOption): void {
        this._updateOptionByChildValueChange(option);
        this._changeDetectorRef.detectChanges();
        this.updateParentOptionByChildValueChange.emit();
    }

    public getOptionFormGroupById(optionId: string): AbstractControl<any, any> {
        const optionsControls = (this.form.controls.children as UntypedFormArray).controls;

        return optionsControls.find(control => control.get('id').value === optionId);
    }

    private _clearOptionsFormControls(): void {
        const options = this.form?.controls?.children as UntypedFormArray;
        const optionsControls = options?.controls || [];
        const currentOptionsControlIds = optionsControls.map(control => control.get('id').value);
        const getControlIndex = (controlId: string): number => {
            const foundControl = optionsControls.find(control => control.get('id').value === controlId);
            return optionsControls.indexOf(foundControl);
        };

        currentOptionsControlIds.forEach(controlId => {
            const existingControl = !!this.options.length && this.options.some(option => option.id === controlId);

            if (!existingControl) {
                options.removeAt(getControlIndex(controlId));
            }
        });
    }

    private _setOptionsFormControls(): void {
        if (!this.form) {
            return;
        }

        this.options.forEach((option, index) => {
            const childrenFormArray = (this.form.controls.children as UntypedFormArray);
            const formGroup = childrenFormArray.length > 0 ? childrenFormArray.at(index) : false;
            const existingFormGroup = formGroup && formGroup.get('id').value === option.id;

            if (!existingFormGroup) {
                (this.form.controls.children as UntypedFormArray).push(this._getOptionFormGroup(option));
            } else {
                (formGroup as UntypedFormGroup).get('value').patchValue(option.value, {emitEvent: false});
            }
        });
    }

    private _getOptionFormGroup(option: InputCheckboxNestedOption): UntypedFormGroup {
        const formGroup = new UntypedFormGroup({
            id: new UntypedFormControl(option.id),
            value: new UntypedFormControl(option.value),
        });

        this._handleOptionValueChanges(formGroup.get('value'), option.id);

        return formGroup;
    }

    private _handleOptionValueChanges(valueControl: AbstractControl, optionId: string) {
        this._disposableSubscriptions.add(
            valueControl.valueChanges
                .subscribe(value => {
                    const option = this.options.find(item => item.id === optionId);
                    const optionChildrenFormArray = valueControl.parent.get('children');

                    option.value = value;
                    option.isIndeterminate = false;

                    this._updateChildOptions(optionChildrenFormArray, option, value);

                    this.optionValueChanged.emit(option);
                    this.updateParentOptionByChildValueChange.emit();
                })
        );
    }

    private _updateChildOptions(childrenFormArray: AbstractControl, option: InputCheckboxNestedOption, value: boolean): void {
        const childOptionsControls = (childrenFormArray as UntypedFormArray)?.controls || [];

        childOptionsControls.forEach((formGroup, i) => {
            option.children[i].value = value;
            option.children[i].isIndeterminate = false;

            formGroup.get('value').patchValue(value, {emitEvent: false});

            this._updateChildOptions(formGroup.get('children'), option.children[i], value);
        });

        if (option.children) {
            option.children = [...option.children];
        }
    }

    private _updateOptionByChildValueChange(option: InputCheckboxNestedOption) {
        const childFormGroup =
            (this.form.get('children') as UntypedFormArray).controls.find(control => control.get('id').value === option.id);
        const childOptionsFormGroup = (childFormGroup.get('children') as UntypedFormArray).controls;
        const childOptionsValues = childOptionsFormGroup.reduce((acc, curr) => ([...acc, curr.get('value').value]), []);
        const derivedOptionValue = !childOptionsValues.some(optionValue => optionValue === false);
        const someChildOptionsChecked = childOptionsValues.some(value => value === true);
        const someChildOptionsUnchecked = childOptionsValues.some(value => value === false);
        const someChildIndeterminate = option.children.some(item => item.isIndeterminate);

        option.value = derivedOptionValue;
        option.isIndeterminate = (someChildOptionsChecked && someChildOptionsUnchecked) || someChildIndeterminate;

        childFormGroup.get('value').patchValue(derivedOptionValue, {emitEvent: false});
    }

}

export interface InputCheckboxNestedOption {
    id: string;
    value: boolean;
    text: string;
    separator?: boolean;
    groupText?: string;
    isIndeterminate?: boolean;
    children?: InputCheckboxNestedOption[];
    customVisualContent?: InputCheckboxNestedOptionCustomContent;
}

export interface InputCheckboxNestedOptionCustomContent {
    template: TemplateRef<any>;
    data?: any;
}
