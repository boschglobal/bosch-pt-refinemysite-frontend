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
import {By} from '@angular/platform-browser';

import {setEventKey} from '../../../../../../test/helpers';
import {KeyEnum} from '../../../../misc/enums/key.enum';
import {ModalComponent} from './modal.component';
import {ModalTestComponent} from './modal.test.component';

describe('Modal Component', () => {
    let testHostComp: ModalTestComponent;
    let fixture: ComponentFixture<ModalTestComponent>;
    let comp: ModalComponent;
    let de: DebugElement;

    const modalComponentSelector = 'ss-modal';
    const dataAutomationModalSelector = '[data-automation="modal"]';
    const dataAutomationModalWrapperSelector = '[data-automation="modal-wrapper"]';
    const dataAutomationModalContentSelector = '[data-automation="modal-content"]';
    const dataAutomationModalTitleSelector = '[data-automation="modal-title"]';
    const dataAutomationModalCloseSelector = '[data-automation="modal-close"]';

    const testDataTitle = 'Foo';

    const clickEvent: Event = new Event('click');
    const mouseDownEvent = new MouseEvent('mousedown', {bubbles: true});
    const keyupEvent: KeyboardEvent = new KeyboardEvent('keyup');

    const getDebugElement = (selector: string) => de.query(By.css(selector));

    const getElement = (selector: string) => getDebugElement(selector).nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            ModalComponent,
            ModalTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalTestComponent);
        testHostComp = fixture.componentInstance;

        testHostComp.closeable = true;
        testHostComp.isOpened = true;
        testHostComp.title = 'Modal title';
        testHostComp.id = 'modal-test';
        testHostComp.size = 'small';

        de = fixture.debugElement.query(By.css(modalComponentSelector));
        comp = de.componentInstance;

        fixture.detectChanges();
    });

    it('should show cross when closeable is TRUE', () => {
        testHostComp.closeable = true;
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalCloseSelector)).toBeTruthy();
    });

    it('should not show cross when closeable is FALSE', () => {
        testHostComp.closeable = false;
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalCloseSelector)).toBeNull();
    });

    it('should call handleClose when cross is clicked', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        getElement(dataAutomationModalCloseSelector).dispatchEvent(clickEvent);
        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should call handleClose when modal is clicked outside content', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        getElement(dataAutomationModalWrapperSelector).dispatchEvent(mouseDownEvent);

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should not call handleClose when modal is clicked inside content', () => {
        spyOn(comp, 'handleClose').and.callThrough();
        getElement(dataAutomationModalContentSelector).dispatchEvent(mouseDownEvent);

        expect(comp.handleClose).not.toHaveBeenCalled();
    });

    it('should call handleClose when ESQ key is pressed', () => {
        spyOn(comp, 'handleClose').and.callThrough();

        testHostComp.isOpened = true;
        setEventKey(keyupEvent, KeyEnum.Escape);
        window.dispatchEvent(keyupEvent);

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should not call handleClose when modal is clicked outside content and closeable is FALSE', () => {
        spyOn(comp, 'handleClose').and.callThrough();

        testHostComp.isOpened = true;
        testHostComp.closeable = false;

        fixture.detectChanges();

        getElement(dataAutomationModalWrapperSelector).dispatchEvent(mouseDownEvent);

        expect(comp.handleClose).not.toHaveBeenCalled();
    });

    it('should not call handleClose when ESQ key is pressed and closeable is FALSE', () => {
        spyOn(comp, 'handleClose').and.callThrough();

        testHostComp.isOpened = true;
        testHostComp.closeable = false;

        fixture.detectChanges();

        setEventKey(keyupEvent, KeyEnum.Escape);
        window.dispatchEvent(keyupEvent);

        expect(comp.handleClose).not.toHaveBeenCalled();
    });

    it('should not call handleClose when a key other than ESQ key is pressed', () => {
        spyOn(comp, 'handleClose').and.callThrough();

        testHostComp.isOpened = true;
        setEventKey(keyupEvent, KeyEnum.Tab);
        window.dispatchEvent(keyupEvent);

        expect(comp.handleClose).not.toHaveBeenCalled();
    });

    it('should emit when handleClose is called', () => {
        spyOn(comp.close, 'emit').and.callThrough();
        comp.handleClose();
        expect(comp.close.emit).toHaveBeenCalled();
    });

    it('should render title on header', () => {
        testHostComp.title = testDataTitle;
        fixture.detectChanges();
        expect(getElement(dataAutomationModalTitleSelector).textContent).toContain(testDataTitle);
    });

    it('should not render modal header header', () => {
        testHostComp.title = null;
        fixture.detectChanges();
        expect(getDebugElement(dataAutomationModalTitleSelector)).toBeFalsy();
    });

    it('should not render modal when isOpened is falsy', () => {
        testHostComp.isOpened = false;
        fixture.detectChanges();
        expect(getDebugElement(dataAutomationModalWrapperSelector)).toBeFalsy();
    });

    it('should render modal when isOpened is truthy', () => {
        testHostComp.isOpened = true;
        fixture.detectChanges();
        expect(getDebugElement(dataAutomationModalWrapperSelector)).toBeTruthy();
    });

    it('should retrieve the current modal data', () => {
        comp.ngOnInit();

        expect(comp.modal.data).toEqual(null);
    });

    it('should add MODAL_WITHOUT_FOOTER_CSS_CLASS when modal has not footer', () => {
        comp.footer = null;
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--without-footer');
    });

    it('should add "ss-modal--without-header" when modal has no title', () => {
        testHostComp.title = null;
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--without-header');
    });

    it('should not add "ss-modal--without-header" when modal has title', () => {
        testHostComp.title = 'Modal Title';
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).not.toContain('ss-modal--without-header');
    });

    it('should add MODAL_SIZE_LARGE_CSS_CLASS when modal has large size', () => {
        testHostComp.size = 'large';
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--large');
    });

    it('should add MODAL_SIZE_MEDIUM_CSS_CLASS when modal has large size', () => {
        testHostComp.size = 'medium';
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--medium');
    });

    it('should add MODAL_SIZE_SMALL_CSS_CLASS when modal has large size', () => {
        testHostComp.size = 'small';
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--small');
    });

    it('should add MODAL_SIZE_DIALOG_CSS_CLASS when modal has large size', () => {
        testHostComp.size = 'dialog';
        fixture.detectChanges();

        expect(getDebugElement(dataAutomationModalSelector).nativeElement.classList).toContain('ss-modal--dialog');
    });
});
