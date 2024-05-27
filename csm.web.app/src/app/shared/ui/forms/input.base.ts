/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    NEVER,
    Observable,
    Observer,
    Subject,
    Subscription
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    switchMap
} from 'rxjs/operators';

export const CSS_CLASS_FOCUSED = 'ss-input--focused';
export const CSS_CLASS_FILLED = 'ss-input--filled';
export const CSS_CLASS_REQUIRED = 'ss-input--required';
export const CSS_CLASS_DISABLED = 'ss-input--disabled';
export const CSS_CLASS_VALID = 'ss-input--valid';
export const CSS_CLASS_INVALID = 'ss-input--invalid';
export const CSS_CLASS_WARNING = 'ss-input--warning';
export const DEFAULT_DEBOUNCE_TIME = 250;

@Directive()
export abstract class BaseInputDirective implements OnInit, OnDestroy {
    /**
     * @description Time in milliseconds to wait before propagating the change of value
     * @type {number}
     */
    @Input() public debounceTime: number = DEFAULT_DEBOUNCE_TIME;

    /**
     * @description Input label
     * @type {string}
     */
    @Input() public label: string;

    /**
     * @description Input name
     * @type {string}
     */
    @Input() public name = '';

    /**
     * @description Input value
     * @type {any}
     */
    @Input() public value: any = '';

    /**
     * @description Input placeholder
     * @type {string}
     */
    @Input() public placeholder = '';

    /**
     * @description Whether the input component should show error message without been required
     * @type {boolean}
     */
    @Input() public displayErrors: boolean;

    /**
     * @description Whether the input component is required to have a value
     * @type {boolean}
     */
    @Input() public isRequired: boolean;

    /**
     * @description Whether the input component is disabled or not
     * @type {boolean}
     */
    @Input() public isDisabled: boolean;

    /**
     * @description Whether the input component is read only or not
     * @type {boolean}
     */
    @Input() public isReadOnly: boolean;

    /**
     * @description Angular form control
     * @type {FormControl}
     */
    @Input() public control: any;

    /**
     * @description Identifier for AAT selector
     * @type {string}
     */
    @Input() public automationAttr = '';

    /**
     * @description Maximum number of characters that can be typed
     * @type {number}
     */
    @Input() public maxCharacter = null;

    /**
     * @description Alignment of dropdown elements
     * @type {string}
     */
    @Input() public dropdownAlignment: 'right' | 'left' = 'left';

    /**
     * @description Whether the character should be displayed
     * @type {boolean}
     */
    @Input() public showCounter = true;

    /**
     * @description Forwards input's change event
     * @type {EventEmitter}
     */
    @Output() public onChange: EventEmitter<any> = new EventEmitter();

    /**
     * @description Forwards input's input event
     * @type {EventEmitter}
     */
    @Output() public onInput: EventEmitter<any> = new EventEmitter();

    /**
     * @description Forwards input's blur event
     * @type {EventEmitter}
     */
    @Output() public onBlur: EventEmitter<any> = new EventEmitter();

    /**
     * @description Forwards input's focus event
     * @type {EventEmitter}
     */
    @Output() public onFocus: EventEmitter<any> = new EventEmitter();

    /**
     * @description Whether the input component has content or not
     * @type {boolean}
     */
    public isFilled = false;

    /**
     * @description Whether the input component is focused or not
     * @type {boolean}
     */
    public isFocused = false;

    /**
     * @description Observer to value changes
     */
    public changesObserver: Observer<any>;

    /**
     * @description Number of characters typed in the input
     * @type {number}
     */
    public characterNumber = 0;

    private _baseObservable: Observable<any>;
    private _changesObservable: Observable<any>;
    private _changesSubscription: Subscription;
    private _pauserSubject: Subject<boolean>;

