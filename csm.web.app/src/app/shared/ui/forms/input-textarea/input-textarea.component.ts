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
    HostListener,
    Input,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {BaseInputDirective} from '../input.base';

export const CSS_CLASS_TEXTAREA_SCROLLABLE = 'ss-input-textarea__input--scrollable';
export const TEXTAREA_DEFAULT_MIN_HEIGHT = 96;
export const TEXTAREA_DEFAULT_MAX_HEIGHT = 192;
const TEXTAREA_DEFAULT_BLACK_SPACE = 15;

@Component({
    selector: 'ss-input-textarea',
    templateUrl: './input-textarea.component.html',
    styleUrls: ['input-textarea.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputTextareaComponent),
            multi: true
        }
    ],
})
export class InputTextareaComponent extends BaseInputDirective implements ControlValueAccessor {

    /**
     * @description Handler function for document resize
     * @private
     */
    @HostListener('window:resize', ['$event.target'])
    private _handleWindowResize() {
        this._resizeTextarea();
    }

    @ViewChild('inputTextareaHidden', {static: true}) public inputTextareaHidden: ElementRef;

    /**
     * @description Input for the min height of the textarea
     * @type {number}
     */
    @Input() public textareaMinHeight: number = TEXTAREA_DEFAULT_MIN_HEIGHT;

    /**
     * @description Input for the max height of the textarea
     * @type {number}
     */
    @Input() public textareaMaxHeight: number = TEXTAREA_DEFAULT_MAX_HEIGHT;

    /**
     * @description Input to define if the textarea is autosize
     * @type {boolean}
     */
    @Input() public isAutosize = true;

    /**
     * @description Property with input view child
     */
    @ViewChild('textarea', {static: true})
    public textarea: ElementRef;

    private _textareaHeight: number = TEXTAREA_DEFAULT_MIN_HEIGHT;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param value
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
     * @param value
     */
    public writeValue(value: string): void {
        this.value = !value ? '' : value;

        this.pauseStream();
        this.updateCharacterNumber();
        this.setFilled();
        setTimeout(this._resizeTextarea.bind(this), 0);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method to be called when the input's input event is triggered
     */
    public onInputChange(): void {
        this.resumeStream();
        this.updateCharacterNumber();
        this.changesObserver.next(this.value);
        this.onInput.emit(this.value);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method to be called when the input's keyup event is triggered
     */
    public onInputKeyup(): void {
        this._resizeTextarea();
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
        this.isFilled = this.value !== '';
        this.isFocused = false;
        this.onInternalChangeCallback(this.value);
        this.onBlur.emit(event);
    }

    /**
     * @description Retrieves textarea CSS classes
     * @returns {Object}
     */
    public getClasses(): Object {
        return {
            [CSS_CLASS_TEXTAREA_SCROLLABLE]: this._isTextareaTallerThanOrEqualToMaxHeight() || !this.isAutosize
        };
    }

    /**
     * @description Retrieves textarea CSS styles
     * @returns {Object}
     */
    public getStyle(): Object {
        return {
            height: this._textareaHeight + 'px',
        };
    }

    /**
     * @description Method called to set focus on input
     */
    public setFocus(): void {
        setTimeout(() => this.textarea.nativeElement.focus(), 0);
    }

    private _isTextareaTallerThanOrEqualToMaxHeight(): boolean {
        return this._textareaHeight >= this.textareaMaxHeight;
    }

    private _resizeTextarea(): void {
        if (!this.isAutosize) {
            return;
        }

        let nextTextareaHeight: number;
        nextTextareaHeight = this.inputTextareaHidden.nativeElement.scrollHeight + TEXTAREA_DEFAULT_BLACK_SPACE;
        nextTextareaHeight = Math.max(nextTextareaHeight, this.textareaMinHeight);
        nextTextareaHeight = Math.min(nextTextareaHeight, this.textareaMaxHeight);
        this._textareaHeight = nextTextareaHeight;
    }
}
