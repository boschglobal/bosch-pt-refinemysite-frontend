/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidatorFn
} from '@angular/forms';
import {
    select,
    Store
} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {SelectOption} from '../../../ui/forms/input-select-dropdown/input-select-dropdown.component';
import {SortDirectionEnum} from '../../../ui/sorter/sort-direction.enum';
import {SorterData} from '../../../ui/sorter/sorter-data.datastructure';

const SORT_DIRECTIONS: SelectOption[] = [
    {
        value: SortDirectionEnum.asc,
        label: 'Generic_Ascending',
    },
    {
        value: SortDirectionEnum.desc,
        label: 'Generic_Descending',
    },
];

@Component({
    selector: 'ss-sorting',
    templateUrl: './sorting.component.html',
    styleUrls: ['./sorting.component.scss']
})
export class SortingComponent implements OnInit, OnDestroy {

    @Input()
    public sorterDataSelectorFunction: (state: any) => {};

    @Input()
    public setSortAction: any;

    /**
     * @description Emits when the pane is to be dismissed
     * @type {EventEmitter}
     */
    @Output() public onClose: EventEmitter<null> = new EventEmitter();

    /**
     * @description Form group for sorting
     * @type {FormGroup}
     */
    public formGroup: UntypedFormGroup;

    /**
     * @description Submiting state
     * @type {boolean}
     */
    public isSubmitting = false;

    /**
     * @description Options to generate sort field radio buttons
     * @type {SelectOption[]}
     */
    @Input()
    public sortMethods: SelectOption[];

    /**
     * @description Options to generate direction radio buttons
     * @type {SelectOption[]}
     */
    public sortDirections: SelectOption[] = SORT_DIRECTIONS;

    private _sortSubscription: Subscription;

    private _sorterData: SorterData;

    constructor(private _formBuilder: UntypedFormBuilder,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Handles the submit of the form
     */
    public onSubmitForm(): void {
        if (!this.isFormValid()) {
            return;
        }

        const {field, direction} = this.formGroup.value;
        const sorterData = new SorterData(field, direction);

        this._store.dispatch(new this.setSortAction(sorterData));
        this.handleCancel();
    }

    /**
     * @description Retrieve the current form validity status
     * @returns {boolean}
     */
    public isFormValid(): boolean {
        return this.formGroup.valid;
    }

    /**
     * @description Handles click on cancel button
     */
    public handleCancel(): void {
        this.onClose.emit();
    }

    public trackByFn(index: number, item: SelectOption): any {
        return item.value;
    }

    private _setSubscriptions(): void {
        this._sortSubscription = this._store
            .pipe(
                select(this.sorterDataSelectorFunction))
            .subscribe(this._handleSortStateChange.bind(this));
    }

    private _unsetSubscriptions(): void {
        this._sortSubscription.unsubscribe();
    }

    private _handleSortStateChange(participantListSort: SorterData): void {
        this._sorterData = participantListSort;
        this._setupForm(participantListSort);
    }

    private _setupForm(participantListSort: SorterData): void {
        this.formGroup = this._formBuilder.group({
            field: [participantListSort.field],
            direction: [participantListSort.direction]
        }, {validator: this._isSortDifferent()});
    }

    private _isSortDifferent(): ValidatorFn {
        return (group: UntypedFormGroup): { [key: string]: any } => {
            const {direction, field} = group.value;
            return this._sorterData.direction === direction && this._sorterData.field === field ? {
                isSortDifferent: {
                    valid: false
                }
            } : null;
        };
    }
}
