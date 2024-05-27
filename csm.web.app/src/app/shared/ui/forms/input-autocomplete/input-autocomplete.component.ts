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
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {clone} from 'lodash';

import {KeyEnum} from '../../../misc/enums/key.enum';
import {UUID} from '../../../misc/identification/uuid';
import {FlyoutOpenTriggerEnum} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MenuItem} from '../../menus/menu-list/menu-list.component';
import {BaseInputDirective} from '../input.base';

export const AUTOCOMPLETE_ACTION_KEYS: string[] = [
    KeyEnum.Tab,
    KeyEnum.Enter,
    KeyEnum.Escape,
    KeyEnum.ArrowUp,
    KeyEnum.ArrowDown,
];

export enum SearchTypeInputAutocompleteEnum {
    Any = 'Any',
    Begin = 'Begin'
}

@Component({
    selector: 'ss-input-autocomplete',
    templateUrl: './input-autocomplete.component.html',
    styleUrls: ['input-autocomplete.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputAutocompleteComponent),
            multi: true,
        },
    ],
})
export class InputAutocompleteComponent extends BaseInputDirective implements ControlValueAccessor, OnInit, OnDestroy {

    /**
     * @description Input to define if the options should always be shown
     * @type {boolean}
     */
    @Input()
    public alwaysShowOptions = false;

    /**
     * @description Input with max visible options
     * @type {number}
     */
    @Input()
    public maxOptions = -1;

    /**
     * @description Input with list of options
     * @type {Array}
     */
    @Input()
    public list: string[] = [];

    /**
     * @description Input with the search type in input
     * @type {SearchTypeInputAutocompleteEnum}
     */
    @Input()
    public searchType: SearchTypeInputAutocompleteEnum = SearchTypeInputAutocompleteEnum.Any;

    /**
     * @description Input to define if list should be sorted alphabetically
     * @type {boolean}
     */
    @Input()
    public sortList = true;

    /**
     * @description Time in milliseconds to wait before propagating the change of value
     * @type {number}
     */
    @Input() public debounceTime = 0;

    @Input() public autofocus = false;

    /**
     * @description Output property triggered when input is selected
     * @type {EventEmitter}
     */
    @Output()
    public select: EventEmitter<any> = new EventEmitter();

    @ViewChild('input', {static: true})
    public input: ElementRef;

    /**
     * @description Property with input options
     * @type {Array}
     */
    public options: MenuItem<string>[] = [];

    /**
     * @description Property with active options
     */
    public activeOption: string;

    /**
     * @description Property with autocomplete options
     */
    public autocomplete: string;

    /**
     * @description Flyout ID
     * @type {string}
     */
    public flyoutId: string;

    public flyoutTriggers: FlyoutOpenTriggerEnum[] = [];

    private _selectedOption: string;

