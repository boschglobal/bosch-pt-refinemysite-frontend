/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Injectable,
    OnDestroy,
} from '@angular/core';
import {
    fromEvent,
    iif,
    merge,
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import {
    distinctUntilChanged,
    switchMap,
    throttleTime,
} from 'rxjs/operators';

import {KeyEnum} from '../enums/key.enum';
import {SystemHelper} from './system.helper';

@Injectable({
    providedIn: 'root',
})
export class KeyboardHelper implements OnDestroy {

    /**
     * This represents the Key Shortcuts in descending order by its priority
     */
    private _keyboardShortcuts: KeyboardShortcut[] = [
        {
            name: KeyboardShortcutEnum.CherryPick,
            keys: {macOS: [[KeyEnum.Meta]], default: [[KeyEnum.Control], [KeyEnum.AltGr]]},
            pressedState: new Subject<boolean>(),
        },
        {
            name: KeyboardShortcutEnum.AdjacentSelect,
            keys: {macOS: [[KeyEnum.Shift]], default: [[KeyEnum.Shift]]},
            pressedState: new Subject<boolean>(),
        },
        {
            name: KeyboardShortcutEnum.Copy,
            keys: {macOS: [[KeyEnum.Alt]], default: [[KeyEnum.Control]]},
            pressedState: new Subject<boolean>(),
        },
    ];

    private _disposableSubscriptions = new Subscription();

    private _os: KeyboardShortcutOS = this._systemHelper.isMacOS() ? 'macOS' : 'default';

    private readonly _mouseMoveThrottleTime = 300;

    constructor(private _systemHelper: SystemHelper) {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public getShortcutPressedState(name: KeyboardShortcutEnum): Observable<boolean> {
        const keyboardShortcut = this._keyboardShortcuts.find(shortcut => shortcut.name === name);

        return keyboardShortcut.pressedState.pipe(distinctUntilChanged());
    }

    private _isShortcutActive(event: KeyboardEvent | MouseEvent, keyboardShortcut: KeyboardShortcut): boolean {
        const osKeyboardShortcut = keyboardShortcut.keys[this._os];

        return osKeyboardShortcut.some(keyGroup => keyGroup.every(key => event.getModifierState(key)));
    }

    private _processEvent(event: KeyboardEvent | MouseEvent): void {
        this._keyboardShortcuts.forEach(keyboardShortcut => {
            const pressedState = this._isShortcutActive(event, keyboardShortcut);

            keyboardShortcut.pressedState.next(pressedState);
        });
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions = merge(
            fromEvent(window, 'keyup'),
            fromEvent(window, 'keydown'),
            ...this._keyboardShortcuts.map(keyboardShortcut => keyboardShortcut.pressedState.pipe(
                distinctUntilChanged(),
                switchMap(pressed => iif(() => pressed,
                    fromEvent(window, 'mousemove').pipe(throttleTime(this._mouseMoveThrottleTime))
                ))))
        ).subscribe((event: KeyboardEvent | MouseEvent) => this._processEvent(event));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

interface KeyboardShortcut {
    name: KeyboardShortcutEnum;
    keys: { [key in KeyboardShortcutOS]: KeyEnum[][] };
    pressedState: Subject<boolean>;
}

type KeyboardShortcutOS = 'macOS' | 'default';

export enum KeyboardShortcutEnum {
    CherryPick = 'CherryPick',
    Copy = 'Copy',
    AdjacentSelect = 'AdjacentSelect',
}
