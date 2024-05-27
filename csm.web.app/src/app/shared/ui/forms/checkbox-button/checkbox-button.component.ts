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
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    UntypedFormControl
} from '@angular/forms';
import {Subscription} from 'rxjs';

const CSS_CLASS_DIMENSION_NORMAL = 'ss-checkbox-button--normal';
const CSS_CLASS_DIMENSION_SMALL = 'ss-checkbox-button--small';
const CSS_CLASS_DIMENSION_TINY = 'ss-checkbox-button--tiny';
const CSS_CLASS_CHECKED = 'ss-checkbox-button--checked';
const CSS_CLASS_DISABLED = 'ss-checkbox-button--disabled';
const CSS_CLASS_INDETERMINATE = 'ss-checkbox-button--indeterminate';

@Component({
    selector: 'ss-checkbox-button',
    templateUrl: './checkbox-button.component.html',
    styleUrls: ['./checkbox-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxButtonComponent),
            multi: true,
        },
    ],
})
export class CheckboxButtonComponent implements ControlValueAccessor, OnInit, OnDestroy {
    /**
     * @description Identifier for AAT selector
     * @type {string}
     */
    @Input() public automationAttr = '';

    /**
     * @description Input name
     * @type {string}
     */
    @Input() public name = '';

    /**
     * @description Input for icon when checked
     * @type {string}
     */
    @Input() public checkedIcon = 'check';

    /**
     * @description Input for icon when indeterminate
     * @type {string}
     */
    @Input() public indeterminateIcon = 'minimize';

    /**
     * @description Input id
     * @type {string}
     */
    @Input() public id: string;

    /**
     * @description Whether the input component is disabled or not
     * @type {boolean}
     */
    @Input()
    public set isDisabled(value: boolean) {
        this._isDisabled = value;
        this.inputClasses[CSS_CLASS_DISABLED] = value;
    }

    /**
     * @description Whether the input component is disabled or not
     * @type {boolean}
     */
    @Input()
    public set isIndeterminate(value: boolean) {
        this._isIndeterminate = value;
        this.inputClasses[CSS_CLASS_INDETERMINATE] = value;
    }

    /**
     * @description Whether the input component is required to have a value
     * @type {boolean}
     */
    @Input() public isRequired: boolean;

    /**
     * @description Whether the input component is read only or not
     * @type {boolean}
     */
    @Input() public isReadOnly: boolean;

    /**
     * @description Checkbox Form Control, is used to update the isChecked
     * @type {FormControl}
     */
    @Input()
    public set control(control: UntypedFormControl) {
        this._control = control;
        this._updateChecked(control.value);

        this._controlValueChange.unsubscribe();
        this._controlValueChange = control.valueChanges.subscribe(
            val => this._updateChecked(val)
        );
    }

    /**
     * @description Input value
     * @type {boolean}
     */
    @Input()
    public set value(value: boolean) {
        this._updateChecked(value);

        if (this._control) {
            this._control.setValue(value, {emitEvent: false});
        }
    }

    /**
     * @description Input size
     * @type {CheckboxDimensionType}
     */
    @Input()
    public set dimension(value: CheckboxDimensionType) {
        this.inputClasses[CSS_CLASS_DIMENSION_NORMAL] = value === 'normal';
        this.inputClasses[CSS_CLASS_DIMENSION_SMALL] = value === 'small';
        this.inputClasses[CSS_CLASS_DIMENSION_TINY] = value === 'tiny';
    }

    /**
     * @description Trigger input change event
     * @type {EventEmitter}
     */
    @Output() public onChange: EventEmitter<any> = new EventEmitter();

    public get isDisabled(): boolean {
        return this._isDisabled;
    }

    public get control(): UntypedFormControl {
        return this._control;
    }

    public get isIndeterminate(): boolean {
        return this._isIndeterminate;
    }

    /**
     * @description Input value
     @type {boolean}
     */
    public isChecked = false;

    /**
     * @description Classes applied to the component
     */
    public inputClasses = {
        [CSS_CLASS_CHECKED]: this.isChecked,
        [CSS_CLASS_INDETERMINATE]: this.isIndeterminate,
        [CSS_CLASS_DISABLED]: this.isDisabled,
        [CSS_CLASS_DIMENSION_NORMAL]: true,
        [CSS_CLASS_DIMENSION_SMALL]: false,
        [CSS_CLASS_DIMENSION_TINY]: false,
    };

    private _control: UntypedFormControl;

    private _isIndeterminate: boolean;

    private _isDisabled: boolean;

    private _controlValueChange: Subscription = new Subscription();

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.id = this.id || this.name;
    }

    public ngOnDestroy() {
        this._controlValueChange.unsubscribe();
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param value
     */
    public writeValue(value: any): void {
    }

    /**
     * @description Method that sets the method to be called when the control receives a change event
     */
    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    /**
     * @description Method that sets the method to be called when the control receives a touch event
     */
    public registerOnTouched() {
    }

    /**
     * @description Triggered when input changes
     */
    public onInputChange(): void {
        this._propagateChange(!this.isChecked);
        this.onChange.emit(!this.isChecked);
    }

    private _updateChecked(value: boolean) {
        this.isChecked = value;
        this.inputClasses[CSS_CLASS_CHECKED] = value;
        this._changeDetectorRef.detectChanges();
    }

    private _propagateChange = (_: any): void => {
    }
}

export type CheckboxDimensionType = 'normal' | 'small' | 'tiny';
