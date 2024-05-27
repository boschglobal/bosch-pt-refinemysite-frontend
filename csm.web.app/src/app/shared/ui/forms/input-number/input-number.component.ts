/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {BaseInputDirective} from '../input.base';

export const CSS_CLASS_ARROW_DISABLED = 'ss-input-number__arrow--disabled';
export const CSS_CLASS_ICON = 'ss-input-number--icon';

@Component({
    selector: 'ss-input-number',
    templateUrl: './input-number.component.html',
    styleUrls: ['./input-number.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputNumberComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent extends BaseInputDirective implements ControlValueAccessor, OnInit, AfterViewInit {

    @Input()
    public icon;

    @Input()
    public maxDigits;

    @Input()
    public step = 1;

    @Input()
    public max: number;

    @Input()
    public min: number;

    private _previousValue: any;

    // TODO: https://github.com/angular/angular/issues/12316
    @ViewChild('inputNumber', {static: true})
    public inputNumber: ElementRef;

    constructor(protected _changeDetectorRef: ChangeDetectorRef) {
        super(_changeDetectorRef);
    }

    ngAfterViewInit() {
        this._previousValue = this.value;
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param {string} value
     */
    public onInternalChangeCallback(value: any): void {
        this.onChangeCallback(value);
        this.onTouchedCallback();
        this.onChange.emit(value);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param {string} value
     */
    public writeValue(value: string): void {
        this.value = value === null || typeof value === 'undefined' ? '' : value;
        this.pauseStream();
        this.setFilled();
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Returns styles classes for the input based on it's current state
     * @returns {Object}
     */
    public getInputClasses(): Object {
        return {
            ...super.getInputClasses(),
            [CSS_CLASS_ICON]: this.hasIcon(),
        };
    }

    /**
     * @description Method to be called when the input's input event is triggered
     */
    public onInputChange(event: InputEvent): void {
        if (!this.value && event.inputType === 'insertText') {
            if (this._previousValue !== '' || event.data !== '-') {
                this.value = this._previousValue;
                this.inputNumber.nativeElement.value = this.value;
            }
        }

        if (this.maxDigits && this.value.length > this.maxDigits) {
            this.value = this.value.slice(0, this.maxDigits);
            // TODO: https://github.com/angular/angular/issues/12316
            this.inputNumber.nativeElement.value = this.value;
        }

        const value = this.value;

        this._previousValue = value;
        this.resumeStream();
        this.changesObserver.next(value);
        this.onInput.emit(value);
    }

    /**
     * @description Method to be called when the input's focus event is triggered
     * @param event
     */
    public onInputFocus(event: Event): void {
        this.setFilled();
        this.isFocused = true;
        this.onFocus.emit(event);
    }

    /**
     * @description Method to be called when the input's blur event is triggered
     * @param event
     */
    public onInputBlur(event: Event): void {
        const value = this.value;

        this.setFilled();
        this.isFocused = false;
        this.onInternalChangeCallback(value);
        this.onBlur.emit(event);
    }

    /**
     * @description Decrements the value by one step
     */
    public handleDecrement(): void {
        const value = this._getDecrementedValue();

        this.value = value;
        this.setFilled();
        this.resumeStream();
        this.changesObserver.next(value);
        this.onInput.emit(value);
    }

    /**
     * @description Increments the value by one step
     */
    public handleIncrement(): void {
        const value = this._getIncrementedValue();

        this.value = value;
        this.setFilled();
        this.resumeStream();
        this.changesObserver.next(value);
        this.onInput.emit(value);
    }

    public getIncrementArrowClasses(): Object {
        return {
            [CSS_CLASS_ARROW_DISABLED]: !this._canIncrement(),
        };
    }

    public getDecrementArrowClasses(): Object {
        return {
            [CSS_CLASS_ARROW_DISABLED]: !this._canDecrement(),
        };
    }

    public hasIcon(): boolean {
        return !!this.icon;
    }

    /**
     * @description Returns whether current value can be incremented
     */
    private _canIncrement(): boolean {
        return typeof this.max !== 'undefined' ? this.value < this.max : true;
    }

    /**
     * @description Returns whether current value can be decremented
     */
    private _canDecrement(): boolean {
        return typeof this.min !== 'undefined' ? this.value > this.min : true;
    }

    private _getIncrementedValue(): number {
        const nextValue = Math.floor(this.value / this.step) * this.step + this.step;
        const roundedMax = typeof this.max !== 'undefined' ? Math.floor(this.max / this.step) * this.step : Infinity;

        return Math.min(nextValue, roundedMax);
    }

    private _getDecrementedValue(): number {
        const nextValue = Math.ceil(this.value / this.step) * this.step - this.step;
        const roundedMin = typeof this.min !== 'undefined' ? Math.ceil(this.min / this.step) * this.step : -Infinity;

        return Math.max(nextValue, roundedMin);
    }
}
