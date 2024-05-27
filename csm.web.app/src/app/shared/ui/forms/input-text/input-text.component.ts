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
    ElementRef,
    forwardRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {BaseInputDirective} from '../input.base';

@Component({
    selector: 'ss-input-text',
    templateUrl: './input-text.component.html',
    styleUrls: ['./input-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputTextComponent),
            multi: true
        }
    ]
})
export class InputTextComponent extends BaseInputDirective implements ControlValueAccessor, OnInit {
    /**
     * @description Type of the input
     * @type {string}
     */
    @Input()
    public type = 'text';

    /**
     * @description Fixed value on the input
     */
    @Input()
    public fixedValue: string;

    @Input()
    public autofocus = false;

    /**
     * @description Property with input view child
     */
    @ViewChild('input', {static: true})
    public input: ElementRef;

    constructor(protected _changeDetectorRef: ChangeDetectorRef) {
        super(_changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param {string} value
     */
    public onInternalChangeCallback(value: any): void {
        const trimmedValue = this.getTrimmedValue(value);
        this.onChangeCallback(trimmedValue);
        this.onTouchedCallback();
        this.onChange.emit(trimmedValue);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param {string} value
     */
    public writeValue(value: string): void {
        this.value = !value ? '' : value;

        this.pauseStream();
        this.updateCharacterNumber();
        this.setFilled();
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method to be called when the input's input event is triggered
     */
    public onInputChange(value: string): void {
        this.value = this._getValue(value);
        this.resumeStream();
        this.updateCharacterNumber();
        this.changesObserver.next(this.value);
        this.onInput.emit(this.value);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method to be called when the input's focus event is triggered
     * @param event
     */
    public onInputFocus(event: Event): void {
        this.value = this._getValue(this.value);
        this.setFilled();
        this.isFocused = true;
        this.onFocus.emit(event);
    }

    /**
     * @description Method to be called when the input's blur event is triggered
     * @param event
     */
    public onInputBlur(event: Event): void {
        const value = this._getValue(this.value);

        if (this.fixedValue !== 'undefined' && value === this.fixedValue) {
            this.value = '';
        }

        this.isFilled = this.value !== '';
        this.isFocused = false;
        this.onInternalChangeCallback(value);
        this.onBlur.emit(event);
    }

    /**
     * @description Method called to set focus on input
     */
    public setFocus(): void {
        setTimeout(() => this.input.nativeElement.focus(), 0);
    }

    private _getValue(value): string {
        return typeof this.fixedValue !== 'undefined' ? `${this.fixedValue}${this._getRawValue(value)}` : value;
    }

    private _getRawValue(value): string {
        return typeof this.fixedValue !== 'undefined' && value.indexOf(this.fixedValue) === 0 ?
            value.substring(this.fixedValue.length) :
            value;
    }
}
