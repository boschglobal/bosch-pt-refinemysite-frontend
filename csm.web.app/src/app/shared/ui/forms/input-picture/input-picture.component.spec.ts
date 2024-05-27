/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {TranslationModule} from '../../../translation/translation.module';
import {CSS_CLASS_DISABLED} from '../input.base';
import {
    CSS_CLASS_PICTURE_FILLED,
    CSS_CLASS_PICTURE_FOCUSED,
    CSS_CLASS_PICTURE_INVALID,
    InputPictureComponent
} from './input-picture.component';
import {
    INPUT_PICTURE_DEFAULT_STATE,
    InputPictureTestComponent
} from './input-picture.test.component';

describe('Input Picture Component', () => {
    let testHostComp: InputPictureTestComponent;
    let comp: InputPictureComponent;
    let fixture: ComponentFixture<InputPictureTestComponent>;
    let de: DebugElement;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);

    const dataAutomation: string = INPUT_PICTURE_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_PICTURE_DEFAULT_STATE.controlName;

    const inputPictureComponentSelector = 'ss-input-picture';
    const dataAutomationInputPictureSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputDeleteSelector = `[data-automation="${dataAutomation}-delete"]`;

    const testDataNoPicture = null;
    const testDataPicture: File = new File([''], 'filename');
    const testDataDefaultPicture = '/resources/images/project/default.png';
    const testDataErrorMessageKey = 'Generic_Error';
    const testDataInvalidFile: File = new File([new ArrayBuffer(9999999)], 'test.png', {
        type: 'image/png',
    });

    const clickEvent: Event = new Event('click');
    const dragEnterEvent: Event = new Event('dragenter');
    const dragLeaveEvent: Event = new Event('dragleave');
    const dragOverEvent: Event = new Event('dragover');
    const changeEvent: Event = new Event('change');

    Object.defineProperty(changeEvent, 'target', {
        get: () => ({files: [testDataPicture]}),
        configurable: true,
    });

    const dropEventFile = () => {
        const event = new CustomEvent('CustomEvent');
        event.initCustomEvent('drop', true, true, null);
        event['dataTransfer'] = {
            files: [testDataPicture],
        };
        return event;
    };
    const dropEventNoFile = () => {
        const event = new CustomEvent('CustomEvent');
        event.initCustomEvent('drop', true, true, null);
        event['dataTransfer'] = {
            files: [],
        };
        return event;
    };
    const inputEvent: Event = new Event('input');

    const getInputImageSrc = () => comp.displayPicture;

    const getInputElement = () => de.query(By.css(dataAutomationInputPictureSelector)).nativeElement;

    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;

    const getDeleteElement = () => de.query(By.css(dataAutomationInputDeleteSelector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            InputPictureComponent,
            InputPictureTestComponent,
        ],
        providers: [
            {
                provide: AttachmentHelper,
                useFactory: () => instance(attachmentHelper),
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
        fixture = TestBed.createComponent(InputPictureTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputPictureComponentSelector));
        comp = de.componentInstance;

        testHostComp.defaultInputState.picture = INPUT_PICTURE_DEFAULT_STATE;
        testHostComp.setForm();

        when(attachmentHelper.normalizeFilename(testDataPicture)).thenReturn(testDataPicture);

        fixture.detectChanges();
    });

    it('should display default picture on the input', () => {
        const expectedValue = testDataNoPicture;

        testHostComp.defaultInputState.picture.value = expectedValue;
        testHostComp.setForm();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(getInputImageSrc()).toBe(expectedValue);
        });
    });

    it('should display Angular Forms injected value on the input', () => {
        testHostComp.formGroup.get(controlName).setValue(testDataPicture);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputImageSrc()).toBeNull();
        });
    });

    it('should display user inserted picture on the input', () => {
        const expectedValue = testDataDefaultPicture;

        comp.displayPicture = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(inputEvent);
        fixture.whenStable().then(() => {
            expect(getInputImageSrc()).toBe(expectedValue);
        });
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataNoPicture;

        testHostComp.defaultInputState.picture.value = testDataNoPicture;
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputImageSrc()).toBe(expectedValue);
        });
    });

    it('should render focus CSS class when input drag enter', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).toContain(CSS_CLASS_PICTURE_FOCUSED);
        });
    });

    it('should clean focus CSS class when input drag leave', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dragLeaveEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).not.toContain(CSS_CLASS_PICTURE_FOCUSED);
        });
    });

    it('should normalize filename after receiving a dropped file', () => {
        const normalizedFile = new File([''], 'filename123');
        when(attachmentHelper.normalizeFilename(testDataPicture)).thenReturn(normalizedFile);

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventFile());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(comp.value).toEqual(normalizedFile);
        });
    });

    it('should normalize filename after receiving a file from finder', () => {
        const normalizedFile = new File([''], 'filename123');
        when(attachmentHelper.normalizeFilename(testDataPicture)).thenReturn(normalizedFile);

        getInputElement().dispatchEvent(changeEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(comp.value).toEqual(normalizedFile);
        });
    });

    it('should clean focus CSS class when input drop with file', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventFile());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).not.toContain(CSS_CLASS_PICTURE_FOCUSED);
        });
    });

    it('should clean focus CSS class when input drop with no file', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventNoFile());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).not.toContain(CSS_CLASS_PICTURE_FOCUSED);
        });
    });

    it('should render filled CSS class when input has content', () => {
        comp.isFilled = true;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).toContain(CSS_CLASS_PICTURE_FILLED);
        });
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        comp.isDisabled = true;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).toContain(CSS_CLASS_DISABLED);
        });
    });

    it('should render disabled CSS class when isDisabled property is injected by Angular Forms', () => {
        testHostComp.formGroup.get(controlName).disable();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().classList).toContain(CSS_CLASS_DISABLED);
        });
    });

    it('should render invalid CSS class when input is invalid', () => {
        testHostComp.defaultInputState.picture.value = testDataInvalidFile;
        testHostComp.defaultInputState.picture.isRequired = true;
        testHostComp.defaultInputState.picture.validators = [
            GenericValidators.isValidExtensionFile(testHostComp.defaultInputState.picture.acceptedPattern, testDataErrorMessageKey),
        ];
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        fixture.detectChanges();
        expect(getInputLabelElement().classList).toContain(CSS_CLASS_PICTURE_INVALID);
    });

    it('should trigger handleDeletePicture when icon is clicked', () => {
        spyOn(comp, 'handleDeletePicture').and.callThrough();
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventFile());
        fixture.detectChanges();
        getDeleteElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.handleDeletePicture).toHaveBeenCalled();
    });

    it('should disable browsers default behaviour when dragging a file over the input', () => {
        spyOn(comp, 'handleDragOver').and.callThrough();
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragOverEvent);

        expect(comp.handleDragOver).toHaveBeenCalled();
        expect(comp.handleDragOver()).toBe(false);
    });
});
