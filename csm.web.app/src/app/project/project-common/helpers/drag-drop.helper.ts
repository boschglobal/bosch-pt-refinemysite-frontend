/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    fromEvent,
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {KeyEnum} from '../../../shared/misc/enums/key.enum';

export class DragDropHelper<T> {

    private _dragStarted = new Subject<T>();

    private _dragEnded = new Subject<T>();

    private _dragCanceled: boolean;

    private _keyupSubscription: Subscription;

    private _recordBeingDragged: T;

    public onDragStarted(): Observable<T> {
        return this._dragStarted;
    }

    public onDragEnded(): Observable<T> {
        return this._dragEnded;
    }

    public startDrag(record: T) {
        this._recordBeingDragged = record;
        this._setKeyupSubscription();
        this._setDragCancelState(false);

        this._dragStarted.next(record);
    }

    public endDrag() {
        this._dragEnded.next(this._recordBeingDragged);

        this._recordBeingDragged = null;
        this._unsetKeyupSubscription();
    }

    public cancelDrag(): void {
        this._setDragCancelState(true);
        document.dispatchEvent(new Event('mouseup'));
    }

    public getRecordBeingDragged(): T {
        return this._recordBeingDragged;
    }

    public isDragCanceled(): boolean {
        return this._dragCanceled;
    }

    private _setDragCancelState(cancel: boolean): void {
        this._dragCanceled = cancel;
    }

    private _setKeyupSubscription(): void {
        this._keyupSubscription = fromEvent(window, 'keyup')
            .pipe(filter((event: KeyboardEvent) => !!this._recordBeingDragged && event.key === KeyEnum.Escape))
            .subscribe(() => this.cancelDrag());
    }

    private _unsetKeyupSubscription(): void {
        if (this._keyupSubscription) {
            this._keyupSubscription.unsubscribe();
            this._keyupSubscription = null;
        }
    }
}
