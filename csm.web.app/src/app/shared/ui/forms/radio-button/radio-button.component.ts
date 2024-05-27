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
    Output
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {Subscription} from 'rxjs';

const CSS_CLASS_DIMENSION_NORMAL = 'ss-radio-button--normal';
const CSS_CLASS_DIMENSION_SMALL = 'ss-radio-button--small';
const CSS_CLASS_DIMENSION_TINY = 'ss-radio-button--tiny';

@Component({
    selector: 'ss-radio-button',
    templateUrl: './radio-button.component.html',
    styleUrls: ['./radio-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioButtonComponent),
            multi: true,
        },
    ],
})
export class RadioButtonComponent implements ControlValueAccessor, OnDestroy {
    @Input() public automationAttr = '';
    @Input() public name = '';
    @Input() public value: any;
    @Input() public isDisabled: boolean;
    @Input() public isRequired: boolean;
    @Input() public isReadOnly: boolean;

    @Input()
    public set control(control: AbstractControl) {
        this.isChecked = this.value === control.value;

        this._controlValueChange.unsubscribe();
        this._controlValueChange = control.valueChanges
            .subscribe(val => {
                this.isChecked = this.value === val;
                this._changeDetectorRef.detectChanges();
            });
    }

    @Input()
    public set dimension(value: RadioButtonDimensionType) {
        this.inputClasses = {
            [CSS_CLASS_DIMENSION_NORMAL]: value === 'normal',
            [CSS_CLASS_DIMENSION_SMALL]: value === 'small',
            [CSS_CLASS_DIMENSION_TINY]: value === 'tiny',
        };
    }

    @Output() public onClick: EventEmitter<any> = new EventEmitter();

    public inputClasses = {
        [CSS_CLASS_DIMENSION_NORMAL]: true,
        [CSS_CLASS_DIMENSION_SMALL]: false,
        [CSS_CLASS_DIMENSION_TINY]: false,
    };

    @Input()
    public isChecked: boolean;

    private _controlValueChange: Subscription = new Subscription();

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef) {
    }

    public ngOnDestroy() {
        this._controlValueChange.unsubscribe();
    }

    public writeValue(value: any): void {
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
    }

    public onInputSelect(): void {
        this._propagateChange(this.value);
        this.onClick.emit(this.value);
    }

    private _propagateChange = (_: any): void => {
    };

}

export type RadioButtonDimensionType = 'normal' | 'small' | 'tiny';
