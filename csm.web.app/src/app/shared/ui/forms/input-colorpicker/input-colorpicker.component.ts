/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Component,
    forwardRef,
    Input,
    OnInit
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {BaseInputDirective} from '../input.base';

@Component({
    selector: 'ss-input-colorpicker',
    templateUrl: './input-colorpicker.component.html',
    styleUrls: ['./input-colorpicker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputColorpickerComponent),
            multi: true
        }
    ]
})
export class InputColorpickerComponent extends BaseInputDirective implements ControlValueAccessor, OnInit {

    /**
     * @description Input with colorpicker options
     */
    @Input()
    public options: string[];

    /**
     * @description Input for the title of that color modal
     */
    @Input()
    public modalTitle: string;

    /**
     * @description Property to check if modal is opened
     * @type {boolean}
     */
    public isOpened: boolean;

    /**
     * @description Color to mark as selected
     */
    public selectedOption: string;

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
        this.onChangeCallback(value);
        this.onTouchedCallback();
        this.onChange.emit(value);
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param {string} value
     */
    public writeValue(value: string): void {
        this.value = !value ? this.options[0] : value;

        this.pauseStream();
        this.setFilled();
    }

    /**
     * @description Method to be called when the input's focus event is triggered
     * @param {Event} event
     */
    public onInputFocus(event: Event): void {
        event.preventDefault();
        this.handleOpen();
        this.value = this._getValue();
        this.setFilled();
        this.isFocused = true;
        this.onFocus.emit(event);
    }

    /**
     * @description Method to be called when the input's blur event is triggered
     * @param {Event} event
     */
    public onInputBlur(event: Event): void {
        event.preventDefault();
        const value = this._getValue();

        this.isFilled = this.value !== '';
        this.isFocused = false;
        this.onInternalChangeCallback(value);
        this.onBlur.emit(event);
    }

    /**
     * @description Opens the color modal
     */
    public handleOpen(): void {
        this.selectedOption = this._getValue();
        this.isOpened = true;
    }

    /**
     * @description Closes the color modal
     */
    public handleClose(): void {
        this.isOpened = false;
    }

    /**
     * @description Selects a color in the modal
     * @param {string} option
     */
    public handleSelect(option: string): void {
        this.selectedOption = option;
    }

    /**
     * @description Confirms the current selection and set it as input value
     */
    public handleConfirmSelection(): void {
        const value = this.selectedOption;

        this.value = value;
        this.resumeStream();
        this.changesObserver.next(value);
        this.onInput.emit(value);
        this.handleClose();
    }

    /**
     * @description Retrieves whether the given option is selected
     * @param {string} option
     * @returns {boolean}
     */
    public isSelected(option: string): boolean {
        return this.selectedOption === option;
    }

    private _getValue(): string {
        return this.value;
    }
}
