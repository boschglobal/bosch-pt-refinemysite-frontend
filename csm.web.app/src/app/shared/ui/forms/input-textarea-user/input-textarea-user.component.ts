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

import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {UUID} from '../../../misc/identification/uuid';
import {BaseInputDirective} from '../input.base';

export const CSS_CLASS_SIZE_SMALL = 'ss-input-textarea-user--small';
export const CSS_CLASS_TEXTAREA_SCROLLABLE = 'ss-input-textarea-user__input--scrollable';
export const CSS_CLASS_TEXTAREA_COLLAPSED = 'ss-input-textarea-user--collapsed';
export const CSS_CLASS_TEXTAREA_NO_USER = 'ss-input-textarea-user--no-user';
export const TEXTAREA_USER_DEFAULT_MIN_HEIGHT = 48;
export const TEXTAREA_USER_DEFAULT_MAX_HEIGHT = 192;
const TEXTAREA_DEFAULT_BLACK_SPACE = 15;

@Component({
    selector: 'ss-input-textarea-user',
    templateUrl: './input-textarea-user.component.html',
    styleUrls: ['./input-textarea-user.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputTextareaUserComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextareaUserComponent extends BaseInputDirective implements ControlValueAccessor {

    /**
     * @description Handler function for document resize
     * @private
     */
    @HostListener('window:resize', ['$event.target'])
    private _handleWindowResize() {
        this._resizeTextarea();
    }

    /**
     * @description Property with input text area element ref
     */
    @ViewChild('inputTextarea', {static: true})
    public inputTextarea: ElementRef;

    /**
     * @description Property with input text area hidden element ref
     */
    @ViewChild('inputTextareaHidden', {static: true})
    public inputTextareaHidden: ElementRef;

    /**
     * @description Input for the min height of the textarea
     * @type {number}
     */
    @Input()
    public textareaMinHeight: number = TEXTAREA_USER_DEFAULT_MIN_HEIGHT;

    /**
     * @description Input for the max height of the textarea
     * @type {number}
     */
    @Input()
    public textareaMaxHeight: number = TEXTAREA_USER_DEFAULT_MAX_HEIGHT;

    /**
     * @description Input to define if the textarea is autosize
     * @type {boolean}
     */
    @Input()
    public isAutosize = true;

    /**
     * @description Input to define if the textarea is scrollable
     * @type {boolean}
     */
    @Input()
    public isScrollable = true;

    /**
     * @description Input to define the user
     * @type {ResourceReferenceWithPicture}
     */
    @Input()
    public user: ResourceReferenceWithPicture;

    /**
     * @description Input expanded label
     * @type {string}
     */
    @Input()
    public expandedLabel: string;

    @Input()
    public size: 'normal' | 'small' = 'normal';

    /**
     * @description Input to define if the textarea is collapsed
     * @type {boolean}
     */
    @Input()
    public set isCollapsed(isCollapsed: boolean) {
        this._isCollapsed = isCollapsed;
        this._textareaBlankSpace = isCollapsed ? 0 : TEXTAREA_DEFAULT_BLACK_SPACE;
        this._resizeTextarea();
    }

    public inputId = UUID.v4();

    private _isCollapsed = true;

    private _textareaHeight: number = TEXTAREA_USER_DEFAULT_MIN_HEIGHT;

    private _textareaBlankSpace = 0;

    constructor(protected _changeDetectorRef: ChangeDetectorRef) {
        super(_changeDetectorRef);
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param value
     */
    public onInternalChangeCallback(value: string): void {
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
        setTimeout(() => {
            this._resizeTextarea();
            this._changeDetectorRef.detectChanges();
        }, 0);
    }

    /**
     * @description Method to be called when the input's input event is triggered
     */
    public onInputChange(): void {
        this.resumeStream();
        this.updateCharacterNumber();
        this.changesObserver.next(this.value);
        this.onInput.emit(this.value);
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
            [CSS_CLASS_TEXTAREA_SCROLLABLE]: (this.isScrollable && this._isTextareaTallerThanOrEqualToMaxHeight()) || !this.isAutosize,
        };
    }

    /**
     * @description Returns styles classes for the input based on it's current state
     * @returns {Object}
     */
    public getInputClasses(): Object {
        return {
            ...super.getInputClasses(),
            [CSS_CLASS_TEXTAREA_COLLAPSED]: this._isCollapsed,
            [CSS_CLASS_TEXTAREA_NO_USER]: !this.user,
            [CSS_CLASS_SIZE_SMALL]: this.size === 'small',
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
     * @description Retrieves placeholder based on collapsed state of input
     * @returns {string}
     */
    public getPlaceholder(): string {
        const label: string = this.label;
        const expandedLabel: string = this.expandedLabel || this.label;

        return this._isCollapsed ? label : expandedLabel;
    }

    public setFocus(): void {
        setTimeout(() => this.inputTextarea.nativeElement.focus(), 0);
    }

    private _isTextareaTallerThanOrEqualToMaxHeight(): boolean {
        return this._textareaHeight >= this.textareaMaxHeight;
    }

    private _resizeTextarea(): void {
        if (!this.isAutosize) {
            return;
        }

        let nextTextareaHeight: number;
        nextTextareaHeight = this.inputTextareaHidden.nativeElement.scrollHeight + this._textareaBlankSpace;
        nextTextareaHeight = this._isCollapsed ? nextTextareaHeight : Math.max(nextTextareaHeight, this.textareaMinHeight);
        nextTextareaHeight = this.isScrollable ? Math.min(nextTextareaHeight, this.textareaMaxHeight) : nextTextareaHeight;
        this._textareaHeight = nextTextareaHeight;
    }
}
