/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    UntypedFormControl
} from '@angular/forms';

export const CSS_CLASS_SWITCH_BUTTON_NORMAL = 'ss-switch-button--normal';
export const CSS_CLASS_SWITCH_BUTTON_CRITICAL = 'ss-switch-button--critical';
export const CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED = 'ss-switch-button--inverted-content';

export type SwitchButtonType = 'normal' | 'critical';

@Component({
    selector: 'ss-switch-button',
    templateUrl: './switch-button.component.html',
    styleUrls: ['./switch-button.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitchButtonComponent),
            multi: true,
        },
    ],
})
export class SwitchButtonComponent implements ControlValueAccessor, OnInit {
    /**
     * @description Identifier for AAT selector
     * @type {string}
     */
    @Input() public automationAttr = '';

    /**
     * @description Input content inverted
     * @contentInverted {boolean}
     */
    @Input() public contentInverted = false;

    /**
     * @description Angular form control
     * @type {FormControl}
     */
    @Input() public control: UntypedFormControl;

    /**
     * @description Whether the input component is disabled or not
     * @type {boolean}
     */
    @Input() public isDisabled: boolean;

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
     * @description Label icon
     * @type {string}
     */
    @Input() public icon: string;

    /**
     * @description Input value
     * @type {string}
     */
    @Input() public value: boolean;

    /**
     * @description Input type
     * @type {SwitchButtonType}
     */
    @Input() public type: SwitchButtonType = 'critical';

    /**
     * @description Trigger input switch event
     * @type {EventEmitter}
     */
    @Output() public onSwitch: EventEmitter<any> = new EventEmitter();

    /**
     * @description Switch button styles
     * @type {{ [key: string]: boolean }}
     */
    public switchButtonStyles: { [key: string]: boolean };

    /**
     * @description Init component
     */
    ngOnInit() {
        this._setStyles();
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param value
     */
    public writeValue(value: boolean): void {
        this.value = value;
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
    public onInputChange(event: Event): void {
        event.stopPropagation();

        this.value = !this.value;

        this._propagateChange(this.value);
        this.onSwitch.emit(this.value);
    }

    /**
     * @description Provides the information if a checkbox is checked or not
     * @returns {boolean}
     */
    public isChecked(): boolean {
        return this.value;
    }

    private _propagateChange = (_: any): void => {
    }

    /**
     * @description Set style of element
     * @private
     */
    private _setStyles() {
        this.switchButtonStyles = {
            [CSS_CLASS_SWITCH_BUTTON_NORMAL]: this.type === 'normal',
            [CSS_CLASS_SWITCH_BUTTON_CRITICAL]: this.type === 'critical',
            [CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED]: this.contentInverted,
        };
    }
}
