/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
} from '@angular/core';
import {
    findIndex,
    findLastIndex,
    includes,
} from 'lodash';

import {KeyEnum} from '../../../misc/enums/key.enum';

const MASK_VALIDATORS: { [key: string]: (character: string) => boolean } = {
    9: character => /^[0-9]$/.test(character),
    a: character => /^[a-zA-Z]$/.test(character),
    '*': character => /^.$/.test(character),
    default: () => false,
};

const ALLOWED_KEYS = [KeyEnum.Tab, KeyEnum.ArrowLeft, KeyEnum.ArrowRight];
export const DEFAULT_SPECIAL_CHARACTERS = [' ', '/', '(', ')', '+', '\/', '-', '.'];

@Directive({
    selector: '[ssInputMask]',
})
export class InputMaskDirective {

    /**
     * @description
     * The mask that will define the rules for entering values into the input
     *
     * @usageNotes
     * Can have the following characters:
     * 9 => represents any number
     * a => represents any letter, uppercase or lowercase
     * * => represents any character
     *
     * Can also include special character, which by default represented in the DEFAULT_SPECIAL_CHARACTERS const, but
     * can be overridden in the maskSpecialCharacters @Input
     *
     * @example
     * 99/99/9999
     * aaaa-aaa
     * 99.**.**
     */
    @Input()
    public mask: string;

    /**
     * @description
     * The placeholder that will appear in place of the mask when values are being entered in the input
     * Must be the same size as the mask
     */
    @Input()
    public set maskPlaceholder(maskPlaceholder: string) {
        this._maskPlaceholder = maskPlaceholder;
        this._setInputPlaceholder();
    }

    /**
     * @description
     * The special characters that can be present in the mask
     * Must be the same size as the mask
     */
    @Input()
    public maskSpecialCharacters: string[] = DEFAULT_SPECIAL_CHARACTERS;

    @Input()
    public set value(value: string) {
        this._inputElement.value = this._isValidValue(value) ? value : '';
    }

    @Output()
    public maskValueChange = new EventEmitter<string>();

    private _filledPositions: string[];

    private _inputElement: HTMLInputElement;

    @HostListener('blur')
    private _handleBlur(): void {
        const hasFilledPositions = this._filledPositions.some(position => position !== null);

        if (this._inputElement.value === this._maskPlaceholder && !hasFilledPositions) {
            this._inputElement.value = '';
        }
    }

    @HostListener('focus')
    private _handleFocus(): void {
        this._initFilledPositions();

        setTimeout(() => {
            if (this._inputElement.value === '') {
                this._inputElement.value = this._maskPlaceholder;
                this._moveCaretToFirstAvailablePosition();
            } else {
                this._selectAll();
            }
        }, 0);
    }

    @HostListener('input')
    private _handleInput(): void {
        const initialInputValue = '';
        const value = this._inputElement.value;

        this._inputElement.value = this._maskPlaceholder;
        this._moveCaretToFirstAvailablePosition();

        value.split('').forEach(character => this._handleKeyPressed(character));

        this._handleValueChange(initialInputValue);
    }

    @HostListener('keydown', ['$event'])
    private _handleKeyDown(event: KeyboardEvent): void {
        const initialInputValue = this._inputElement.value;

        if (event.metaKey || event.ctrlKey || ALLOWED_KEYS.includes(event.key as KeyEnum)) {
            return;
        }

        event.preventDefault();

        switch (event.key) {
            case KeyEnum.Backspace:
                this._handleBackspace();
                break;
            case KeyEnum.Delete:
                this._handleDelete();
                break;
            default:
                this._handleKeyPressed(event.key);
        }

        this._handleValueChange(initialInputValue);
    }

    @HostListener('paste', ['$event'])
    private _handlePaste(event: ClipboardEvent): void {
        const initialInputValue = this._inputElement.value;
        const value = event.clipboardData.getData('text');

        event.preventDefault();
        value.split('').forEach(character => this._handleKeyPressed(character));

        this._handleValueChange(initialInputValue);
    }

    private _maskPlaceholder: string;

    constructor(elementRef: ElementRef<HTMLInputElement>) {
        this._inputElement = elementRef.nativeElement;
    }

    private _getNextNotFilledPosition(currentPosition: number): number {
        return this._filledPositions.findIndex((key, index) => index >= currentPosition && key !== null);
    }

    private _getNextValidPosition(currentPosition: number): number {
        const nextPosition = currentPosition + 1;
        const nextMaskValue = this.mask.slice(nextPosition);
        const maskIndex = findIndex(nextMaskValue, character => !includes(this.maskSpecialCharacters, character));

        return maskIndex >= 0 ? nextPosition + maskIndex : maskIndex;
    }

