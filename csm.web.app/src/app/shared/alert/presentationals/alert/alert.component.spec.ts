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
import {By} from '@angular/platform-browser';

import {
    ERROR_ALERT_MOCK,
    SUCCESS_ALERT_MOCK
} from '../../../../../test/mocks/alerts';
import {TranslationModule} from '../../../translation/translation.module';
import {AlertComponent} from './alert.component';
import {AlertTestComponent} from './alert.test.component';

describe('Alert Component', () => {
    let testHostComp: AlertTestComponent;
    let fixture: ComponentFixture<AlertTestComponent>;
    let comp: AlertComponent;
    let de: DebugElement;

    const defaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    const alertSelector = `ss-alert`;
    const dataAutomationCloseButtonSelector = `[data-automation="ss-alert__close"]`;
    const dataAutomationContentSelector = `[data-automation="ss-alert__content"]`;
    const clickEvent: Event = new Event('click');

    const getNativeElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const getAlertContent = (): string => getNativeElement(dataAutomationContentSelector).textContent.trim();

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            AlertComponent,
            AlertTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(alertSelector));
        comp = de.componentInstance;

        testHostComp.alert = ERROR_ALERT_MOCK;

        fixture.detectChanges();
    });

    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeoutInterval;
    });

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });

    it('should emit close event when close button is clicked', () => {
        spyOn(comp.close, 'emit').and.callThrough();

        getNativeElement(dataAutomationCloseButtonSelector).dispatchEvent(clickEvent);

        expect(comp.close.emit).toHaveBeenCalledWith(ERROR_ALERT_MOCK.id);
    });

    it('should auto destroy alert (emit close event) after 5 seconds of it\'s initialization', (done) => {
        spyOn(comp.close, 'emit').and.callThrough();

        setTimeout(() => {
            expect(comp.close.emit).toHaveBeenCalledWith(ERROR_ALERT_MOCK.id);
            done();
        }, 5000);
    });

    it('should render right text message for simple text alerts', () => {
        testHostComp.alert = SUCCESS_ALERT_MOCK;

        fixture.detectChanges();

        expect(getAlertContent()).toBe(SUCCESS_ALERT_MOCK.message.text);
    });

    it('should render right translation key for translatable alerts', () => {
        testHostComp.alert = ERROR_ALERT_MOCK;

        fixture.detectChanges();

        expect(getAlertContent()).toBe(ERROR_ALERT_MOCK.message.key);
    });
});
