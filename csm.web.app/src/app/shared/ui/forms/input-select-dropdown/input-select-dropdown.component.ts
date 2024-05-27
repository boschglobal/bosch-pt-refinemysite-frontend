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
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
    differenceWith,
    isArray,
    isEqual,
    xorWith
} from 'lodash';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {KeyEnum} from '../../../misc/enums/key.enum';
import {UUID} from '../../../misc/identification/uuid';
import {Z_INDEX} from '../../constants/z-index.constants';
import {FlyoutOpenTriggerEnum} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MenuItemType} from '../../menus/menu-item/menu-item.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';
import {BaseInputDirective} from '../input.base';

export const INPUT_SELECT_DROPDOWN_CHECK_ALL_ID = 'INPUT_SELECT_DROPDOWN-CHECK-ALL';
export const INPUT_SELECT_DROPDOWN_CLEAR_ID = 'INPUT_SELECT_DROPDOWN-CLEAR';

@Component({
    selector: 'ss-input-select-dropdown',
    templateUrl: './input-select-dropdown.component.html',
    styleUrls: ['./input-select-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputSelectDropdownComponent),
            multi: true,
        },
    ],
})
export class InputSelectDropdownComponent extends BaseInputDirective implements ControlValueAccessor, OnChanges, OnInit, OnDestroy {

    /**
     * @description Input with default value
     * @type {Array}
     */
    @Input()
    public value: (string | string[]) = [];

    /**
     * @description Input with dropdown options
     */
    @Input()
    public options: SelectOption[] | SelectOptionGroup[];

    /**
     * @description Input that defines with input is to be multiple select or single
     */
    @Input()
    public multiple: boolean;

    /**
     * @description Input for empty option message key
     */
    @Input()
    public emptyOptionMessageKey: string;

    /**
     * @description Input that defines if a label should be translated or not
     * @type {boolean}
     */
    @Input()
    public translateLabel = false;

    /**
     * @description Input to override BaseInput debounceTime value
     * @type {number}
     */
    @Input()
    public debounceTime = 0;

    /**
     * @description TemplateRef to render custom option and displayValue
     * @type {TemplateRef<any>}
     */
    @Input()
    public optionTemplate: TemplateRef<any>;

    /**
     * @description Property with input view child
     */
    @ViewChild('input', {static: true})
    public input: ElementRef;

    /**
     * @description Property to track the value displayed
     * @type {string}
     */
    public displayValue = '';

    /**
     * @description Property to check if dropdown is opened
     * @type {boolean}
     */
    public isOpened = false;

    /**
     * @description Property with the menu items list
     * @type {MenuItemsList[]}
     */
    public itemsList: MenuItemsList[];

    /**
     * @description Flyout ID
     * @type {string}
     */
    public flyoutId: string;

    /**
     * @description Flyout triggers
     * @type [FlyoutOpenTriggerEnum]
     */
    public flyoutTriggers: FlyoutOpenTriggerEnum[] = [FlyoutOpenTriggerEnum.Click, FlyoutOpenTriggerEnum.Focus];

    /**
     * @description Flyout keyUp close triggers
     * @type {Array}
     */
    public flyoutCloseKeyTriggers: KeyEnum[] = [KeyEnum.Escape, KeyEnum.Tab];

    /**
     * @description Flyout content z-index
     * @type {number}
     */
    public flyoutZIndex = Z_INDEX.index__100000;

    public displayOptions: SelectOption[] = [];