    private _getPreviousValidPosition(currentPosition: number): number {
        const previousMaskValue = this.mask.slice(0, currentPosition);

        return findLastIndex(previousMaskValue, character => !includes(this.maskSpecialCharacters, character));
    }

    private _getFirstAvailablePosition(): number {
        const value = this._inputElement.value;

        return findIndex(value, (character: string, index: number) => {
            const isSpecialCharacter = includes(this.maskSpecialCharacters, character);
            const isMaskCharacter = this._maskPlaceholder.charAt(index) === character;

            return isMaskCharacter && !isSpecialCharacter;
        });
    }

    private _handleBackspace(): void {
        const {selectionStart, selectionEnd} = this._inputElement;
        const previousValidPosition = this._getPreviousValidPosition(selectionStart);
        const placeholderAtPosition = this._maskPlaceholder.charAt(previousValidPosition);

        if (selectionStart !== selectionEnd) {
            this._resetSelection(selectionStart, selectionEnd);
            this._moveCaret(selectionStart);
        } else if (previousValidPosition >= 0) {
            this._insertValueInInput(previousValidPosition, placeholderAtPosition);
            this._markPositionHasFilled(previousValidPosition, null);

            this._moveCaret(previousValidPosition);
        }
    }

    private _handleDelete(): void {
        const {selectionStart, selectionEnd} = this._inputElement;
        const nextNotFilledPosition = this._getNextNotFilledPosition(selectionStart);
        const placeholderAtPosition = this._maskPlaceholder.charAt(nextNotFilledPosition);

        if (selectionStart !== selectionEnd) {
            this._resetSelection(selectionStart, selectionEnd);
        } else if (nextNotFilledPosition >= 0) {
            this._insertValueInInput(nextNotFilledPosition, placeholderAtPosition);
            this._markPositionHasFilled(nextNotFilledPosition, null);
        }

        this._moveCaret(selectionStart);
    }

    private _handleKeyPressed(key: string): void {
        const {selectionStart, selectionEnd} = this._inputElement;
        const currentPosition = this._getNextValidPosition(selectionStart - 1);

        if (this._isValidKey(key, currentPosition)) {
            this._resetSelection(selectionStart, selectionEnd);
            this._insertValueInInput(currentPosition, key);
            this._markPositionHasFilled(currentPosition, key);
            this._moveCaretForward(currentPosition);
        }
    }

    private _handleValueChange(initialInputValue: string): void {
        const inputValue = this._inputElement.value;

        if (initialInputValue !== inputValue) {
            this.maskValueChange.emit(inputValue);
        }
    }

    private _initFilledPositions(): void {
        this._filledPositions = Array(this._maskPlaceholder.length).fill(null);

        Array.from(this._inputElement.value)
            .forEach((key, index) => this._markPositionHasFilled(index, this._isValidKey(key, index) ? key : null));
    }

    private _isValidKey(key: string, position: number): boolean {
        const maskValue = this.mask.charAt(position);
        const validator = MASK_VALIDATORS[maskValue] || MASK_VALIDATORS['default'];

        return validator(key);
    }

    private _isValidValue(value: string): boolean {
        return value && !Array.from(value).some((key, index) => {
            const isMaskCharacter = this._maskPlaceholder.charAt(index) === key;
            const isValidKey = this._isValidKey(key, index);

            return !isValidKey && !isMaskCharacter;
        });
    }

    private _moveCaret(position: number): void {
        this._inputElement.setSelectionRange(position, position);
        setTimeout(() => this._inputElement.setSelectionRange(position, position), 0);
    }

    private _moveCaretForward(currentPosition: number): void {
        const maxPosition = this.mask.length;
        const nextValidPosition = this._getNextValidPosition(currentPosition);
        const positionToNavigate = nextValidPosition >= 0 ? nextValidPosition : maxPosition;

        this._moveCaret(positionToNavigate);
    }

    private _moveCaretToFirstAvailablePosition(): void {
        const position = this._getFirstAvailablePosition();

        this._moveCaret(position);
    }

    private _resetSelection(selectionStart: number, selectionEnd: number): void {
        for (let i = selectionStart; i < selectionEnd; i++) {
            const placeholderAtPosition = this._maskPlaceholder.charAt(i);

            this._insertValueInInput(i, placeholderAtPosition);
            this._markPositionHasFilled(i, null);
        }
    }

    private _selectAll(): void {
        const endPosition = this.mask.length;

        this._inputElement.setSelectionRange(0, endPosition);
    }

    private _setInputPlaceholder(): void {
        this._inputElement.placeholder = this._maskPlaceholder;
    }

    private _insertValueInInput(position: number, value: string): void {
        const currentInputValue = this._inputElement.value;

        this._inputElement.value = currentInputValue.slice(0, position) + value + currentInputValue.slice(position + 1);
    }

    private _markPositionHasFilled(position: number, value: string | null): void {
        this._filledPositions[position] = value;
    }
}
