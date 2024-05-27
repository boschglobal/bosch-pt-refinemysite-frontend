/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {KeyEnum} from '../../misc/enums/key.enum';
import {TranslationModule} from '../../translation/translation.module';
import {IconModule} from '../icons/icon.module';
import {
    MultipleSelectionToolbarConfirmationComponent,
    MultipleSelectionToolbarConfirmationModeEnum
} from './multiple-selection-toolbar-confirmation.component';
import {MultipleSelectionToolbarConfirmationTestComponent} from './multiple-selection-toolbar-confirmation.test.component';

describe('Multiple Selection Toolbar Confirmation', () => {
    let component: MultipleSelectionToolbarConfirmationComponent;
    let testHostComp: MultipleSelectionToolbarConfirmationTestComponent;
    let fixture: ComponentFixture<MultipleSelectionToolbarConfirmationTestComponent>;
    let de: DebugElement;

    const multipleSelectToolbar = 'ss-multiple-selection-toolbar-confirmation';
    const dataAutomationMultipleSelectionToolbarSubmitButtonSelector = '[data-automation="ss-multiple-selection-toolbar-submit-btn"]';
    const dataAutomationMultipleSelectionToolbarEmptyLabelSelector = '[data-automation="ss-multiple-selection-toolbar-items-label-empty"]';
    const dataAutomationMultipleSelectionToolbarItemsLabelSelector =
        '[data-automation="ss-multiple-selection-toolbar-items-label-selected"]';

    const keyUpEvent: any = new Event('keyup');

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
            TranslationModule,
        ],
        declarations: [
            MultipleSelectionToolbarConfirmationComponent,
            MultipleSelectionToolbarConfirmationTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(MultipleSelectionToolbarConfirmationTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(multipleSelectToolbar));
        component = de.componentInstance;

        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('should emit submitSelection on handleSubmit function call', () => {
        spyOn(component.submitSelection, 'emit').and.callThrough();

        component.handleSubmit();

        expect(component.submitSelection.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit dismissSelection on handleDismiss function call', () => {
        spyOn(component.dismissSelection, 'emit').and.callThrough();

        component.handleDismiss();

        expect(component.dismissSelection.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit dismissSelection on ESC keyboard event', () => {
        spyOn(component.dismissSelection, 'emit');

        keyUpEvent.key = KeyEnum.Escape;
        window.dispatchEvent(keyUpEvent);

        expect(component.dismissSelection.emit).toHaveBeenCalledTimes(1);
    });

    it('should render empty items label when itemsCount is 0 on Add mode', () => {
        testHostComp.itemsCount = 0;

        fixture.detectChanges();

        expect(getElement(dataAutomationMultipleSelectionToolbarEmptyLabelSelector)).toBeDefined();
        expect(getElement(dataAutomationMultipleSelectionToolbarItemsLabelSelector)).not.toBeDefined();
    });

    it('should render empty items label when itemsCount is 0 on Edit mode and had no items before', () => {
        testHostComp.itemsCount = 0;
        testHostComp.initialItemsCount = 0;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Edit;

        fixture.detectChanges();

        expect(getElement(dataAutomationMultipleSelectionToolbarEmptyLabelSelector)).toBeDefined();
        expect(getElement(dataAutomationMultipleSelectionToolbarItemsLabelSelector)).not.toBeDefined();
    });

    it('should render selected items singular label when itemsCount is 1', () => {
        testHostComp.itemsCount = 1;

        fixture.detectChanges();

        expect(getElement(dataAutomationMultipleSelectionToolbarEmptyLabelSelector)).not.toBeDefined();
        expect(getElement(dataAutomationMultipleSelectionToolbarItemsLabelSelector).innerText).toContain(testHostComp.selectedItemLabel);
    });

    it('should render selected items plural label when itemsCount is higher then 1', () => {
        testHostComp.itemsCount = 2;

        fixture.detectChanges();

        expect(getElement(dataAutomationMultipleSelectionToolbarEmptyLabelSelector)).not.toBeDefined();
        expect(getElement(dataAutomationMultipleSelectionToolbarItemsLabelSelector).innerText).toContain(testHostComp.selectedItemsLabel);
    });

    it('should render selected items plural label when itemsCount is equal to 0 on Edit mode and had items before', () => {
        testHostComp.itemsCount = 0;
        testHostComp.initialItemsCount = 1;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Edit;

        fixture.detectChanges();

        expect(getElement(dataAutomationMultipleSelectionToolbarEmptyLabelSelector)).not.toBeDefined();
        expect(getElement(dataAutomationMultipleSelectionToolbarItemsLabelSelector).innerText).toContain(testHostComp.selectedItemsLabel);
    });

    it('should disable the submit button when there are no items selected on Add mode', () => {
        testHostComp.itemsCount = 0;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Add;

        fixture.detectChanges();
        expect(getElement(dataAutomationMultipleSelectionToolbarSubmitButtonSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not disable the submit button when there are items selected on Add mode', () => {
        testHostComp.itemsCount = 1;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Add;

        fixture.detectChanges();
        expect(getElement(dataAutomationMultipleSelectionToolbarSubmitButtonSelector).attributes['disabled']).toBeFalsy();
    });

    it('should disable the submit button when there are no items selected on Edit mode and had no items before', () => {
        testHostComp.itemsCount = 0;
        testHostComp.initialItemsCount = 0;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Edit;

        fixture.detectChanges();
        expect(getElement(dataAutomationMultipleSelectionToolbarSubmitButtonSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not disable the submit button when there are no items selected on Edit mode and had items before', () => {
        testHostComp.itemsCount = 0;
        testHostComp.initialItemsCount = 1;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Edit;

        fixture.detectChanges();
        expect(getElement(dataAutomationMultipleSelectionToolbarSubmitButtonSelector).attributes['disabled']).toBeFalsy();
    });

    it('should not disable the submit button when there are items selected on Edit mode and had no items before', () => {
        testHostComp.itemsCount = 1;
        testHostComp.initialItemsCount = 0;
        testHostComp.mode = MultipleSelectionToolbarConfirmationModeEnum.Edit;

        fixture.detectChanges();
        expect(getElement(dataAutomationMultipleSelectionToolbarSubmitButtonSelector).attributes['disabled']).toBeFalsy();
    });
});
