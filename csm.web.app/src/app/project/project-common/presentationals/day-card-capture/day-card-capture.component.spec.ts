/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {MOCK_DAY_CARD_A} from '../../../../../test/mocks/day-cards';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {DayCardCaptureComponent} from './day-card-capture.component';

describe('Day Card Capture Component', () => {
    let component: DayCardCaptureComponent;
    let fixture: ComponentFixture<DayCardCaptureComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationCreateDayCardSelector = '[data-automation="create"]';
    const dataAutomationCancelDayCardSelector = '[data-automation="cancel"]';

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [DayCardCaptureComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DayCardCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should set form after ngOnInit()', () => {
        fixture.detectChanges();
        expect(component.form).toBeDefined();

        component.form = null;
        component.ngOnInit();

        fixture.detectChanges();
        expect(component.form).toBeDefined();
    });

    it('should allow to create a day card when title, date and manpower are fulfilled', () => {
        spyOn(component, 'handleSubmit').and.callThrough();
        component.form.get('title').setValue('Lorem ipsum');
        component.form.get('date').setValue(moment());
        component.form.get('manpower').setValue(1);
        component.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationCreateDayCardSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleSubmit).toHaveBeenCalled();
    });

    it('should cancel and call cancel method when clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();
        component.form.get('title').setValue('Lorem ipsum');
        component.form.get('date').setValue(moment());
        component.form.get('manpower').setValue(1);
        component.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationCancelDayCardSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should reset form on cancel', () => {
        const title = 'Lorem ipsum';
        component.form.get('title').setValue(title);
        component.form.get('date').setValue(moment());
        component.form.get('manpower').setValue(1);
        component.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationCancelDayCardSelector).dispatchEvent(clickEvent);

        expect(component.form.get('title').value).not.toContain(title);
        expect(component.form.get('title').value).toBe('');
        expect(component.form.get('date').value).toBeNull();
        expect(component.form.get('manpower').value).toBe(1);
    });

    it('should trigger setFocus from notesInput when notes is setted on focus', () => {
        const defaultValues = new SaveDayCardResource(MOCK_DAY_CARD_A.title, moment(MOCK_DAY_CARD_A.date), MOCK_DAY_CARD_A.manpower, MOCK_DAY_CARD_A.notes);

        spyOn(component.notesInput, 'setFocus').and.callThrough();

        component.focus = 'notes';
        component.defaultValues = defaultValues;

        expect(component.notesInput.setFocus).toHaveBeenCalled();
    });
});
