/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {configuration} from '../../../../../configurations/configuration';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {TranslationModule} from '../../../translation/translation.module';
import {LoaderComponent} from '../../loader/loader.component';
import {CSS_CLASS_DISABLED} from '../input.base';
import {
    CSS_CLASS_FILES_FILLED,
    CSS_CLASS_FILES_FOCUSED,
    CSS_CLASS_FILES_MULTIPLE,
    CSS_CLASS_FILES_PREVIEW_INVALID,
    CSS_CLASS_LABEL_ACTIVE,
    InputFilesComponent
} from './input-files.component';
import {
    INPUT_FILES_DEFAULT_STATE,
    InputFilesTestComponent
} from './input-files.test.component';

describe('Input Files Component', () => {
    let testHostComp: InputFilesTestComponent;
    let comp: InputFilesComponent;
    let fixture: ComponentFixture<InputFilesTestComponent>;
    let de: DebugElement;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const dataAutomation: string = INPUT_FILES_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_FILES_DEFAULT_STATE.controlName;

    const inputPictureComponentSelector = 'ss-input-files';
    const dataAutomationInputFilesSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputFilesLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationSecondaryLabelSelector = `[data-automation="${dataAutomation}-secondary-label"]`;
    const dataAutomationDeleteSingleSelector = `[data-automation="${dataAutomation}-delete-single"]`;
    const dataAutomationInputSinglePlaceholderSelector = `[data-automation="${dataAutomation}-placeholder-single"]`;
    const dataAutomationInputMultiplePlaceholderSelector = `[data-automation="${dataAutomation}-placeholder-multiple"]`;
    const dataAutomationInputPreviewSelector = (index: number): string => `[data-automation="${dataAutomation}-preview-${index}"]`;
    const dataAutomationDeletePreviewSelector = (index: number): string => `[data-automation="${dataAutomation}-preview-delete-${index}"]`;

    const createFile = (size = 12345, name = 'test.jpg', type = 'image/jpg'): File =>
        new File([new ArrayBuffer(size)], name, {
            type,
        });
    const createFileList = (file: File): FileList => ({
        0: file,
        length: 1,
        item: () => file,
    });
    const testDataNoFiles = null;
    const testDataValidFiles: FileList = createFileList(createFile());
    const testDataInvalidFiles: FileList = createFileList(createFile(9999999, 'test.png', 'image/png'));

    const clickEvent: Event = new Event('click');
    const dragEnterEvent: Event = new Event('dragenter');
    const dragLeaveEvent: Event = new Event('dragleave');
    const dragOverEvent: Event = new Event('dragover');
    const dropEventValidFiles = (): Event => {
        const customEvent = new CustomEvent('CustomEvent');
        customEvent.initCustomEvent('drop', true, true, null);
        customEvent['dataTransfer'] = {
            files: testDataValidFiles,
        };
        return customEvent;
    };
    const dropEventInvalidFiles = (): Event => {
        const customEvent = new CustomEvent('CustomEvent');
        customEvent.initCustomEvent('drop', true, true, null);
        customEvent['dataTransfer'] = {
            files: testDataInvalidFiles,
        };
        return customEvent;
    };
    const dropEventNoFiles = (): Event => {
        const customEvent = new CustomEvent('CustomEvent');
        customEvent.initCustomEvent('drop', true, true, null);
        customEvent['dataTransfer'] = {
            files: [],
        };
        return customEvent;
    };
    const inputEvent: Event = new Event('input');

    const getInputFilesValue = () => comp.value;
    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;
    const getInputElement = () => getElement(dataAutomationInputFilesSelector);
    const getInputLabelElement = () => getElement(dataAutomationInputFilesLabelSelector);
    const getInputWrapperElement = () => getElement(dataAutomationInputWrapperSelector);
    const getInputPreviewElement = (index: number) => getElement(dataAutomationInputPreviewSelector(index));
    const getDeleteElement = (index: number) => getElement(dataAutomationDeletePreviewSelector(index));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule.withConfig({callSetDisabledState: 'whenDisabledForLegacyCode'}),
            TranslationModule,
        ],
        declarations: [
            InputFilesComponent,
            InputFilesTestComponent,
            LoaderComponent,
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
        fixture = TestBed.createComponent(InputFilesTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputPictureComponentSelector));
        comp = de.componentInstance;

        when(attachmentHelper.convertBytesToMb(MOCK_FILE_SIZE_BYTES)).thenReturn(MOCK_FILE_SIZE_MEGABYTES);
        when(attachmentHelper.normalizeFilename(testDataValidFiles[0])).thenReturn(testDataValidFiles[0]);
        when(attachmentHelper.normalizeFilename(testDataInvalidFiles[0])).thenReturn(testDataInvalidFiles[0]);

        testHostComp.defaultInputState.files = INPUT_FILES_DEFAULT_STATE;
        testHostComp.setForm();
        fixture.detectChanges();
    });

    it('should set default value on the input', () => {
        const expectedValue = testDataNoFiles;

        testHostComp.defaultInputState.files.value = expectedValue;
        testHostComp.setForm();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(getInputFilesValue()).toBe(expectedValue);
        });
    });

    it('should display Angular Forms injected value on the input', () => {
        testHostComp.formGroup.get(controlName).setValue(testDataNoFiles);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(getInputFilesValue()).toBeNull();
        });
    });

    it('should display user inserted file on the input', () => {
        const expectedValue: FileList = testDataValidFiles;

        comp.value = testDataValidFiles;
        getInputElement().dispatchEvent(inputEvent);
        expect(getInputFilesValue()).toBe(expectedValue);
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue: null = testDataNoFiles;

        testHostComp.defaultInputState.files.value = testDataNoFiles;
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputFilesValue()).toBe(expectedValue);
        });
    });

    it('should render focus CSS class when input drag enter', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILES_FOCUSED);
    });

    it('should clean focus CSS class when input drag leave', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dragLeaveEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FILES_FOCUSED);
        });
    });

    it('should clean focus CSS class when input drop with files', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FILES_FOCUSED);
        });
    });

    it('should clean focus CSS class when input drop with no files', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventNoFiles());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FILES_FOCUSED);
        });
    });

    it('should render filled CSS class when input has content', () => {
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILES_FILLED);
        });
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        testHostComp.defaultInputState.files.isDisabled = true;
        fixture.detectChanges();

        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render multiple CSS class when multiple property is passed in', () => {
        testHostComp.defaultInputState.files.multiple = true;
        fixture.detectChanges();

        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILES_MULTIPLE);
    });

    it('should render small CSS class when small size is passed in', () => {
        const expectedClass = 'ss-input-files--small';

        testHostComp.defaultInputState.files.size = 'small';
        fixture.detectChanges();

        expect(getInputWrapperElement().classList).toContain(expectedClass);
    });

    it('should render normal CSS class when normal size is passed in', () => {
        const expectedClass = 'ss-input-files--normal';

        testHostComp.defaultInputState.files.size = 'normal';
        fixture.detectChanges();

        expect(getInputWrapperElement().classList).toContain(expectedClass);
    });

    it('should render disabled CSS class when isDisabled property is injected by Angular Forms', () => {
        testHostComp.formGroup.get(controlName).disable();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
        });
    });

    it('should render invalid CSS class on invalid file preview when file is invalid', () => {
        const preview = 0;

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputPreviewElement(preview).classList).toContain(CSS_CLASS_FILES_PREVIEW_INVALID);
        });
    });

    it('should trigger deletePicture when delete is clicked', waitForAsync(() => {
        const preview = 0;

        spyOn(comp, 'deletePicture').and.callThrough();
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();
        getDeleteElement(preview).dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.deletePicture).toHaveBeenCalled();
    }));

    it('should trigger openFinder with MouseEvent', () => {
        const evt = new MouseEvent('click', {bubbles: false, cancelable: false});

        spyOn(comp.inputFiles.nativeElement, 'dispatchEvent');
        comp.openFinder();

        expect(comp.inputFiles.nativeElement.dispatchEvent).toHaveBeenCalledWith(evt);
    });

    it('should open the finder when clicking in the label', () => {
        spyOn(comp, 'openFinder');

        getInputLabelElement().dispatchEvent(clickEvent);

        expect(comp.openFinder).toHaveBeenCalled();
    });

    it('should stop the event propagation when clicking in a file preview', () => {
        spyOn(clickEvent, 'stopPropagation').and.callThrough();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();
        getInputPreviewElement(0).dispatchEvent(clickEvent);

        expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should stop the event propagation when clicking in the delete preview', () => {
        spyOn(clickEvent, 'stopPropagation').and.callThrough();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();
        getDeleteElement(0).dispatchEvent(clickEvent);

        expect(clickEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should render the multiple placeholder when multiple is true', () => {
        testHostComp.defaultInputState.files.multiple = true;
        fixture.detectChanges();

        expect(getElement(dataAutomationInputMultiplePlaceholderSelector)).toBeTruthy();
        expect(getElement(dataAutomationInputSinglePlaceholderSelector)).toBeFalsy();
    });

    it('should render the single placeholder when multiple is false', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationInputMultiplePlaceholderSelector)).toBeFalsy();
        expect(getElement(dataAutomationInputSinglePlaceholderSelector)).toBeTruthy();
    });

    it('should show the secondary label when in single mode and no file was uploaded yet', () => {
        const expectedValue = testHostComp.defaultInputState.files.secondaryLabel;

        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationSecondaryLabelSelector).innerText.trim()).toBe(expectedValue);

    });

    it('should show the file name when in single mode and a file was already uploaded', () => {
        const expectedValue = testDataValidFiles.item(0).name;

        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        expect(getElement(dataAutomationSecondaryLabelSelector).innerText.trim()).toBe(expectedValue);
    });

    it('should normalize the input files name', () => {
        const normalizedFile = new File([''], 'foobar');

        when(attachmentHelper.normalizeFilename(testDataValidFiles[0])).thenReturn(normalizedFile);

        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(getElement(dataAutomationSecondaryLabelSelector).innerText.trim()).toBe('foobar');
        });
    });

    it('should show the button to delete the file when in single mode and a file was already uploaded', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        expect(getElement(dataAutomationDeleteSingleSelector)).toBeTruthy();
    });

    it('should not show the button to delete the file when in single mode and no file was uploaded yet', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationDeleteSingleSelector)).toBeFalsy();
    });

    it('should trigger deletePicture when in single mode and delete is clicked', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        spyOn(comp, 'deletePicture').and.callThrough();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        getElement(dataAutomationDeleteSingleSelector).dispatchEvent(clickEvent);

        expect(comp.deletePicture).toHaveBeenCalled();
    });

    it('should not read the files when in single mode', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        expect(comp.files.every(file => !file.preview.loading)).toBeTruthy();
    });

    it('should read the files when in multiple mode', () => {
        testHostComp.defaultInputState.files.multiple = true;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventValidFiles());
        fixture.detectChanges();

        expect(comp.files.every(file => !!file.preview.loading)).toBeTruthy();
    });

    it('should show the file previews when in multiple mode', () => {
        testHostComp.defaultInputState.files.multiple = true;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        fixture.detectChanges();

        expect(getInputPreviewElement(0)).toBeTruthy();
    });

    it('should not show the file previews when in single mode', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        fixture.detectChanges();

        expect(getInputPreviewElement(0)).toBeFalsy();
    });

    it('should display the correct messages in case of single file error', () => {
        testHostComp.defaultInputState.files.multiple = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        fixture.detectChanges();

        expect(comp.getErrorMessageKey()).toEqual('Generic_InvalidFile');
    });

    it('should display the correct messages in case of multiple file errors', () => {
        testHostComp.defaultInputState.files.multiple = true;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        getInputLabelElement().dispatchEvent(dragEnterEvent);
        getInputLabelElement().dispatchEvent(dropEventInvalidFiles());
        fixture.detectChanges();

        expect(comp.getErrorMessageKey()).toEqual('Generic_InvalidFiles');
    });

    it('should disable browsers default behaviour when dragging a file over the input', () => {
        spyOn(comp, 'handleDragOver').and.callThrough();
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragOverEvent);

        expect(comp.handleDragOver).toHaveBeenCalled();
        expect(comp.handleDragOver()).toBe(false);
    });

    it('should apply the modifier class to apply cursor pointer to the control when canAddFiles is true', () => {
        testHostComp.defaultInputState.files.canAddFiles = true;
        fixture.detectChanges();

        expect(getInputLabelElement().classList).toContain(CSS_CLASS_LABEL_ACTIVE);
    });

    it('should not apply the modifier class to apply cursor pointer to the control when canAddFiles is false', () => {
        testHostComp.defaultInputState.files.canAddFiles = false;
        fixture.detectChanges();

        expect(getInputLabelElement().classList).not.toContain(CSS_CLASS_LABEL_ACTIVE);
    });

    it('should call openFinder on click on the label when canAddFiles is true', () => {
        spyOn(comp, 'openFinder');
        testHostComp.defaultInputState.files.canAddFiles = true;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(clickEvent);

        expect(comp.openFinder).toHaveBeenCalled();
    });

    it('should not call openFinder on click on the label when canAddFiles is set to false', () => {
        testHostComp.defaultInputState.files.canAddFiles = false;
        spyOn(comp, 'openFinder');
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(clickEvent);

        expect(comp.openFinder).not.toHaveBeenCalled();
    });

    it('should not call handleInputChange on drop file on the label when canAddFiles is set to false', () => {
        testHostComp.defaultInputState.files.canAddFiles = false;
        spyOn(comp, 'handleInputChange');
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dropEventValidFiles());

        expect(comp.handleInputChange).not.toHaveBeenCalled();
    });

    it('should not apply focus on the DragEnter event when canAddFiles is set to false', () => {
        comp.isFocused = false;
        testHostComp.defaultInputState.files.canAddFiles = false;
        fixture.detectChanges();

        getInputLabelElement().dispatchEvent(dragEnterEvent);

        expect(comp.isFocused).toBe(false);
    });

    it('should set the Error Message Params to MaxFileSize in megabytes', () => {
        const errorMessageParams: Object = comp.getErrorMessageParams();
        const maxFileSizeInMb = Object.getOwnPropertyDescriptor(errorMessageParams, 'maxFileSizeInMb')?.value;
        expect(maxFileSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
    });
});
