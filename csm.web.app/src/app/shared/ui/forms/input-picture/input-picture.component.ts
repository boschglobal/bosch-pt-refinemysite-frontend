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
    ElementRef,
    forwardRef,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {COLORS} from '../../constants/colors.constant';
import {
    BaseInputDirective,
    CSS_CLASS_DISABLED,
    CSS_CLASS_REQUIRED
} from '../input.base';

export const CSS_CLASS_PICTURE_FOCUSED = 'ss-input-picture--focused';
export const CSS_CLASS_PICTURE_FILLED = 'ss-input-picture--filled';
export const CSS_CLASS_PICTURE_VALID = 'ss-input-picture--valid';
export const CSS_CLASS_PICTURE_INVALID = 'ss-input-picture--invalid';

@Component({
    selector: 'ss-input-picture',
    templateUrl: './input-picture.component.html',
    styleUrls: ['./input-picture.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputPictureComponent),
            multi: true
        }
    ],
})
export class InputPictureComponent extends BaseInputDirective implements ControlValueAccessor, OnChanges {
    /**
     * @description Input with accepted picture RegExp
     * @type {RegExp}
     */
    @Input() public accept = /image-*/;

    /**
     * @description Input to override BaseInput debounceTime value
     * @type {number}
     */
    @Input() public debounceTime = 0;

    /**
     * @description Property with default picture
     */
    @Input() public defaultPicture: string;

    /**
     * @description Property with input picture element reference
     */
    @ViewChild('inputPicture', {static: true}) public inputPicture: ElementRef;

    /**
     * @description Property with define the icon color
     * @type {string}
     */
    public iconColor: string = COLORS.white;

    /**
     * @description Property with source displayPicture
     */
    public displayPicture: string;

    constructor(protected _changeDetectorRef: ChangeDetectorRef,
                private _attachmentHelper: AttachmentHelper) {
        super(_changeDetectorRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('defaultPicture')) {
            this.defaultPicture = changes.defaultPicture.currentValue;
            this._setDisplayPicture(null);
        }
    }

    /**
     * @description Triggered when some internal change occurs
     * @param value
     */
    public onInternalChangeCallback(value: any): void {
        this.onChangeCallback(value);
        this.onTouchedCallback();
        this.value = value;
        this.onChange.emit(value);
    }

    /**
     * @description Method that writes default value when it exists
     * @param value
     */
    public writeValue(value: File | null): void {
        this.value = value;
        this._setDisplayPicture(value);
        this.setFilled();
    }

    /**
     * @description Triggered when drag start
     */
    public handleDragEnter(): void {
        this.isFocused = true;
    }

    /**
     * @description Triggered when drag finish
     */
    public handleDragLeave(): void {
        this.isFocused = false;
    }

    /**
     * @description Triggered when dragging over element
     */
    public handleDragOver(): boolean {
        return false;
    }

    /**
     * @description Triggered when picture is dropped in the input
     * @param event
     */
    public handleDrop(event: any): void {
        event.preventDefault();
        this.isFocused = false;
        this.handleInputChange(event);
    }

    /**
     * @description Triggered when input changes
     * @param event
     */
    public handleInputChange(event: any): void {
        const rawFile = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
        const normalizedFile = this._attachmentHelper.normalizeFilename(rawFile);

        if (!rawFile) {
            return;
        }

        this.onInternalChangeCallback(normalizedFile);
        this._setDisplayPicture(normalizedFile);
        this.setFilled();
    }

    /**
     * @description Method to delete picture when it exists
     * @param event
     */
    public handleDeletePicture(event: Event): void {
        event.stopPropagation();
        this.displayPicture = this.defaultPicture;
        this.inputPicture.nativeElement.value = null;
        this.setFilled();
        this.onInternalChangeCallback(null);
    }

    /**
     * @description Sets image filled value
     * @returns {boolean}
     */
    public setFilled(): void {
        this.isFilled = this.displayPicture && this.displayPicture !== this.defaultPicture;
    }

    /**
     * @description Return when input value is invalid
     * @returns {boolean}
     */
    public isInvalid(): boolean {
        return this.control.touched && this.value !== null ? this.control.invalid : false;
    }

    /**
     * @description Return when input value is valid
     * @returns {boolean}
     */
    public isValid(): boolean {
        return this.control.touched ? (this.control.valid && this.isFilled) : false;
    }

    /**
     * @description Get input picture css classes
     * @returns {Object}
     */
    public getInputClasses(): Object {
        return {
            [CSS_CLASS_REQUIRED]: this.isRequired,
            [CSS_CLASS_DISABLED]: this.isDisabled,
            [CSS_CLASS_PICTURE_VALID]: this.isValid(),
            [CSS_CLASS_PICTURE_INVALID]: this.isInvalid(),
            [CSS_CLASS_PICTURE_FILLED]: this.isFilled,
            [CSS_CLASS_PICTURE_FOCUSED]: this.isFocused
        };
    }

    private _setDisplayPicture(file: File | null): void {
        if (file) {
            const reader = new FileReader();
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsDataURL(file);
            return;
        }

        this.displayPicture = this.defaultPicture;
    }

    private _handleReaderLoaded(event: any): void {
        const reader = event.target;

        this.displayPicture = reader.result;
        this.setFilled();
    }
}
