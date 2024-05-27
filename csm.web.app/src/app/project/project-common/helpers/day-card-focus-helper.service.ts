/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Observable,
    Subject
} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DayCardFocusSelectHelper {

    private _focusedDayCardId: string = null;

    private _focusStarted: Subject<string> = new Subject();

    public getSelectedDayCardId(): string {
        return this._focusedDayCardId;
    }

    public onDayCardFocused(): Observable<string> {
        return this._focusStarted as Observable<string>;
    }

    public newCardFocus(id: string) {
        this._focusedDayCardId = id;
        this._focusStarted.next(id);
    }

    public closeFocusedDayCard() {
        if (this._focusedDayCardId) {
            this.newCardFocus(null);
        }
    }
}
