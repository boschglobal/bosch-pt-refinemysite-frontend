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
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {
    flatMapDeep,
    map,
    uniq,
} from 'lodash';
import {Subscription} from 'rxjs';

import {KeyEnum} from '../../../misc/enums/key.enum';
import {Chip} from '../../chips/chip/chip.component';
import {FlyoutModel} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {BaseInputDirective} from '../input.base';
import {
    InputCheckboxNestedComponent,
    InputCheckboxNestedOption,
} from '../input-checkbox-nested/input-checkbox-nested.component';

export const INPUT_MULTIPLE_SELECT_ALL_OPTION: InputMultipleSelectOptionInternal = {
    id: 'ss-input-multiple-select-all-option',
    text: 'Generic_SelectAll',
    value: false,
};

@Component({
    selector: 'ss-input-multiple-select',
    templateUrl: './input-multiple-select.component.html',
    styleUrls: ['./input-multiple-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputMultipleSelectComponent),
            multi: true,
        },
    ],
})
export class InputMultipleSelectComponent extends BaseInputDirective implements OnInit, OnDestroy, ControlValueAccessor {

    @Input()
    public set options(options: InputMultipleSelectOption[]) {
        this._options = options;

        this._initializeInternalOptions();
    }

    public get options(): InputMultipleSelectOption[] {
        return this._options;
    }

    @Input()
    public automationAttr = '';

    @Input()
    public hasSelectAllOption = false;

    @Input()
    public selectAllTextKey = INPUT_MULTIPLE_SELECT_ALL_OPTION.text;

    @ViewChild('inputContent', {static: true})
    public inputContent: ElementRef;

    @ViewChild('searchInput', {static: true})
    public searchInput: ElementRef;

    public optionsFlyoutModel: FlyoutModel = {
        component: InputCheckboxNestedComponent,
        properties: {
            flyoutShowOverlay: false,
        },
        id: 'ssInputMultipleSelect',
        closeKeyTriggers: [KeyEnum.Escape],
        position: 'below',
        alignment: 'center',
        mobileDrawer: false,
    };

    public searchInputControl = new UntypedFormControl('');

