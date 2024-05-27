/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Injectable,
    OnDestroy
} from '@angular/core';
import {Store} from '@ngrx/store';
import {head} from 'lodash';
import {
    Observable,
    Subscription,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    withLatestFrom,
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {
    KeyboardHelper,
    KeyboardShortcutEnum,
} from '../../../shared/misc/helpers/keyboard.helper';
import {CalendarSelectionActions} from '../store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../store/calendar/calendar-selection/calendar-selection.queries';
import {CalendarSelectionSlice} from '../store/calendar/calendar-selection/calendar-selection.slice';

@Injectable()
export class CalendarSelectionHelper implements OnDestroy {

    private _disposableSubscriptions: Subscription = new Subscription();

    private _selectionItemType: ObjectTypeEnum | null;

    private _selectionItemTypeObservable: Observable<ObjectTypeEnum> = this._calendarSelectionQueries.observeCalendarSelectionItems()
        .pipe(
            map(selectionItems => head(selectionItems)?.type || null)
        );

    constructor(private _calendarSelectionQueries: CalendarSelectionQueries,
                private _keyboardHelper: KeyboardHelper,
                private _store: Store<State>) {
        this._setSubscriptions();
    }

    public ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public canSelectItemType(type: ObjectTypeEnum): boolean {
        return (this._selectionItemType === null || this._selectionItemType === type);
    }

    public observeCanSelectItemType(type: ObjectTypeEnum): Observable<boolean> {
        return this._selectionItemTypeObservable.pipe(
            map(() => this.canSelectItemType(type)),
            distinctUntilChanged());
    }

    public observeSelectionItemsType(): Observable<ObjectTypeEnum | null> {
        return this._selectionItemTypeObservable.pipe(
            distinctUntilChanged(),
        );
    }

    public toggleSelectionItem(itemId: string, itemType: ObjectTypeEnum): void {
        const isItemSelectable = this.canSelectItemType(itemType);

        if (isItemSelectable) {
            const objectIdentifierPair = new ObjectIdentifierPair(itemType, itemId);

            this._store.dispatch(new CalendarSelectionActions.Toggle.SelectionItem(objectIdentifierPair));
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._selectionItemTypeObservable.subscribe(type => this._selectionItemType = type)
        );

        this._disposableSubscriptions.add(
            this._keyboardHelper.getShortcutPressedState(KeyboardShortcutEnum.CherryPick).pipe(
                withLatestFrom(this._calendarSelectionQueries.observeCalendarSelectionSlice()),
                filter(([, {context}]: [boolean, CalendarSelectionSlice]) => context === null),
                map(([isCherryPicking]: [boolean, CalendarSelectionSlice]) => isCherryPicking),
            ).subscribe((isCherryPicking: boolean) => this._toggleSelection(isCherryPicking)));
    }

    private _toggleSelection(isMultiSelecting: boolean): void {
        this._store.dispatch(new CalendarSelectionActions.Set.Selection(isMultiSelecting, null));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
