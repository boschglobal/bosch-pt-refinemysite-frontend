/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {
    combineLatest,
    iif,
    Observable,
    of,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {CalendarSelectionActionEnum} from '../../../enums/calendar-selection-action.enum';
import {CalendarSelectionContextEnum} from '../../../enums/calendar-selection-context.enum';
import {DayCard} from '../../../models/day-cards/day-card';
import {Task} from '../../../models/tasks/task';
import {DayCardQueries} from '../../day-cards/day-card.queries';
import {ProjectTaskQueries} from '../../tasks/task-queries';
import {CalendarSelectionSlice} from './calendar-selection.slice';

@Injectable({
    providedIn: 'root',
})
export class CalendarSelectionQueries {
    public moduleName = 'calendarModule';

    public sliceName = 'calendarSelectionSlice';

    constructor(private _dayCardQueries: DayCardQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    /**
     * @description Retrieves an observable with the current calendar selected items
     * @returns {Observable<ObjectIdentifierPair[]>}
     */
    public observeCalendarSelectionItems(): Observable<ObjectIdentifierPair[]> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionItems()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the current calendar selection context
     * @returns {Observable<CalendarSelectionContextEnum>}
     */
    public observeCalendarSelectionContext(): Observable<CalendarSelectionContextEnum> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionContext()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable that checks if the current context matches the provided one
     * @returns {Observable<boolean>}
     */
    public observeCalendarSelectionIsContextActive(context: CalendarSelectionContextEnum): Observable<boolean> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionContext()),
                map((calendarSelectionContext: CalendarSelectionContextEnum) => calendarSelectionContext === context),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the current calendar selected daycard items
     * @returns {Observable<DayCard[]>}
     */
    public observeDayCardSelectionItems(): Observable<DayCard[]> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionItems()),
                map((items: ObjectIdentifierPair[]) => items
                    .filter(item => item.type === ObjectTypeEnum.DayCard)
                    .map(item => item.id)),
                switchMap((dayCardIds: string[]) =>
                    iif(() => !!dayCardIds.length,
                        combineLatest(
                            dayCardIds.map(id => this._dayCardQueries.observeDayCardById(id).pipe(filter(dayCard => !!dayCard)))),
                        of([]))),
                distinctUntilChanged(DayCard.isEqualArray),
            );
    }

    /**
     * @description Retrieves an observable with the current calendar selected task items
     * @returns {Observable<Task[]>}
     */
    public observeTaskCalendarSelectionItems(): Observable<Task[]> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionItems()),
                map((items: ObjectIdentifierPair[]) => items
                    .filter(item => item.type === ObjectTypeEnum.Task)
                    .map(item => item.id)),
                switchMap((ids) => this._projectTaskQueries.observeTasksById(ids)),
                distinctUntilChanged(Task.isEqualArray),
            );
    }

    /**
     * @description Retrieves an observable with the current calendar selected items ids by a given type
     * @returns {Observable<string[]>}
     */
    public observeCalendarSelectionItemsIdsByType(type: ObjectTypeEnum): Observable<string[]> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionItems()),
                map((items: ObjectIdentifierPair[]) => items
                    .filter(item => item.type === type)
                    .map(item => item.id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with that checks if the current selection is a multi-selection
     * @returns {Observable<boolean>}
     */
    public observeCalendarSelectionIsMultiSelecting(): Observable<boolean> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionIsMultiSelecting()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the current calendar selection action
     * @returns {Observable<CalendarSelectionActionEnum}
     */
    public observeCalendarSelectionAction(): Observable<CalendarSelectionActionEnum> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionAction()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves an observable with the current calendar selection slice
     * @returns {Observable<CalendarSelectionSlice>}
     */
    public observeCalendarSelectionSlice(): Observable<CalendarSelectionSlice> {
        return this._store
            .pipe(
                select(this._getCalendarSelectionSlice()),
                distinctUntilChanged());
    }

    private _getCalendarSelectionContext(): (state: State) => CalendarSelectionContextEnum {
        return (state: State) => this._getSlice(state).context;
    }

    private _getCalendarSelectionItems(): (state: State) => ObjectIdentifierPair[] {
        return (state: State) => this._getSlice(state).items;
    }

    private _getCalendarSelectionIsMultiSelecting(): (state: State) => boolean {
        return (state: State) => this._getSlice(state).isMultiSelecting;
    }

    private _getCalendarSelectionSlice(): (state: State) => CalendarSelectionSlice {
        return (state: State) => this._getSlice(state);
    }

    private _getCalendarSelectionAction(): (state: State) => CalendarSelectionActionEnum {
        return (state: State) => this._getSlice(state).action;
    }

    private _getSlice(state: State): CalendarSelectionSlice {
        return state.projectModule[this.moduleName][this.sliceName];
    }
}
