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
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {CRAFT_COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {
    ProjectCraftsCapture,
    ProjectCraftsCaptureComponent
} from './project-crafts-capture.component';

describe('Project Crafts Capture Component', () => {
    let fixture: ComponentFixture<ProjectCraftsCaptureComponent>;
    let comp: ProjectCraftsCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const clickEvent: Event = new Event('click');
    const dataAutomationSelectorDefaultPosition = '[data-automation="project-crafts-capture-position"]';
    const dataAutomationSelectorCancel = '[data-automation="cancel"]';
    const dataAutomationInputPositionNumber = '[data-automation="project-crafts-capture-input-position-number"]';
    const craft: ProjectCraftsCapture = {name: 'craft', color: null, position: 1};

    const getElement = (selector: string) => de.query(By.css(selector));
    const getNativeElement = (selector: string): HTMLElement => de.query((By.css(selector)))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [ProjectCraftsCaptureComponent],
        providers: [
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
        fixture = TestBed.createComponent(ProjectCraftsCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        comp.mode = CaptureModeEnum.create;
        comp.crafts = [];
        comp.defaultValues = craft;

        fixture.detectChanges();
        comp.ngOnInit();
    });

    it('should set craft capture form after ngOnInit()', () => {
        comp.ngOnInit();

        expect(comp.form).toBeDefined();
    });

    it('should trigger onSubmit emit when form is submitted', () => {
        spyOn(comp.onSubmit, 'emit').and.callThrough();

        comp.handleSubmit();

        expect(comp.onSubmit.emit).toHaveBeenCalled();
    });

    it('should call handleCancel when clicking cancel', () => {
        spyOn(comp, 'handleCancel').and.callThrough();

        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);

        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should set default values', () => {
        comp.defaultValues = craft;

        expect(comp.form.value.name).toEqual(craft.name);
        expect(comp.form.value.position).toEqual(craft.position);
    });

    it('should set random when defaultValues are not provided', () => {
        const foundColorInSet = CRAFT_COLORS.find(color => color.solid === comp.form.value.color);

        expect(foundColorInSet).toBeTruthy();
    });

    it('should get add string key when mode is setted for create', () => {
        comp.mode = CaptureModeEnum.create;

        expect(comp.getSubmitKey()).toEqual('Generic_Add');
    });

    it('should get save string key when mode is setted for edit', () => {
        comp.mode = CaptureModeEnum.update;

        fixture.detectChanges();

        expect(comp.getSubmitKey()).toEqual('Generic_Save');
    });

    it('should not have default position when mode is create', () => {
        comp.mode = CaptureModeEnum.create;

        expect(getElement(dataAutomationSelectorDefaultPosition)).toBeNull();
    });

    it('should have default position when mode is update', () => {
        comp.mode = CaptureModeEnum.update;

        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationSelectorDefaultPosition)).toBeDefined();
    });

    it('should have a correct default position', () => {
        const position = 50;

        comp.mode = CaptureModeEnum.update;
        comp.defaultValues = {
            ...craft,
            position,
        };

        comp.ngOnInit();

        fixture.detectChanges();

        expect(comp.position).toBe(50);
        expect(getNativeElement(dataAutomationSelectorDefaultPosition).innerText).toContain(`${position}.`);
    });

    it('should setup form when resetForm() is triggered', () => {
        const craftName = 'my craft';

        comp.form.get('name').setValue(craftName);

        comp.resetForm();

        expect(comp.form.get('name').value).toBe('');
    });

    it('should call setFocus and focus input', () => {
        spyOn(comp, 'setFocus').and.callThrough();

        fixture.detectChanges();
        comp.setFocus();

        expect(comp.craftInput.input.nativeElement.focus).toBeTruthy();
    });

    it('should render position input when user is creating crafts', () => {
        comp.mode = CaptureModeEnum.create;

        fixture.detectChanges();

        expect(getElement(dataAutomationInputPositionNumber)).toBeDefined();
    });

    it('should not render position input when user is editing crafts', () => {
        comp.mode = CaptureModeEnum.update;

        comp.ngOnInit();

        fixture.detectChanges();

        expect(getElement(dataAutomationInputPositionNumber)).toBeNull();
    });

    it('should set isUpdateMode to true when mode is edit', () => {
        comp.mode = CaptureModeEnum.update;

        comp.ngOnInit();

        expect(comp.isUpdateMode).toBe(true);
    });

    it('should set isUpdateMode to false when mode is create', () => {
        comp.mode = CaptureModeEnum.create;

        comp.ngOnInit();

        expect(comp.isUpdateMode).toBe(false);
    });
});
