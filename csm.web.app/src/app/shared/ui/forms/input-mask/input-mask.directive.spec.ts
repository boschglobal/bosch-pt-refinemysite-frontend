/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {
    setEventKey,
    setEventSpecialKey,
    SpecialKey,
} from '../../../../../test/helpers';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {
    DEFAULT_SPECIAL_CHARACTERS,
    InputMaskDirective,
} from './input-mask.directive';
import {InputMaskTestComponent} from './input-mask.test.component';

describe('InputMask Directive', () => {
    let fixture: ComponentFixture<InputMaskTestComponent>;
    let comp: InputMaskTestComponent;
    let de: DebugElement;

    const dateMask = '99/99/9999';
    const dateMaskPlaceholder = 'dd/mm/yyyy';
    const blurEvent = new Event('blur');
    const focusEvent = new Event('focus');
    const inputEvent = new InputEvent('input');
    const keyDownEvent = new KeyboardEvent('keydown');
    const pasteEvent = new ClipboardEvent('paste', {clipboardData: new DataTransfer()});

    const getInput = (): HTMLInputElement => de.query(By.css('[data-automation="input-mask-test-input"]')).nativeElement;

    const pressSpecialKey = (key: SpecialKey) => {
        setEventSpecialKey(keyDownEvent, key, true);
        getInput().dispatchEvent(keyDownEvent);
    };
    const releaseSpecialKey = (key: SpecialKey) => {
        setEventSpecialKey(keyDownEvent, key, false);
    };
    const pressKey = (key: KeyEnum | string) => {
        setEventKey(keyDownEvent, key);
        getInput().dispatchEvent(keyDownEvent);
    };

    const moduleDef: TestModuleMetadata = {
        declarations: [
            InputMaskDirective,
            InputMaskTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputMaskTestComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.value = '';
        comp.mask = dateMask;
        comp.maskPlaceholder = dateMaskPlaceholder;
        comp.maskSpecialCharacters = DEFAULT_SPECIAL_CHARACTERS;

        fixture.detectChanges();
    });

    it('should set the native placeholder of the input when the maskPlaceholder attribute is changed', () => {
        const newMaskPlaceholder = 'yyyy/mm/dd';

        comp.maskPlaceholder = newMaskPlaceholder;
        fixture.detectChanges();

        expect(getInput().placeholder).toBe(newMaskPlaceholder);
    });

    it('should set the input value as the mask placeholder when the input is focused and the it is empty', (done) => {
        getInput().dispatchEvent(focusEvent);
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInput().value).toBe(dateMaskPlaceholder);
            done();
        }, 0);
    });

    it('should not set the input value as the mask placeholder when the input is focused and the it isn\'t empty', (done) => {
        const initialInputValue = '12/mm/yyyy';

        comp.value = initialInputValue;
        getInput().dispatchEvent(focusEvent);
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInput().value).toBe(initialInputValue);
            done();
        }, 0);
    });

    it('should navigate to the first position when the input is focused the first time', (done) => {
        getInput().dispatchEvent(focusEvent);
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInput().selectionStart).toBe(0);
            done();
        }, 0);
    });

    it('should navigate to the second position when the input is focused and the first position is a special character', (done) => {
        comp.mask = '+9999';
        comp.maskPlaceholder = '+dddd';

        getInput().dispatchEvent(focusEvent);
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInput().selectionStart).toBe(1);
            done();
        }, 0);
    });

    it('should select all the input value when the input is focused and as already some it has already some filled characters', (done) => {
        comp.value = '31/11/yyyy';
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        setTimeout(() => {
            expect(getInput().selectionStart).toBe(0);
            expect(getInput().selectionEnd).toBe(dateMask.length);
            done();
        }, 0);
    });

    it('should set the input value as empty when the input loses focus, its value is equal to the placeholder and ' +
        'it has no filled characters', (done) => {
        const mask = '9999-999';
        const maskPlaceholder = '1111-111';

        comp.mask = mask;
        comp.maskPlaceholder = maskPlaceholder;
        fixture.detectChanges();

        getInput().dispatchEvent(focusEvent);

        setTimeout(() => {
            getInput().dispatchEvent(blurEvent);

            expect(getInput().value).toBe('');
            done();
        }, 0);
    });

    it('should keep the input value when the input loses focus and it has already some filled characters', (done) => {
        const mask = '9999-999';
        const maskPlaceholder = '1111-111';
        const expectedInputValue = maskPlaceholder;

        comp.mask = mask;
        comp.maskPlaceholder = maskPlaceholder;
        fixture.detectChanges();

        getInput().dispatchEvent(focusEvent);

        setTimeout(() => {
            pressKey('1');
            getInput().dispatchEvent(blurEvent);

            expect(getInput().value).toBe(expectedInputValue);
            done();
        }, 0);
    });

    it('should keep the input value when the input loses focus a second time and it has already some filled characters', (done) => {
        const mask = '9999-999';
        const maskPlaceholder = '1111-111';
        const expectedInputValue = maskPlaceholder;

        comp.mask = mask;
        comp.maskPlaceholder = maskPlaceholder;
        fixture.detectChanges();

        getInput().dispatchEvent(focusEvent);

        setTimeout(() => {
            pressKey('1');
            getInput().dispatchEvent(blurEvent);

            expect(getInput().value).toBe(expectedInputValue);

            getInput().dispatchEvent(focusEvent);

            setTimeout(() => {
                getInput().dispatchEvent(blurEvent);

                expect(getInput().value).toBe(expectedInputValue);
                done();
            }, 0);
        }, 0);
    });

    it('should keep the default behaviour of the input when the Meta Key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressSpecialKey('metaKey');
        releaseSpecialKey('metaKey');

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should keep the default behaviour of the input when the Ctrl Key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressSpecialKey('ctrlKey');
        releaseSpecialKey('ctrlKey');

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should keep the default behaviour of the input when the Tab key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressKey(KeyEnum.Tab);

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should keep the default behaviour of the input when the ArrowLeft key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressKey(KeyEnum.ArrowLeft);

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should keep the default behaviour of the input when the ArrowRight key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressKey(KeyEnum.ArrowRight);

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent the default behaviour of the input when a normal key is pressed', () => {
        spyOn(keyDownEvent, 'preventDefault');

        pressKey('a');

        expect(keyDownEvent.preventDefault).toHaveBeenCalled();
    });

    it('should remove the selected characters when the Backspace key is pressed and the input has characters selected', () => {
        const initialInputValue = '31/11/yyyy';
        const expectedInputValue = 'dd/m1/yyyy';
        const selectionStart = 0;
        const selectionEnd = 4;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(selectionStart, selectionEnd);
        pressKey(KeyEnum.Backspace);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(selectionStart);
        expect(getInput().selectionEnd).toBe(selectionStart);
    });

    it('should remove the character before the caret when the Backspace key is pressed and the previous character ' +
        'is a normal character', () => {
        const initialInputValue = '31/11/yyyy';
        const expectedInputValue = '31/1m/yyyy';
        const caretPosition = 5;
        const expectedCaretPosition = 4;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Backspace);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should remove the character two positions before the caret when the Backspace key is pressed and the previous character ' +
        'is a special character', () => {
        const initialInputValue = '31/11/yyyy';
        const expectedInputValue = '31/1m/yyyy';
        const caretPosition = 6;
        const expectedCaretPosition = 4;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Backspace);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should not change the input value when the Backspace key is pressed and the character before the caret is not filled', () => {
        const initialInputValue = '31/11/yyyy';
        const caretPosition = 7;
        const expectedCaretPosition = 6;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Backspace);

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should not change the input value when the Backspace key is pressed and the caret is in the first position of the input', () => {
        const initialInputValue = '31/11/yyyy';
        const caretPosition = 0;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Backspace);

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should remove the selected characters when the Delete key is pressed and the input has characters selected', () => {
        const initialInputValue = '31/1m/20yy';
        const expectedInputValue = '31/1m/yyyy';
        const selectionStart = 4;
        const selectionEnd = 10;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(selectionStart, selectionEnd);
        pressKey(KeyEnum.Delete);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(selectionStart);
        expect(getInput().selectionEnd).toBe(selectionStart);
    });

    it('should remove the character after the caret when the Delete key is pressed and the next character ' +
        'is a normal character', () => {
        const initialInputValue = '31/11/2021';
        const expectedInputValue = '31/11/202y';
        const caretPosition = 9;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Delete);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should remove the character two positions after the caret when the Delete key is pressed and the next character ' +
        'is a special character', () => {
        const initialInputValue = '31/11/2021';
        const expectedInputValue = '31/11/y021';
        const caretPosition = 5;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Delete);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should remove the character three positions after the caret when the Delete key is pressed and ' +
        'there are no characters filled in until that position', () => {
        const initialInputValue = '31/11/y021';
        const expectedInputValue = '31/11/yy21';
        const caretPosition = 5;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Delete);

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should not change the input value when the Delete key is pressed and there are no characters filled in after the caret', () => {
        const initialInputValue = '31/11/yyyy';
        const caretPosition = 6;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Delete);

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should write the pressed key to the input when it is a number and the mask accepts numbers', () => {
        const initialInputValue = 'dd/mm/yyyy';
        const expectedInputValue = '1d/mm/yyyy';
        const caretPosition = 0;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('1');

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
    });

    it('should write the pressed key to the input when it is a letter and the mask accepts letters', () => {
        const mask = 'aa.aaa';
        const expectedInputValue = 'aa.xaa';
        const caretPosition = 2;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = mask;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('x');

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
    });

    it('should write the pressed key to the input when it is letter and the mask is a any character', () => {
        const mask = '***';
        const initialInputValue = '!__';
        const expectedInputValue = '&__';
        const caretPosition = 0;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('&');

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
    });

    it('should not write the pressed key to the input when it is a number and the mask accepts letters', () => {
        const mask = 'aaa';
        const initialInputValue = 'xxx';
        const caretPosition = 1;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('1');

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
    });

    it('should not write the pressed key to the input when it is a ShiftKey and the mask accepts any character', () => {
        const mask = '***';
        const initialInputValue = 'x__';
        const caretPosition = 1;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey(KeyEnum.Shift);

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
    });

    it('should not write the pressed key to the input when the mask value in the caret position in invalid', () => {
        const mask = '?**';
        const initialInputValue = '';
        const caretPosition = 0;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('1');

        expect(getInput().value).toBe(initialInputValue);
        expect(comp.handleMaskValueChange).not.toHaveBeenCalled();
    });

    it('should move the caret to the next position when a key is pressed and the next mask position is a normal character', () => {
        const initialInputValue = 'dd/mm/yyyy';
        const caretPosition = 0;
        const expectedCaretPosition = 1;

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('1');

        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should move the caret two position after the current one when a key is pressed and the next character in the mask ' +
        'is a special character', () => {
        const initialInputValue = 'dd/mm/yyyy';
        const caretPosition = 1;
        const expectedCaretPosition = 3;

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('1');

        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should move the caret to the last position when a key is pressed and the next character in the mask is a special character and ' +
        'is the last one', () => {
        const mask = '+(999)';
        const caretPosition = 4;
        const expectedCaretPosition = 6;

        comp.mask = mask;
        comp.maskPlaceholder = mask;
        comp.value = mask;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('0');

        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should override the current selected character when a key valid key is pressed', () => {
        const initialInputValue = '31/11/yyyy';
        const expectedInputValue = '4d/m1/yyyy';
        const selectionStart = 0;
        const selectionEnd = 4;
        const expectedCaretPosition = 1;

        spyOn(comp, 'handleMaskValueChange');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(selectionStart, selectionEnd);
        pressKey('4');

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
        expect(getInput().selectionStart).toBe(expectedCaretPosition);
        expect(getInput().selectionEnd).toBe(expectedCaretPosition);
    });

    it('should paste the valid character from the clipboard data to the input', () => {
        const initialInputValue = 'dd/mm/yyyy';
        const clipboardData = '22-12--201';
        const expectedInputValue = '22/12/201y';
        const caretPosition = 0;

        spyOn(comp, 'handleMaskValueChange');
        spyOn(pasteEvent.clipboardData, 'getData').and.returnValue(clipboardData);
        spyOn(pasteEvent, 'preventDefault');

        comp.value = initialInputValue;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        getInput().dispatchEvent(pasteEvent);

        expect(pasteEvent.preventDefault).toHaveBeenCalled();
        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
    });

    it('should consider the maskSpecialCharacters when they are provided', () => {
        const caretPosition = 0;
        const expectedInputValue = '[49] aaa';
        const mask = '[99] aaa';
        const maskSpecialCharacters = ['[', ']', ' '];

        spyOn(comp, 'handleMaskValueChange');

        comp.value = mask;
        comp.mask = mask;
        comp.maskPlaceholder = mask;
        comp.maskSpecialCharacters = maskSpecialCharacters;
        fixture.detectChanges();
        getInput().dispatchEvent(focusEvent);

        getInput().setSelectionRange(caretPosition, caretPosition);
        pressKey('4');

        expect(getInput().value).toBe(expectedInputValue);
        expect(comp.handleMaskValueChange).toHaveBeenCalledWith(expectedInputValue);
    });

    it('should set the input value as empty when an invalid value is injected into the input', () => {
        const invalidValue = '313/12/1242';

        comp.value = invalidValue;
        fixture.detectChanges();

        expect(getInput().value).toBe('');
    });

    it('should not change the input value when an valid value is injected into the input', () => {
        const validValue = '31/12/1242';

        comp.value = validValue;
        fixture.detectChanges();

        expect(getInput().value).toBe(validValue);
    });

    it('should reprocess the input value when the input is changed through the onInput event and the input is empty', () => {
        const onInputValue = ' 3112dd/mm/yyyy';
        const expectedResult = '31/12/yyyy';
        const caretPosition = 6;

        getInput().dispatchEvent(focusEvent);
        getInput().value = onInputValue;
        fixture.detectChanges();

        getInput().dispatchEvent(inputEvent);

        expect(getInput().value).toBe(expectedResult);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should reprocess the input value when the input is changed through the onInput event and the ' +
        'input has already some filled characters', () => {
        const initialInputValue = '31/mm/yyyy';
        const initialCaretPosition = 3;
        const onInputValue = '31/1220/mm/yyyy';
        const expectedResult = '31/12/20yy';
        const caretPosition = 8;

        comp.value = initialInputValue;
        fixture.detectChanges();

        getInput().dispatchEvent(focusEvent);
        getInput().value = onInputValue;
        fixture.detectChanges();

        getInput().setSelectionRange(initialCaretPosition, initialCaretPosition);
        getInput().dispatchEvent(inputEvent);

        expect(getInput().value).toBe(expectedResult);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });

    it('should set the input value as empty when the input is changed through the onInput event and an invalid value is filled', () => {
        const onInputValue = 'xxxdd/mm/yyyy';
        const expectedResult = dateMaskPlaceholder;
        const caretPosition = 0;

        getInput().dispatchEvent(focusEvent);
        getInput().value = onInputValue;
        fixture.detectChanges();

        getInput().dispatchEvent(inputEvent);

        expect(getInput().value).toBe(expectedResult);
        expect(getInput().selectionStart).toBe(caretPosition);
        expect(getInput().selectionEnd).toBe(caretPosition);
    });
});
