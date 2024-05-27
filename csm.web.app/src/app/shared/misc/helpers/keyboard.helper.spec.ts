/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {KeyEnum} from '../enums/key.enum';
import {
    KeyboardHelper,
    KeyboardShortcutEnum,
} from './keyboard.helper';
import {SystemHelper} from './system.helper';

describe('Keyboard Helper', () => {
    let keyboardHelper: KeyboardHelper;
    let disposableSubscription: Subscription;

    const systemHelperMock: SystemHelper = mock(SystemHelper);
    const keyEnumModifierKeyMap: { [key in KeyEnum]?: keyof EventModifierInit } = {
        [KeyEnum.Alt]: 'altKey',
        [KeyEnum.AltGr]: 'modifierAltGraph',
        [KeyEnum.Control]: 'ctrlKey',
        [KeyEnum.Meta]: 'metaKey',
        [KeyEnum.Shift]: 'shiftKey',
    };

    const macOsShortcuts: { [key in KeyboardShortcutEnum]: KeyEnum } = {
        [KeyboardShortcutEnum.CherryPick]: KeyEnum.Meta,
        [KeyboardShortcutEnum.AdjacentSelect]: KeyEnum.Shift,
        [KeyboardShortcutEnum.Copy]: KeyEnum.Alt,
    };

    const pressKey = (key: KeyEnum) => {
        const modifierKey = keyEnumModifierKeyMap[key];
        const keyDownEvent = new KeyboardEvent('keydown', {[modifierKey]: true});

        window.dispatchEvent(keyDownEvent);
    };

    const releaseKey = (key: KeyEnum) => {
        const modifierKey = keyEnumModifierKeyMap[key];
        const keyUpEvent = new KeyboardEvent('keyup', {[modifierKey]: false});

        window.dispatchEvent(keyUpEvent);
    };

    const moveMouseWithKeyPressed = (key: KeyEnum, keyState: boolean) => {
        const modifierKey = keyEnumModifierKeyMap[key];
        const mouseEvent = new MouseEvent('mousemove', {[modifierKey]: keyState});

        window.dispatchEvent(mouseEvent);
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            KeyboardHelper,
            {
                provide: SystemHelper,
                useValue: instance(systemHelperMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    afterEach(() => disposableSubscription.unsubscribe());

    it('should emit TRUE on Copy Shortcut when Option key is down in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.Copy)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Alt);
    }));

    it('should emit FALSE on Copy Shortcut when Option key is released in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Alt);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.Copy)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Alt);
    }));

    it('should emit TRUE on Copy Shortcut when Control key is down in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.Copy)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Control);
    }));

    it('should emit FALSE on Copy Shortcut when Control key is released in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Control);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.Copy)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Control);
    }));

    it('should not emit multiple times on Copy Shortcut when key is pressed down multiple times', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);
        let counter = 0;

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.Copy)
            .subscribe(() => {
                counter++;
            });

        pressKey(KeyEnum.Alt);
        pressKey(KeyEnum.Alt);
        pressKey(KeyEnum.Alt);
        pressKey(KeyEnum.Alt);
        pressKey(KeyEnum.Alt);

        expect(counter).toBe(1);
    }));

    it('should emit TRUE on CherryPick Shortcut when Command key is down in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Meta);
    }));

    it('should emit FALSE on CherryPick Shortcut when Command key is released in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Meta);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Meta);
    }));

    it('should emit TRUE on CherryPick Shortcut when Control keys are down in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Control);
    }));

    it('should emit FALSE on CherryPick Shortcut when Control key is released in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Control);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Control);
    }));

    it('should emit TRUE on CherryPick Shortcut when AltGr key is down in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.AltGr);
    }));

    it('should emit FALSE on CherryPick Shortcut when AltGr key is released in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.AltGr);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.CherryPick)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.AltGr);
    }));

    it('should emit TRUE on AdjacentSelect Shortcut when Shift key is down in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Shift);
    }));

    it('should emit FALSE on AdjacentSelect Shortcut when Shift key is released in Mac OS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(true);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Shift);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Shift);
    }));

    it('should emit TRUE on AdjacentSelect Shortcut when Shift key is down in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)
            .subscribe((result: boolean) => {
                expect(result).toBeTruthy();
            });

        pressKey(KeyEnum.Shift);
    }));

    it('should emit FALSE on AdjacentSelect Shortcut when Shift key is released in non-MacOS', waitForAsync(() => {
        when(systemHelperMock.isMacOS()).thenReturn(false);
        keyboardHelper = TestBed.inject(KeyboardHelper);

        pressKey(KeyEnum.Shift);

        disposableSubscription = keyboardHelper
            .getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)
            .subscribe((result: boolean) => {
                expect(result).toBeFalsy();
            });

        releaseKey(KeyEnum.Shift);
    }));

    Object.keys(macOsShortcuts).forEach((shortcut: KeyboardShortcutEnum) => {
        const key = macOsShortcuts[shortcut];

        it(`should consider the ${shortcut} shortcut as inactive when the key is pressed and release inside the app context`, () => {
            let lastState = null;

            when(systemHelperMock.isMacOS()).thenReturn(true);
            keyboardHelper = TestBed.inject(KeyboardHelper);

            disposableSubscription = keyboardHelper
                .getShortcutPressedState(shortcut)
                .subscribe((result: boolean) => lastState = result);

            pressKey(key);
            moveMouseWithKeyPressed(key, true);
            releaseKey(key);

            expect(lastState).toBe(false);
        });

        it(`should consider the ${shortcut} shortcut as inactive when the key is pressed but release outside the app context`, () => {
            let lastState = null;

            when(systemHelperMock.isMacOS()).thenReturn(true);
            keyboardHelper = TestBed.inject(KeyboardHelper);

            disposableSubscription = keyboardHelper
                .getShortcutPressedState(shortcut)
                .subscribe((result: boolean) => lastState = result);

            pressKey(key);
            moveMouseWithKeyPressed(key, false);

            expect(lastState).toBe(false);
        });

        it(`should consider the ${shortcut} shortcut as inactive when the key is not pressed inside the app context`, () => {
            let lastState = null;

            when(systemHelperMock.isMacOS()).thenReturn(true);
            keyboardHelper = TestBed.inject(KeyboardHelper);

            disposableSubscription = keyboardHelper
                .getShortcutPressedState(shortcut)
                .subscribe((result: boolean) => lastState = result);

            moveMouseWithKeyPressed(key, true);

            expect(lastState).toBeNull();
        });
    });
});
