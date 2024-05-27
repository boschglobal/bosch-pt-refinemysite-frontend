/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    fromEvent,
    Subscription
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {KeyEnum} from '../../misc/enums/key.enum';

export enum MultipleSelectionToolbarConfirmationModeEnum {
    Add,
    Edit,
}

@Component({
    selector: 'ss-multiple-selection-toolbar-confirmation',
    templateUrl: './multiple-selection-toolbar-confirmation.component.html',
    styleUrls: ['./multiple-selection-toolbar-confirmation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleSelectionToolbarConfirmationComponent implements OnInit, OnDestroy {

    @Input()
    public set itemsCount(itemsCount: number) {
        this._itemsCount = itemsCount;
        this.hasItems = itemsCount > 0;
        this.isSingularItemsLabel = itemsCount === 1;
    }

    @Input()
    public set initialItemsCount(initialItemsCount: number) {
        this._hadItemsBefore = initialItemsCount > 0;
    }

    @Input()
    public mode: MultipleSelectionToolbarConfirmationModeEnum = MultipleSelectionToolbarConfirmationModeEnum.Add;

    @Input()
    public emptyItemsLabel: string;

    @Input()
    public selectedItemLabel: string;

    @Input()
    public selectedItemsLabel: string;

    @Output()
    public dismissSelection: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public submitSelection: EventEmitter<null> = new EventEmitter<null>();

    public get itemsCount(): number {
        return this._itemsCount;
    }

    public get hadItemsBefore(): boolean {
        return this._hadItemsBefore && this.mode === MultipleSelectionToolbarConfirmationModeEnum.Edit;
    }

    public hasItems: boolean;

    public isSingularItemsLabel: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _itemsCount: number;

    private _hadItemsBefore: boolean;

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleDismiss(): void {
        this.dismissSelection.emit();
    }

    public handleSubmit(): void {
        this.submitSelection.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions = fromEvent(window, 'keyup')
            .pipe(filter((event: KeyboardEvent) => event.key === KeyEnum.Escape))
            .subscribe(() => this.handleDismiss());
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
