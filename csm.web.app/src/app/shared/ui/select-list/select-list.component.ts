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
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

export const CSS_CLASS_SELECT_LIST_OPTION_ACTIVE = 'ss-select-list__option--active';

@Component({
    selector: 'ss-select-list',
    templateUrl: './select-list.component.html',
    styleUrls: ['./select-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SelectListComponent {

    @Input()
    public options: SelectListOption[];

    @Input()
    public selected: SelectListOption;

    @Output()
    public change: EventEmitter<SelectListOption> = new EventEmitter();

    constructor(private _changeDetectorRef: ChangeDetectorRef) {
    }

    /**
     * @description Retrieves button's CSS classes
     * @param option
     * @return Object
     */
    public getButtonClasses(option: SelectListOption): Object {
        return {
            [CSS_CLASS_SELECT_LIST_OPTION_ACTIVE]: this._isOptionSelected(option)
        };
    }

    /**
     * @description Selects current option
     * @param option
     * @return void
     */
    public select(option: SelectListOption): void {
        if (!this._isOptionSelected(option)) {
            this.selected = option;
            this._changeDetectorRef.markForCheck();
            this.change.emit(option);
        }
    }

    /**
     * @description Angular tracking function
     * @param index
     * @param item<string>
     */
    public trackByFn(index: number, item: SelectListOption): string {
        return item.id;
    }

    /**
     * @description Verifies if option is currently selected
     * @param option
     * @return boolean
     */
    private _isOptionSelected(option: SelectListOption): boolean {
        return option.id === this.selected.id;
    }
}

export class SelectListOption {
    displayName: string;
    id: string;
    value?: any;
    icon?: string;
}