    protected constructor(protected _changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * If is needed to implement ngOnInit on child class - call super.ngOnInit()
     */
    ngOnInit() {
        this._createObservables();
        this._setSubscriptions();
        this.resumeStream();
    }

    /**
     * If is needed to implement ngOnDestroy on child class - call super.ngOnDestroy()
     */
    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setSubscriptions(): void {
        this._changesSubscription = this._baseObservable
            .subscribe((value: any) => this.onInternalChangeCallback(value));

        this._changesSubscription.add(
            this.control.statusChanges
                .pipe(distinctUntilChanged())
                .subscribe(() => this._changeDetectorRef.detectChanges())
        );
    }

    private _unsetSubscriptions(): void {
        if (this._changesSubscription) {
            this._changesSubscription.unsubscribe();
        }
    }

    private _createObservables(): void {
        this._pauserSubject = new Subject();
        this._changesObservable = new Observable((observer: any) => this.changesObserver = observer)
            .pipe(debounceTime(this.debounceTime));
        this._baseObservable = this._pauserSubject
            .pipe(
                switchMap((paused: boolean) => paused ? NEVER : this._changesObservable)
            );
    }

    /**
     * @description Pauses the stream of values to avoid overriding values set by Angular forms
     */
    public pauseStream(): void {
        this._pauserSubject.next(true);
    }

    /**
     * @description Resumes the stream of values
     */
    public resumeStream(): void {
        this._pauserSubject.next(false);
    }

    /**
     * @description Returns message key of the first error or message
     * @returns {string}
     */
    public getErrorMessageKey(): string | undefined {
        if (this.control.errors) {
            const firstError = this.getFirstError();
            return firstError.message;
        } else if (this.control.warning && this.control.warning.hasOwnProperty('message')) {
            return this.getWarning('message');
        }
    }

    /**
     * @description Returns params of the first error or warning parameter
     * @returns {string}
     */
    public getErrorParams(): string | undefined {
        if (this.control.errors) {
            const firstError = this.getFirstError();
            return firstError.params;
        } else if (this.control.warning && this.control.warning.hasOwnProperty('params')) {
            return this.getWarning('params');
        }
    }

    /**
     * @description Returns first error of the current control
     * @returns {any}
     */
    public getFirstError(): any {
        if (!this.control) {
            return {};
        }
        const errors = this.control.errors;
        return errors[Object.keys(errors)[0]];
    }

    /**
     * Returns warning message
     */
    public getWarning(property: string): any {
        if (!this.control) {
            return {};
        }
        return this.control.warning[property];
    }

    /**
     * @description Sets the isFilled to true if the input has content
     */
    public setFilled(): void {
        this.isFilled = this.value !== null
            && (this._isNotEmptyString(this.value) || this._isNotEmptyArray(this.value) || this._isNumber(this.value) || this._isObject(this.value));
    }

    public updateCharacterNumber(): void {
        this.characterNumber = this.value.length;
    }

    /**
     * @description Returns true if the current control is in invalid state
     * @returns {boolean}
     */
    public isInvalid(): boolean {
        if (this.control) {
            return (this.control.touched && (this.isRequired || this.displayErrors)) ? this.control.invalid : false;
        }

        return false;
    }

    /**
     * Returns if warning is active
     */
    public isWarning(): boolean | undefined {
        if (this.control && this.control.warning) {
            return this.control.warning.hasOwnProperty('message');
        }
    }

    /**
     * @description Returns true if the current control is in valid state
     * @returns {boolean}
     */
    public isValid(): boolean {
        const {value, touched, valid} = this.control;

        if (this.control) {
            return (value !== null && touched && (this.isRequired || value.length > 0)) ? valid : false;
        }

        return true;
    }

    /**
     * @description Returns styles classes for the input based on it's current state
     * @returns {any}
     */
    public getInputClasses(): any {
        return {
            [CSS_CLASS_REQUIRED]: this.isRequired,
            [CSS_CLASS_VALID]: this.isValid(),
            [CSS_CLASS_INVALID]: this.isInvalid(),
            [CSS_CLASS_FILLED]: this.isFilled,
            [CSS_CLASS_FOCUSED]: !this.isDisabled && this.isFocused,
            [CSS_CLASS_DISABLED]: this.isDisabled,
            [CSS_CLASS_WARNING]: this.isWarning() && !this.isInvalid() && this.isFilled,
        };
    }

    /**
     * @description Returns styles classes for the input's errors based on it's current state
     * @returns {any}
     */
    public getErrorClasses(): any {
        return {
            'ss-input__invalid--active': this.isInvalid()
        };
    }

    /**
     * @description Returns styles classes for the input's errors based on it's current state
     * @returns {any}
     */
    public getFeedbackClasses(): any {
        return {
            'ss-input__warning ss-input__warning--active': this.isWarning(),
            'ss-input__invalid ss-input__invalid--active': this.isInvalid()
        };
    }

    public getDataAutomation(): string {
        return this.isWarning() ? '-warning' : '-invalid';
    }

    /**
     * @description Returns styles for dropdown elements
     * @returns {NgStyle}
     */
    public getDropdownStyles(): Object {
        return {
            [this.dropdownAlignment]: 0
        };
    }

    /**
     * @description Method to be called by the change subscription when new values are injected
     * @param value
     */
    public abstract onInternalChangeCallback(value: any): void;

    /**
     * @description Method to be called when the input is touched
     */
    public onTouchedCallback: () => void = () => {
    }

    /**
     * @description Method to be called when the input value changes
     */
    public onChangeCallback: (_: any) => void = () => {
    }

    /**
     * @description Set the function to be called when the control receives a change event.
     */
    public registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    /**
     * @description Set the function to be called when the control receives a touch event.
     */
    public registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    /**
     * @description This method is called when the control status changes to or from "DISABLED".
     * Depending on the value, it will enable or disable the appropriate DOM element.
     *
     * @param isDisabled
     */
    public setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this._changeDetectorRef.detectChanges();
    }

    public getTrimmedValue(value: string): string {
        return this._isNotEmptyString(value) ? value.trim() : value;
    }

    private _isObject(value: any): boolean {
        return Object.prototype.toString.call(value) === '[object Object]' && !!Object.keys(value).length;
    }

    private _isNumber(value: any): boolean {
        return typeof value === 'number' && !isNaN(value);
    }

    private _isNotEmptyString(value: any): boolean {
        return typeof value === 'string' && value.length > 0;
    }

    private _isNotEmptyArray(value: any): boolean {
        return Array.isArray(this.value) && value.length > 0;
    }
}
