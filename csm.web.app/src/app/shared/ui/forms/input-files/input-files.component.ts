/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';

import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {UUID} from '../../../misc/identification/uuid';
import {COLORS} from '../../constants/colors.constant';
import {
    BaseInputDirective,
    CSS_CLASS_DISABLED,
    CSS_CLASS_REQUIRED
} from '../input.base';

export const CSS_CLASS_FILES_FOCUSED = 'ss-input-files--focused';
export const CSS_CLASS_FILES_FILLED = 'ss-input-files--filled';
export const CSS_CLASS_FILES_VALID = 'ss-input-files--valid';
export const CSS_CLASS_FILES_INVALID = 'ss-input-files--invalid';
export const CSS_CLASS_FILES_MULTIPLE = 'ss-input-files--multiple';
export const CSS_CLASS_FILES_PREVIEW_VALID = 'ss-input-files__preview-single--valid';
export const CSS_CLASS_FILES_PREVIEW_INVALID = 'ss-input-files__preview-single--invalid';
export const CSS_CLASS_LABEL_ACTIVE = 'ss-input-files__label--active';

export type InputFilesSize = 'normal' | 'small';

@Component({
    selector: 'ss-input-files',
    templateUrl: './input-files.component.html',
    styleUrls: ['./input-files.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputFilesComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFilesComponent extends BaseInputDirective implements ControlValueAccessor {
    /**
     * @description Property with input picture element reference
     */
    @ViewChild('inputFiles', {static: true}) public inputFiles: ElementRef;

    /**
     * @description Input with accepted picture RegExp
     * @type {RegExp}
     */
    @Input() public accept = /image-*/;

    /**
     * @description Input errors message params
     * @type {Object}
     */
    @Input() public errorMessageParams: Object = {};

    /**
     * @description Input with accepted picture size
     * @type {RegExp}
     */
    @Input() public maxSize = 0;

    /**
     * @description Input to allow multiple files
     * @type {boolean}
     */
    @Input() public multiple = true;

    /**
     * @description Input to override BaseInput debounceTime value
     * @type {number}
     */
    @Input() public debounceTime = 0;

    /**
     * @description Input Secondary label
     * @type {string}
     */
    @Input() public secondaryLabel: string;

    /**
     * @description Whether to show the plus button.
     */
    @Input() public canAddFiles = true;

    /**
     * @description Input multiple Files error message key label
     * @type {string}
     */
    @Input() public multipleErrorMessageKey = 'Generic_InvalidFiles';

    /**
     * @description Input single File error message key label
     * @type {string}
     */
    @Input() public singleErrorMessageKey = 'Generic_InvalidFile';

    /**
     * @description Input to define the size of the component
     * @type {InputFilesSize}
     */
    @Input()
    public size: InputFilesSize = 'normal';

    /**
     * @description Property with files uploaded
     * @type {Array}
     */
    public files: InputFile[] = [];

    public placeholderIconColor = COLORS.dark_grey;

    constructor(private _attachmentHelper: AttachmentHelper,
                protected _changeDetectorRef: ChangeDetectorRef) {
        super(_changeDetectorRef);
    }

    /**
     * @description Triggered when some internal change occurs
     */
    public onInternalChangeCallback(): void {
        const files: File[] = this._getParsedFiles();

        this.onChangeCallback(files);
        this.onTouchedCallback();
        this.setFilled();
        this.value = files;
        this.onChange.emit(this.files);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method that writes default value when it exists
     * @param value
     */
    public writeValue(value: File[] | null): void {
        this.value = value;

        if (!this.value) {
            this.files = [];
        }
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method called to open finder in explorer
     */
    public openFinder(): void {
        const evt = new MouseEvent('click', {bubbles: false, cancelable: false});

        this.inputFiles.nativeElement.dispatchEvent(evt);
    }

    public handleClick(): void {
        if (this.canAddFiles) {
            this.openFinder();
        }
    }

    /**
     * @description Triggered when drag starts
     */
    public handleDragEnter(): void {
        if (!this.canAddFiles) {
            return;
        }

        this.isFocused = true;
    }

    /**
     * @description Triggered when drag finishes
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
        if (!this.canAddFiles) {
            return;
        }

        event.preventDefault();

        this.isFocused = false;
        this.handleInputChange(event);
    }

    /**
     * @description Triggered when input changes
     * @param event
     */
    public handleInputChange(event: any): void {
        const files: FileList = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        if (!files) {
            return;
        }

        this._handleFiles(files);
        this._clearInput();
        this.onInternalChangeCallback();
    }

    /**
     * @description Sets image filled value
     * @returns {boolean}
     */
    public setFilled(): void {
        this.isFilled = this.files.length > 0;
    }

    /**
     * @description Return when input value is invalid
     * @returns {boolean}
     */
    public isInvalid(): boolean {
        return this.control.touched ? this.control.invalid : false;
    }

    /**
     * @description Return when input value is valid
     * @returns {boolean}
     */
    public isValid(): boolean {
        return this.control.touched ? this.control.valid : false;
    }

    /**
     * @description Get input picture css classes
     * @returns {Object}
     */
    public getInputClasses(): Object {
        return {
            [CSS_CLASS_REQUIRED]: this.isRequired,
            [CSS_CLASS_DISABLED]: this.isDisabled,
            [CSS_CLASS_FILES_FOCUSED]: this.isFocused,
            [CSS_CLASS_FILES_VALID]: this.isValid(),
            [CSS_CLASS_FILES_INVALID]: this.isInvalid(),
            [CSS_CLASS_FILES_FILLED]: this.isFilled,
            [CSS_CLASS_FILES_MULTIPLE]: this.multiple,
            [`ss-input-files--${this.size}`]: true,
        };
    }

    /**
     * @description Get preview pictures css classes
     * @returns {Object}
     */
    public getPreviewClasses(index: number): Object {
        const hasError = this.files[index].error;

        return {
            [CSS_CLASS_FILES_PREVIEW_VALID]: !hasError,
            [CSS_CLASS_FILES_PREVIEW_INVALID]: hasError,
        };
    }

    /**
     * @description Triggered when picture is deleted
     * @param {Event} event
     * @param {number} index
     */
    public deletePicture(event: Event, index: number): void {
        event.stopPropagation();

        this.files.splice(index, 1);
        this.onInternalChangeCallback();
    }

    /**
     * @description Return when placeholder can be show or not
     * @returns {boolean}
     */
    public canShowPlaceholder(): boolean {
        return this.files.length === 0;
    }

    /**
     * @description Return url of background image preview
     * @param {number} index
     * @returns {string}
     */
    public getPreviewSrc(index: number): string {
        return `url(${this.files[index].preview.src})`;
    }

    /**
     * @description Return the total existing errors
     * @returns {number}
     */
    public getTotalErrors(): number {
        return this.files.reduce((a: number, b: InputFile) => b.error ? a + 1 : a, 0);
    }

    /**
     * @description Return error message params
     * @returns {Object}
     */
    public getErrorMessageParams(): Object {
        return {
            numberOfFiles: this.getTotalErrors(),
            maxFileSizeInMb: this._attachmentHelper.convertBytesToMb(this.maxSize),
            ...this.errorMessageParams,
        };
    }

    /**
     * @description Return error message key
     * @returns {string}
     */
    public getErrorMessageKey(): string {
        return this.getTotalErrors() === 1 ? this.singleErrorMessageKey : this.multipleErrorMessageKey;
    }

    private _handleFiles(files: FileList | File[]): void {
        if (!files) {
            return;
        }

        if (this.multiple) {
            Array.from(files).forEach((file: File) => {
                const inputFile = this._createInputFile(file);

                this.files.push(inputFile);
                this._readFile(inputFile);
            });
        } else {
            this.files = [this._createInputFile(files[0], false)];
        }
    }

    private _clearInput(): void {
        this.inputFiles.nativeElement.value = null;
    }

    private _createInputFile(rawFile: File, loading = true): InputFile {
        const normalizedFile = this._attachmentHelper.normalizeFilename(rawFile);
        const uuid: string = UUID.v4();

        return {
            uuid,
            file: normalizedFile,
            error: this._hasErrors(normalizedFile),
            preview: {
                loading,
                src: '',
            },
        };
    }

    private _hasErrors(file: File): boolean {
        return file.type.match(this.accept) === null || file.size > this.maxSize;
    }

    private _readFile(inputFile: InputFile): void {
        const reader = new FileReader();

        reader.onloadend = (event: any) => {
            inputFile.preview.loading = false;
            inputFile.preview.src = event.target.result;

            this._changeDetectorRef.detectChanges();
        };

        reader.readAsDataURL(inputFile.file);
    }

    private _getParsedFiles(): File[] {
        return this.files
            .filter((file: InputFile) => !file.error)
            .map((file: InputFile) => file.file);
    }
}

export interface InputFile {
    uuid: string;
    file: File;
    error: boolean;
    preview: {
        src: string;
        loading: boolean;
    };
}