    private _flattenedOptions: SelectOption[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(protected _changeDetectorRef: ChangeDetectorRef,
        private _flyoutService: FlyoutService) {
        super(_changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();
        this._setInputSubscriptions();

        this.flyoutId = `ss-input-select-dropdown-${this.name}-${UUID.v4()}`;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this._unsetInputSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('options')
            || changes.hasOwnProperty('multiple')
            || changes.hasOwnProperty('optionTemplate')
            || changes.hasOwnProperty('emptyOptionMessageKey')) {
            this._setItemsList();
            this._setDisplayValue();
        }
    }

    /**
     * @description Method that writes default value when it exists
     * @param value
     */
    public writeValue(value: string[]): void {
        if (this._isDifferentValue(value)) {
            this.value = value;
            this._updateItemsListSelectedState();
            this._setDisplayValue();
            this.setFilled();
        }

        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Triggered when some internal change occurs
     * @param value
     */
    public onInternalChangeCallback(value: (string | string[])): void {
        this.onChangeCallback(value);
        this.onTouchedCallback();
        this.onChange.emit(value);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Triggered when list is clicked
     * @param item
     */
    public handleItemClicked(item: MenuItem): void {
        switch (item.id) {
            case INPUT_SELECT_DROPDOWN_CHECK_ALL_ID:
                this._handleCheckAllClick(item);
                break;
            case INPUT_SELECT_DROPDOWN_CLEAR_ID:
                this._handleSingleItemClick(null);
                break;
            default:
                this._handleSingleItemClick(item.value);
        }
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Triggered when dropdown open
     * @param event
     * @returns {boolean}
     */
    private _handleOpen(event: Event): void {
        this.isOpened = true;
        this.onInputFocus(event);
        this._openFlyout();
    }

    /**
     * @description Triggered when dropdown closes
     * @param event
     * @returns {boolean}
     */
    private _handleClose(event?: Event): void {
        this.isOpened = false;
        this._onInputBlur(event);
        this._closeFlyout();
    }

    /**
     * @description Method to toggle dropdown status
     * @param event
     */
    public handleToggle(event: Event): void {
        if (this.isOpened) {
            this._handleClose(event);
        } else {
            this._handleOpen(event);
        }
    }

    public handleToggleMouseDown(event: Event): void {
        if (this.isOpened) {
            event.stopPropagation();
        }
    }

    /**
     * @description Triggered when element is focused
     * @param event
     */
    public onInputFocus(event: Event): void {
        this.setFilled();
        this.isFocused = true;
        this.onFocus.emit(event);
    }

    /**
     * @description Method called to set focus on input
     */
    public setFocus(): void {
        setTimeout(() => this.input.nativeElement.focus(), 0);
    }

    /**
     * @description Triggered when element is blurred
     * @param event
     */
    public _onInputBlur(event: Event): void {
        this.setFilled();
        this.isFocused = false;
        this.onTouchedCallback();
        this.onBlur.emit(event);
    }

    /**
     * @description Get error messages key
     */
    public getErrorMessageKey(): string {
        const ERRORS = this.control.errors;
        return ERRORS[Object.keys(ERRORS)[0]].message;
    }

    private _areAllSelected(): boolean {
        return this.value.length === this._flattenedOptions.length;
    }

    private _isSelected(item: MenuItem): boolean {
        const isCheckAllSelected = item.id === INPUT_SELECT_DROPDOWN_CHECK_ALL_ID ? this._areAllSelected() : false;
        const isItemSelected = isArray(this.value) ? this.value.some(value => isEqual(value, item.value)) : isEqual(this.value, item.value);

        return isCheckAllSelected || isItemSelected;
    }

    private _setDisplayValue(): void {
        if (this.optionTemplate) {
            const displayOptions = isArray(this.value)
                ? this.value.map(value => this._getOptionByValue(value))
                : [this._getOptionByValue(this.value)];
            this.displayValue = '';
            this.displayOptions = displayOptions.filter(displayOption => displayOption !== null);
        } else {
            this.displayValue = isArray(this.value)
                ? this._getSelectedOptionsString(this.value)
                : this._getLabelByValue(this.value);
            this.displayOptions = [];
        }
    }

    private _handleCheckAllClick({selected}: MenuItem): void {
        this.value = selected ? this._getAllValues() : [];
        this._updateItemsListSelectedState();
        this._handleChange();
    }

    private _handleSingleItemClick(value: string | string[]): void {
        if (this.multiple) {
            this.value = xorWith(this.value, [value], isEqual);
        } else {
            this.value = value;
            this._handleClose();
        }

        this._updateItemsListSelectedState();
        this._handleChange();
    }

    private _handleChange() {
        this.changesObserver.next(this.value);
        this.onInput.emit(this.value);
        this._setDisplayValue();
    }

    private _getAllValues(): string[] {
        return this._flattenedOptions.map(option => option.value);
    }

    private _getOptionByValue(value: any): SelectOption {
        return this._flattenedOptions.find(option => isEqual(option.value, value)) || null;
    }

    private _getLabelByValue(value: string): string {
        const selectedOption = this._flattenedOptions.find(option => isEqual(option.value, value));
        return typeof selectedOption !== 'undefined' ? selectedOption.label : '';
    }

    private _getSelectedOptionsString(value: string[]): string {
        return value
            .map(this._getLabelByValue.bind(this))
            .join(', ');
    }

    private _isDifferentValue(value: string[]): boolean {
        let isDifferent: boolean;

        if (this.multiple) {
            isDifferent = this.value.length !== value.length || !!differenceWith(this.value, value, isEqual).length;
        } else {
            isDifferent = !isEqual(this.value, value);
        }

        return isDifferent;
    }

    private _setItemsList(): void {
        const optionGroups: SelectOptionGroup[] = this._isSelectOptionGroupArray(this.options) ? this.options : [{options: this.options}];
        const type: MenuItemType = this.multiple ? 'checkbox' : 'select';

        this._flattenedOptions = [];
        this.itemsList = optionGroups.map((optionGroup: SelectOptionGroup) => ({
            customFigureTemplate: this.optionTemplate,
            title: optionGroup.title,
            separator: optionGroup.separator,
            items: optionGroup.options.map((option: SelectOption) => {
                const {value, label} = option;
                const item: MenuItem = {
                    label,
                    type,
                    value,
                    id: value,
                };

                item.selected = this._isSelected(item);
                this._flattenedOptions.push(option);

                return item;
            }),
        }));

        if (this.multiple && this._flattenedOptions.length > 0) {
            const checkAllMenuItemsList: MenuItemsList = {
                separator: true,
                items: [{
                    type: 'checkbox',
                    id: INPUT_SELECT_DROPDOWN_CHECK_ALL_ID,
                    label: 'Generic_All',
                    selected: this._areAllSelected(),
                    unsearchable: true,
                }],
            };

            this.itemsList.unshift(checkAllMenuItemsList);
        }

        if (this.emptyOptionMessageKey && !this.multiple) {
            const emptyOptionMenuItemsList: MenuItemsList = {
                separator: true,
                items: [{
                    type: 'select',
                    id: INPUT_SELECT_DROPDOWN_CLEAR_ID,
                    label: this.emptyOptionMessageKey,
                    unsearchable: true,
                }],
            };

            this.itemsList.unshift(emptyOptionMenuItemsList);
        }
    }

    private _updateItemsListSelectedState(): void {
        this.itemsList = this.itemsList.map(itemList => ({
            ...itemList,
            items: itemList.items.map(item => ({
                ...item,
                selected: this._isSelected(item),
            })),
        }));
    }

    private _setInputSubscriptions(): void {
        this._disposableSubscriptions.add(this._flyoutService.openEvents
            .pipe(filter((id) => id === this.flyoutId && !this.isOpened))
            .subscribe(() => this._handleOpen(new MouseEvent('click')))
        );

        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents
                .pipe(filter(id => id === this.flyoutId && this.isOpened))
                .subscribe(() => this._handleClose(new MouseEvent('click')))
        );
    }

    private _unsetInputSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _closeFlyout(): void {
        this._flyoutService.close(this.flyoutId);
    }

    private _openFlyout(): void {
        this._flyoutService.open(this.flyoutId);
    }

    private _isSelectOptionGroupArray(options: SelectOption[] | SelectOptionGroup[]): options is SelectOptionGroup[] {
        return options.length && options[0].hasOwnProperty('options');
    }
}

export class SelectOption<V = any> {
    label: string;
    value: V;
}

export class SelectOptionGroup<V = any> {
    title?: string;
    options: SelectOption<V>[];
    separator?: boolean;
}