    public selectedChipList: Chip[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _filteredInputCheckboxNestedOptions: InputCheckboxNestedOption[] = [];

    private _flyoutOptionsForm = new UntypedFormGroup({});

    private _flyoutOptionsValueChangeSubscription: Subscription = new Subscription();

    private _flyoutOptionsValueChangeEventEmitter: EventEmitter<InputCheckboxNestedOption> = new EventEmitter<InputCheckboxNestedOption>();

    private _internalOptions: InputMultipleSelectOptionInternal[] = [];

    private _options: InputMultipleSelectOption[];

    private _selectedOptionsIds: string[] = [];

    private _selectAllOption: InputMultipleSelectOptionInternal;

    constructor(protected _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService,
                private _translateService: TranslateService) {
        super(_changeDetectorRef);
    }

    public ngOnInit() {
        super.ngOnInit();
        this._setSelectAllOption();
        this._setInputSubscriptions();
        this._setFlyoutOptionsId();
        this._setFlyoutOptionsFormSubscription();
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        this._unsetInputSubscriptions();
    }

    public onInternalChangeCallback(value: string[]): void {
        this.onChangeCallback(value);
        this.onTouchedCallback();
        this.onChange.emit(value);
    }

    public writeValue(value: string[]): void {
        this._selectedOptionsIds = value || [];
        this._initializeInternalOptions();
        this._changeDetectorRef.detectChanges();
    }

    public trackByOptionFn(index: number, item: Chip): string {
        return item.id;
    }

    public handleContentClick(event: Event): void {
        if (event.target === this.inputContent.nativeElement && !this.isDisabled) {
            this.searchInput.nativeElement.focus();
        }
    }

    public onInputFocus(event: Event): void {
        this.isFocused = true;
        this.onFocus.emit(event);
        this._openOptionsFlyout();
    }

    public onInputBlur(event: Event): void {
        this.isFocused = false;
        this.onTouchedCallback();
        this.onBlur.emit(event);
    }

    public handleKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyEnum.Enter) {
            event.preventDefault();
        }
    }

    public handleChipRemove(chip: Chip): void {
        this._updateInternalOptionValueById(chip.id, false);
        this._updateInputCheckboxNestedOptions(this._internalOptions);
        this._handleOptionsValueChange();
    }

    private _initializeInternalOptions(): void {
        this._parseInternalOptions(this.options, this._selectedOptionsIds);
        this._updateInputCheckboxNestedOptions(this._internalOptions);
        this._updateSelectedChipList();
        this._updateInputStatus();
    }

    private _handleOptionsValueChange(): void {
        this._updateSelectedOptionsList();
        this._updateSelectedChipList();
        this._updateInputStatus();
        this._changeDetectorRef.detectChanges();
    }

    private _parseInternalOptions(options: InputMultipleSelectOption[], selectedOptionIds: string[]): void {
        const recursive = (optionsList: InputMultipleSelectOption[]): InputMultipleSelectOptionInternal[] => optionsList.map(option => {
            const parsedOption = {...option, value: selectedOptionIds.indexOf(option.id) !== -1};
            if (parsedOption.children) {
                parsedOption.children = [...recursive(option.children)];
            }
            return parsedOption as InputMultipleSelectOptionInternal;
        });

        this._internalOptions = this.hasSelectAllOption
            ? [{...this._selectAllOption, children: recursive(options)}]
            : recursive(options);

        this._updateParentOptionsValue();
    }

    private _updateParentOptionsValue(options: InputMultipleSelectOptionInternal[] = this._internalOptions): void {
        options.forEach(option => {
            if (option.children) {
                this._updateParentOptionsValue(option.children);
                option.value = this._derivedParentOptionValue(option);
            }
        });
    }

    private _derivedParentOptionValue(option: InputMultipleSelectOptionInternal): boolean {
        if (option.children) {
            return !(option.children.map(childOption => this._derivedParentOptionValue(childOption)).some(value => !value));
        }
        return option.value;
    }

    private _getFlatInternalOptions(): InputMultipleSelectOptionInternal[] {
        const options = this._internalOptions;
        const recursive = (option: any) => [option, flatMapDeep(option.children, recursive)];

        return flatMapDeep(options, recursive);
    }

    private _mapSelectedOptionsToChips(optionsSelected: string[]): void {
        this.selectedChipList = optionsSelected.map(optionId => {
            const option = this._getFlatInternalOptions().find(item => item.id === optionId);
            const {id, text, customVisualContent} = option;
            return {id, text, customVisualContent};
        });
    }

    private _mapInternalOptionsToInputNestedOptions(options: InputMultipleSelectOptionInternal[] = []): InputCheckboxNestedOption[] {
        const recursive = (list: InputMultipleSelectOptionInternal[]): InputCheckboxNestedOption[] =>
            list.map((option: InputMultipleSelectOptionInternal) => {
                const {id, value, text, groupText, children, customVisualContent} = option;
                const parsedOption = {id, value, text, groupText, children, customVisualContent};

                if (parsedOption.children) {
                    parsedOption.children = recursive(option.children);
                }
                return option;
            });

        return recursive(options);
    }

    private _filterInternalOptionsByText(searchString: string): void {
        const filteredOptions: InputMultipleSelectOptionInternal[] = searchString.length > 0
            ? this._getFilteredInternalOptionsByText(searchString)
            : this._internalOptions;

        this._updateInputCheckboxNestedOptions(filteredOptions);
        this._updateFlyoutState();
    }

    private _getFilteredInternalOptionsByText(searchString: string): InputMultipleSelectOptionInternal[] {
        const key = searchString.toLowerCase();
        const flatOptions = this._getFlatInternalOptions();

        return flatOptions
            .map(option => {
                const flatOption = Object.assign({}, {...option});
                delete flatOption.children;
                return flatOption;
            })
            .filter(option => option.text.toLowerCase().includes(key));
    }

    private _updateSelectedChipList() {
        const recursive = (options: InputMultipleSelectOptionInternal[]) =>
            options.reduce((acc: string[], curr: any) => {
                if (curr.value && curr.id !== INPUT_MULTIPLE_SELECT_ALL_OPTION.id) {
                    acc.push(curr.id);
                } else if (curr.children) {
                    acc.push(...recursive(curr.children));
                }
                return acc;
            }, []);
        const parsedChipsIds = recursive(this._internalOptions);

        this._mapSelectedOptionsToChips(parsedChipsIds);
    }

    private _updateSelectedOptionsList(): void {
        const recursive = (options: InputMultipleSelectOptionInternal[], selected: boolean): string[] =>
            options.reduce((acc: string[], curr: InputMultipleSelectOptionInternal) => {
                if (curr.children) {
                    acc.push(...recursive(curr.children, selected));
                } else if (curr.value === selected) {
                    acc.push(curr.id);
                }
                return acc;
            }, []);

        const currentSelectedValues = recursive(this._internalOptions, true);
        const currentUnselectedValues = recursive(this._internalOptions, false);

        this._selectedOptionsIds = uniq([
            ...this._selectedOptionsIds.filter(optionId => currentUnselectedValues.indexOf(optionId) === -1),
            ...currentSelectedValues,
        ]);

        this.onInternalChangeCallback(this._selectedOptionsIds);
    }

    private _updateInternalOptionValueById(optionId: string, value: boolean): void {
        const option = this._getFlatInternalOptions().find(item => item.id === optionId);
        const recursive = (options) => map(options, (item) => {
            item.value = value;
            recursive(item.children || []);
        });

        recursive([option]);
        this._updateParentOptionsValue();
    }

    private _updateInputCheckboxNestedOptions(options: InputMultipleSelectOptionInternal[]): void {
        this._filteredInputCheckboxNestedOptions = this._mapInternalOptionsToInputNestedOptions(options);
        this._updateInputCheckboxNestedOptionsFlyoutProperties();
    }

    private _updateInputCheckboxNestedOptionsFlyoutProperties(): void {
        this._flyoutOptionsForm = new UntypedFormGroup({});
        this._flyoutOptionsValueChangeEventEmitter = new EventEmitter<InputCheckboxNestedOption>();

        this.optionsFlyoutModel.properties = Object.assign({}, this.optionsFlyoutModel.properties, {
            form: this._flyoutOptionsForm,
            options: this._filteredInputCheckboxNestedOptions,
            optionValueChanged: this._flyoutOptionsValueChangeEventEmitter,
        });

        this._setFlyoutOptionsFormSubscription();
    }

    private _updateInputStatus(): void {
        this.isFilled = this._selectedOptionsIds.length > 0 || this.searchInputControl.value.length > 0;
    }

    private _updateFlyoutState(): void {
        const validOptions = !!this._filteredInputCheckboxNestedOptions.length;

        if (validOptions) {
            if (!this._flyoutService.isFlyoutOpen(this.optionsFlyoutModel.id)) {
                this._openOptionsFlyout();
            }
        } else {
            this._closeOptionsFlyout();
        }
    }

    private _openOptionsFlyout(): void {
        this._updateInputCheckboxNestedOptionsFlyoutProperties();
        this._flyoutService.open(this.optionsFlyoutModel.id);
    }

    private _closeOptionsFlyout(): void {
        this._flyoutService.close(this.optionsFlyoutModel.id);
    }

    private _resetSearchInput(): void {
        this.searchInputControl.setValue('', {emitEvent: false});
    }

    private _setInputSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.searchInputControl.valueChanges
                .subscribe(value => {
                    this._filterInternalOptionsByText(value);
                    this._updateInputStatus();
                    this._changeDetectorRef.detectChanges();
                }));
    }

    private _setSelectAllOption(): void {
        this._selectAllOption = {
            ...INPUT_MULTIPLE_SELECT_ALL_OPTION,
            text: this._translateService.instant(this.selectAllTextKey) as string,
        };
    }

    private _setFlyoutOptionsId(): void {
        this.optionsFlyoutModel.id = this.name ? `${this.optionsFlyoutModel.id}-${this.name}` : this.optionsFlyoutModel.id;
    }

    private _setFlyoutOptionsFormSubscription(): void {
        this._flyoutOptionsValueChangeSubscription.unsubscribe();
        this._flyoutOptionsValueChangeSubscription = this._flyoutOptionsValueChangeEventEmitter
            .subscribe((option: InputCheckboxNestedOption) => {
                this._updateInternalOptionValueById(option.id, option.value);
                this._handleOptionsValueChange();

                if (this.searchInputControl.value && this.searchInputControl.value.length > 0) {
                    this._resetSearchInput();
                    this._closeOptionsFlyout();
                    this._updateInputCheckboxNestedOptions(this._internalOptions);
                }
            });

    }

    private _unsetInputSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
        this._flyoutOptionsValueChangeSubscription.unsubscribe();
    }

}

export interface InputMultipleSelectOption {
    id: string;
    text: string;
    separator?: boolean;
    groupText?: string;
    children?: InputMultipleSelectOption[];
    customVisualContent?: InputMultipleOptionsCustomContent;
}

export interface InputMultipleOptionsCustomContent {
    template: TemplateRef<any>;
    data?: any;
}

export interface InputMultipleSelectOptionInternal extends InputMultipleSelectOption {
    value: boolean;
    children?: InputMultipleSelectOptionInternal[];
}
