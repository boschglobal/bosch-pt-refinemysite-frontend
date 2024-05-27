/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {BlobService} from '../../../rest/services/blob.service';
import {TranslationModule} from '../../../translation/translation.module';
import {BackgroundImageDirective} from '../../directives/background-image.directive';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID,
    DEFAULT_DEBOUNCE_TIME
} from '../input.base';
import {
    CSS_CLASS_SIZE_SMALL,
    CSS_CLASS_TEXTAREA_COLLAPSED,
    CSS_CLASS_TEXTAREA_NO_USER,
    CSS_CLASS_TEXTAREA_SCROLLABLE,
    InputTextareaUserComponent,
    TEXTAREA_USER_DEFAULT_MAX_HEIGHT
} from './input-textarea-user.component';
import {
    INPUT_TEXTAREA_USER_DEFAULT_STATE,
    InputTextareaUserTestComponent
} from './input-textarea-user.test.component';

describe('Input Textarea User Component', () => {
    let testHostComp: InputTextareaUserTestComponent;
    let comp: InputTextareaUserComponent;
    let fixture: ComponentFixture<InputTextareaUserTestComponent>;
    let de: DebugElement;

    const defaultState: any = Object.assign({}, INPUT_TEXTAREA_USER_DEFAULT_STATE);
    const dataAutomation: string = INPUT_TEXTAREA_USER_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_TEXTAREA_USER_DEFAULT_STATE.controlName;
    const inputTextareaComponentSelector = 'ss-input-textarea-user';
    const dataAutomationInputTextareaSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputMirrorSelector = `[data-automation="${dataAutomation}-mirror"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputUserPictureSelector = `[data-automation="${dataAutomation}-user-picture"]`;
    const dataAutomationInputCharacterSelector = `[data-automation="${dataAutomation}-character-counter"]`;
    const inputEvent: Event = new Event('input');
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');
    const keyupEvent: Event = new Event('keyup');
    const resizeEvent: Event = new Event('resize');

    const testDataEmptyString = '';
    const testDataShortString = 'foo';
    const testDataUntrimmedString = ' a ';
    const testDataErrorMessageKey = 'Generic_Error';
    const testDataOffset = 20;
    const testDataUser: ResourceReferenceWithPicture = {
        id: '123',
        displayName: 'Foo Bar',
        picture: 'https://123',
    };

    const getInputElement = () => de.query(By.css(dataAutomationInputTextareaSelector)).nativeElement;

    const getInputValue = () => getInputElement().value;

    const getInputMirrorElement = () => de.query(By.css(dataAutomationInputMirrorSelector)).nativeElement;

    const getInputWrapperElement = () => de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;

    const getInputUserAvatarDebugElement = () => de.query(By.css(dataAutomationInputUserPictureSelector));

    const getInputCharacterCounterDebugElement = () => de.query(By.css(dataAutomationInputCharacterSelector));

    const setInputMirrorScrollHeight = (height: number) => {
        Object.defineProperty(getInputMirrorElement(), 'scrollHeight', {
            get: () => height,
            configurable: true,
        });
    };

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.textareaUser[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule.withConfig({callSetDisabledState: 'whenDisabledForLegacyCode'}),
            TranslationModule,
        ],
        declarations: [
            BackgroundImageDirective,
            InputTextareaUserComponent,
            InputTextareaUserTestComponent,
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceMock,
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputTextareaUserTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputTextareaComponentSelector));
        comp = de.componentInstance;
        testHostComp.defaultInputState.textareaUser = defaultState;
        testHostComp.setForm();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
    });

    it('should display default value on the input', waitForAsync(() => {
        const expectedValue = testDataShortString;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    }));

    it('should display Angular Forms injected value on the input', waitForAsync(() => {
        const expectedValue = testDataShortString;

        testHostComp.formGroup.get(controlName).setValue(expectedValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    }));

    it('should display user typed value on the input', waitForAsync(() => {
        const expectedValue = testDataShortString;

        comp.value = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(inputEvent);
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    }));

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataShortString);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should render focus CSS class when input is focused', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should render blur CSS class when input is blurred', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should render filled CSS class when input has content', () => {
        setDefaultInputStateProperty('value', testDataShortString);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILLED);
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        setDefaultInputStateProperty('isDisabled', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render disabled CSS class when isDisabled property is injected by Angular Forms', () => {
        testHostComp.formGroup.get(controlName).disable();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render no user CSS class when there is no user', () => {
        const userUndefined: string = null;

        setDefaultInputStateProperty('user', userUndefined);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_TEXTAREA_NO_USER);
    });

    it('should render collapsed CSS class when isCollapsed property is passed in', () => {
        setDefaultInputStateProperty('isCollapsed', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_TEXTAREA_COLLAPSED);
    });

    it('should render user picture when user is passed in', () => {
        setDefaultInputStateProperty('user', testDataUser);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputUserAvatarDebugElement()).not.toBeNull();
    });

    it('should not render user picture when user is not passed in', () => {
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputUserAvatarDebugElement()).not.toBeNull();
    });

    it('should render required CSS class when isRequired property is passed in', () => {
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_REQUIRED);
    });

    it('should render invalid CSS class when input is invalid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataEmptyString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        tick(DEFAULT_DEBOUNCE_TIME);
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
    }));

    it('should render valid CSS class when input is valid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        tick(DEFAULT_DEBOUNCE_TIME);
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
    }));

    it('should have vertical scroll when it has large value and autosize is disabled', () => {
        setDefaultInputStateProperty('isAutosize', false);
        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT + testDataOffset);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputElement().classList).toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
    });

    it('should not have scroll when the value does not surpass the max height of the textarea and autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT - testDataOffset);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
    });

    it('should not have scroll when it has large value and scroll is disabled', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setDefaultInputStateProperty('isScrollable', false);
        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT + testDataOffset);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
    });

    it('should recalculate the height after keyup on the input when autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT + testDataOffset);
        testHostComp.setForm();
        fixture.detectChanges();

        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT - testDataOffset);
        getInputElement().dispatchEvent(keyupEvent);
        fixture.detectChanges();
        expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
    });

    it('should recalculate the height after window resize when autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT + testDataOffset);
        testHostComp.setForm();
        fixture.detectChanges();

        setInputMirrorScrollHeight(TEXTAREA_USER_DEFAULT_MAX_HEIGHT - testDataOffset);
        window.dispatchEvent(resizeEvent);
        fixture.detectChanges();
        expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
    });

    it('should set the input height as the textareaMinHeight when isCollapsed is false', () => {
        const textareaMinHeight = 120;

        setDefaultInputStateProperty('textareaMinHeight', textareaMinHeight);
        fixture.detectChanges();
        setDefaultInputStateProperty('isCollapsed', false);
        fixture.detectChanges();

        expect(getComputedStyle(getInputElement()).height).toBe(`${textareaMinHeight}px`);
    });

    it('should not set the input height as the textareaMinHeight when isCollapsed is true', () => {
        const textareaMinHeight = 120;

        setDefaultInputStateProperty('textareaMinHeight', textareaMinHeight);
        fixture.detectChanges();
        setDefaultInputStateProperty('isCollapsed', true);
        fixture.detectChanges();

        expect(getComputedStyle(getInputElement()).height).not.toBe(`${textareaMinHeight}px`);
    });

    it('should remove left and right white spaces from value', fakeAsync(() => {
        const expectedValue = testDataUntrimmedString.trim();

        spyOn(comp, 'onChangeCallback');
        spyOn(comp.onChange, 'emit');

        comp.value = testDataUntrimmedString;
        comp.onInputChange();
        tick(DEFAULT_DEBOUNCE_TIME);

        expect(comp.onChangeCallback).toHaveBeenCalledWith(expectedValue);
        expect(comp.onChange.emit).toHaveBeenCalledWith(expectedValue);
    }));

    it('should render the right character counter', () => {
        const maxCharacter = 100;
        const expectedValue = `${testDataShortString.length}/${maxCharacter}`;

        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('maxCharacter', maxCharacter);
        setDefaultInputStateProperty('showCounter', true);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputCharacterCounterDebugElement().nativeElement.textContent).toContain(expectedValue);
    });

    it('should not render the right character counter', () => {
        const maxCharacter = 100;

        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('maxCharacter', maxCharacter);
        setDefaultInputStateProperty('showCounter', false);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputCharacterCounterDebugElement()).toBeNull();
    });

    it('should add the --small modifier class when size is set to small', () => {
        setDefaultInputStateProperty('size', 'small');
        fixture.detectChanges();

        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_SIZE_SMALL);
    });

    it('should focus input when setFocus is called', fakeAsync(() => {
        spyOn(getInputElement(), 'focus').and.callThrough();

        comp.setFocus();
        tick(DEFAULT_DEBOUNCE_TIME);

        expect(getInputElement().focus).toHaveBeenCalled();
    }));
});