    constructor(protected _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService) {
        super(_changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();

        this.flyoutId = `ss-input-autocomplete-${this.name}-${UUID.v4()}`;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param {string} value
     */
    public onInternalChangeCallback(value: string | null): void {
        const trimmedValue = this.getTrimmedValue(value);
        this.onChangeCallback(trimmedValue);
        this.onTouchedCallback();
        this.onChange.emit(trimmedValue);
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param {string} value
     */
    public writeValue(value: string): void {
        if (!value) {
            this.value = '';
            this.setFilled();
            this.updateCharacterNumber();
            return;
        }

        if (value !== this._selectedOption) {
            this._selectOption(value);
        }

        this.updateCharacterNumber();
        this.setFilled();
    }

    /**
     * @description Triggered when key down
     * @param {KeyboardEvent} event
     */
    public onInputKeyDown(event: KeyboardEvent): void {
        if (!AUTOCOMPLETE_ACTION_KEYS.includes(event.key)) {
            event.stopPropagation();
        }

        if (event.key === KeyEnum.Tab || event.key === KeyEnum.Escape) {
            this._closeFlyout();
        }
    }

    /**
     * @description Triggered when key up
     * @param {KeyboardEvent} event
     */
    public onInputKeyUp(event: KeyboardEvent): void {
        event.stopPropagation();

        if (event.key === KeyEnum.Enter) {
            this._closeFlyout();
        }

        if (AUTOCOMPLETE_ACTION_KEYS.includes(event.key)) {
            return;
        }

        if (this.value === null) {
            this._setOptions();
            this.autocomplete = '';
            this.onInternalChangeCallback('');
            this._closeFlyout();
            return;
        }

        this._setOptions();
        this._setAutocomplete();
        this.onInternalChangeCallback(this.value);
        this.updateCharacterNumber();
    }

    /**
     * @description Method to be called when the input's blur event is triggered
     * @param {Event} event
     */
    public onInputBlur(event: Event): void {
        this.setFilled();
        this.isFocused = false;
        this.onBlur.emit(event);
    }

    /**
     * @description Method to be called when the input's focus event is triggered
     * @param {Event} event
     */
    public onInputFocus(event: Event): void {
        this.setFilled();
        this.isFocused = true;
        this.onFocus.emit(event);

        if (this._selectedOption !== null) {
            this._selectOption(null);
            this._setOptions();
            this._setAutocomplete();
        }

        if (this.options.length) {
            this._setAutocomplete();
            this._setFlyoutVisibility();
        }

        this._setOptions();
    }

    /**
     * @description Method to be called when the input's mouse over event is triggered
     * @param {MenuItem | null} item
     */
    public handleItemHovered(item: MenuItem | null): void {
        const option = item?.value || null;
        this._setActiveOption(option);
    }

    /**
     * @description Method to be called when the input's mouse down event is triggered
     * @param {string} option
     */
    public handleItemClicked(option: string): void {
        this._selectOption(option);
        this._closeFlyout();
    }

    public setFocus(): void {
        setTimeout(() => this.input.nativeElement.focus(), 0);
    }

    private _selectOption(option: string): void {
        this._selectedOption = option;

        if (this._selectedOption) {
            this.value = option;
            this.setFilled();
            this.autocomplete = '';
            this.select.emit(option);
            this.changesObserver.next(option);
            this.updateCharacterNumber();
            this.onInternalChangeCallback(option);
        }
    }

    private _setOptions(): void {
        if (!this.value && !this.alwaysShowOptions) {
            this.options = [];
            this._closeFlyout();
            return;
        }

        if (this.list === null || this.list.length === 0) {
            return;
        }

        this.options = this._getFilteredOptions();

        if (this.maxOptions > -1) {
            this.options = this.options.slice(0, this.maxOptions);
        }

        if (this.options.length === 0) {
            this.autocomplete = '';
        } else {
            this._setAutocomplete();
        }

        this._setFlyoutVisibility();
    }

    private _setFlyoutVisibility(): void {
        if (this.options.length > 0) {
            this._openFlyout();
        } else {
            this._closeFlyout();
        }
    }

    private _openFlyout(): void {
        this._flyoutService.open(this.flyoutId);
    }

    private _closeFlyout(): void {
        this._setActiveOption(null);
        this._flyoutService.close(this.flyoutId);
    }

    private _setAutocomplete(): void {
        if (this.activeOption === null || this.searchType === SearchTypeInputAutocompleteEnum.Any) {
            this.autocomplete = '';
            return;
        }

        this.autocomplete = `${this.value}${(this.activeOption || '').slice(this.value.length)}`;
    }

    private _setActiveOption(option: string): void {
        this.activeOption = option;
        this._setAutocomplete();
    }

    private _buildMenuItems(options: string[]): MenuItem[] {
        return options.map(option => ({
            id: option,
            label: option,
            value: option,
            type: 'select',
            selected: this.value === option,
        }));
    }

    private _getFilteredOptions(): MenuItem<string>[] | undefined {
        let options: string[] = [];

        if (this.value) {
            if (this.searchType === SearchTypeInputAutocompleteEnum.Any) {
                options = this.list.filter(item => item.toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
            } else {
                options = this.list.filter(item => item.toLowerCase().startsWith(this.value.toLowerCase()));
            }
        } else if (this.alwaysShowOptions) {
            options = clone(this.list);
        }

        if (this.sortList) {
            options.sort();
        }

        return this._buildMenuItems(options);
    }
}
