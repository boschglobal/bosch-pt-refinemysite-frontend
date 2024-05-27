/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {uniq} from 'lodash';
import {
    Observable,
    Subject,
} from 'rxjs';

import {DayCard} from '../models/day-cards/day-card';
import {DragDropHelper} from './drag-drop.helper';

@Injectable({
    providedIn: 'root'
})
export class DayCardDragHelper extends DragDropHelper<DayCard> {

    private _connectedDropLists: string[] = [];

    private _connectedListChange = new Subject<string[]>();

    private _dragValidityChange = new Subject<boolean>();

    public onDragValidityChange(): Observable<boolean> {
        return this._dragValidityChange as Observable<boolean>;
    }

    public setDraggingValidity(isValidDrag: boolean): void {
        this._dragValidityChange.next(isValidDrag);
    }

    public onConnectedDropListsChange(): Observable<string[]> {
        return this._connectedListChange as Observable<string[]>;
    }

    public connectDropLists(dropLists: string[]): void {
        this._connectedDropLists = uniq([...this._connectedDropLists, ...dropLists]);
        this._connectedListChange.next(this._connectedDropLists);
    }

    public disconnectDropLists(dropLists: string[]): void {
        this._connectedDropLists = this._connectedDropLists.filter(dropList => !dropLists.includes(dropList));
        this._connectedListChange.next(this._connectedDropLists);
    }
}
