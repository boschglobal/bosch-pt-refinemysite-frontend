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
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslationModule} from '../../../translation/translation.module';
import {UIModule} from '../../../ui/ui.module';
import {UserPrivacySettings} from '../../api/resources/user-privacy-settings.resource';
import {PrivacySettingsComponent} from './privacy-settings.component';

describe('Privacy Settings Component', () => {
    let fixture: ComponentFixture<PrivacySettingsComponent>;
    let comp: PrivacySettingsComponent;
    let de: DebugElement;

    const dataAutomationSaveButtonSelector = `[data-automation="privacy-settings-save-button"]`;
    const dataAutomationAcceptAllButtonSelector = `[data-automation="privacy-settings-accept-all-button"]`;
    const clickEvent: Event = new Event('click');

    const getNativeElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            PrivacySettingsComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PrivacySettingsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.privacySettings = null;

        fixture.detectChanges();
    });

    it('should display saved privacy settings', () => {
        const comfort = true;
        const performance = false;
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            comfort,
            performance,
        };

        comp.privacySettings = privacySettings;

        fixture.detectChanges();

        expect(comp.form.get('comfort').value).toBe(comfort);
        expect(comp.form.get('performance').value).toBe(performance);
    });

    it('should save current selection when Save button is clicked', () => {
        let emittedValue: UserPrivacySettings;
        spyOn(comp.savePrivacySettings, 'emit').and.callFake(value => emittedValue = value);
        const comfort = true;
        const performance = false;
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            comfort,
            performance,
        };

        comp.privacySettings = privacySettings;

        fixture.detectChanges();

        getNativeElement(dataAutomationSaveButtonSelector).dispatchEvent(clickEvent);

        expect(comp.savePrivacySettings.emit).toHaveBeenCalled();
        expect(emittedValue.comfort).toBe(comfort);
        expect(emittedValue.performance).toBe(performance);
        expect(emittedValue.lastModifiedDate.getTime()).toBeCloseTo(privacySettings.lastModifiedDate.getTime(), -100);
    });

    it('should save all options when Accept all button is clicked', () => {
        let emittedValue: UserPrivacySettings;
        spyOn(comp.savePrivacySettings, 'emit').and.callFake(value => emittedValue = value);
        const comfort = true;
        const performance = true;
        const privacySettings: UserPrivacySettings = {
            ...new UserPrivacySettings(),
            comfort,
            performance,
        };

        comp.privacySettings = privacySettings;
        comp.form.patchValue({
            comfort: false,
            performance: false,
        });

        fixture.detectChanges();

        getNativeElement(dataAutomationAcceptAllButtonSelector).dispatchEvent(clickEvent);

        expect(comp.savePrivacySettings.emit).toHaveBeenCalled();
        expect(emittedValue.comfort).toBe(comfort);
        expect(emittedValue.performance).toBe(performance);
        expect(emittedValue.lastModifiedDate.getTime()).toBeCloseTo(privacySettings.lastModifiedDate.getTime(), -100);
    });
});
