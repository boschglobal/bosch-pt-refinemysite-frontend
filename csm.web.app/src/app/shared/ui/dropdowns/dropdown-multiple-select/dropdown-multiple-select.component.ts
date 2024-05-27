/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {
    countBy,
    flatMapDeep
} from 'lodash';
import {
    merge,
    Subscription,
} from 'rxjs';
import {
    filter,
    map,
} from 'rxjs/operators';

import {ElementAlignment} from '../../../misc/helpers/element-positioning.helper';
import {UUID} from '../../../misc/identification/uuid';
import {ButtonStyle} from '../../button/button.component';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {InputCheckboxNestedOption} from '../../forms/input-checkbox-nested/input-checkbox-nested.component';

export type DropdownSelectSize = 'tiny' | 'small';

export const SELECT_ALL_OPTION = {
    id: 'select_all_id',
    value: false,
    text: 'Generic_SelectAll',
};

@Component({
    selector: 'ss-dropdown-multiple-select',
    templateUrl: './dropdown-multiple-select.component.html',
    styleUrls: ['./dropdown-multiple-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMultipleSelectComponent implements OnInit, OnDestroy {
    @Input()
    public buttonStyle: ButtonStyle = 'tertiary-black';

    @Input()
    public hasSelectAllOption = false;

    @Input()
    public selectAllTextKey: string = SELECT_ALL_OPTION.text;

    @Input()
    public icon: string;

    @Input()
    public itemsAlignment: ElementAlignment = 'start';

    @Input()
    public label: string;

    @Input()
    public set options(options: InputCheckboxNestedOption[]) {
        this._initializeFlyoutOptionsForm();

        this._setOptions(options);
        this._setCurrentSelectedNumber();
    }

    @Input()
    public showBadge = false;

    @Input()
    public size: DropdownSelectSize = 'small';

    @Output()
    public optionClicked = new EventEmitter<InputCheckboxNestedOption>();

    @Output()
    public optionsChanged = new EventEmitter<InputCheckboxNestedOption[]>();

    public selectedNumber: number;

    public flyoutId = `ss-dropdown-multiple-select-${UUID.v4()}`;

    public flyoutOptionsForm = new UntypedFormGroup({});

    public iconRotation = -90;

    public internalOptions: InputCheckboxNestedOption[];

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleOptionChange(optionChanged: InputCheckboxNestedOption): void {
        this.optionClicked.emit(optionChanged);

        if (this.hasSelectAllOption) {
            this.optionsChanged.emit(this.internalOptions[0].children);
        } else {
            this.optionsChanged.emit(this.internalOptions);
        }

        this._setCurrentSelectedNumber();
    }

    private _initializeFlyoutOptionsForm(): void {
        this.flyoutOptionsForm = new UntypedFormGroup({});
    }

    private _setCurrentSelectedNumber(): any {
        const flatInternalOptions = this._getFlatInternalOptions().filter(option => option.id !== SELECT_ALL_OPTION.id);
        const selectedNumber = countBy(flatInternalOptions, (a) => a.value).true;

        this.selectedNumber = selectedNumber;
    }

    private _getFlatInternalOptions(): InputCheckboxNestedOption[] {
        const recursive = (option: any) => [option, flatMapDeep(option.children, recursive)];

        return flatMapDeep(this.internalOptions, recursive);
    }

    private _setIconRotation(isFlyoutOpen: boolean): void {
        this.iconRotation = isFlyoutOpen ? 90 : -90;
        this._changeDetectorRef.detectChanges();
    }

    private _setOptions(options: InputCheckboxNestedOption[]): void {
        if (this.hasSelectAllOption && options) {
            this.internalOptions = [
                {
                    ...SELECT_ALL_OPTION,
                    text: this._translateService.instant(this.selectAllTextKey),
                    children: options,
                },
            ];
        }

        if (!this.hasSelectAllOption && options) {
            this.internalOptions = options;
        }

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            merge(
                this._flyoutService.openEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => true),
                ),
                this._flyoutService.closeEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => false),
                )
            ).subscribe(isFlyoutOpen => {
                this._initializeFlyoutOptionsForm();
                this._setIconRotation(isFlyoutOpen);
            })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
