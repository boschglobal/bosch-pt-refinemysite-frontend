/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {MOCK_TASK} from '../../../../../test/mocks/tasks';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TimeScopeLabelFormatEnum} from '../../../../project/project-common/enums/date-format.enum';
import {LanguageEnum} from '../../../translation/helper/language.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {TimeScopeLabelComponent} from './time-scope-label.component';

describe('TimeScopeLabelComponent', () => {
    let component: TimeScopeLabelComponent;
    let fixture: ComponentFixture<TimeScopeLabelComponent>;
    let translateService: TranslateService;
    let debugElement: DebugElement;
    let el: HTMLElement;

    const dataAutomationTimeScopeLabel = '[data-automation="ss-time-scope-label"]';
    const dataAutomationTimeScopeButtonSetStart = '[data-automation="ss-time-scope-label__set-start"]';
    const dataAutomationTimeScopeButtonSetEnd = '[data-automation="ss-time-scope-label__set-end"]';

    const clickEvent: Event = new Event('click');
    const getElement = (element: string): Element => el.querySelector(element);
    const getFormattedDate = (date: string): string => {
        const currentLang: string = LanguageEnum.EN;
        const dateFormat: string = TimeScopeLabelFormatEnum[currentLang];

        return date ? moment(date).locale(currentLang).format(dateFormat) : null;
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            TimeScopeLabelComponent
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TimeScopeLabelComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        el = debugElement.nativeElement;

        component.start = MOCK_TASK.schedule.start.toString();
        component.end = MOCK_TASK.schedule.end.toString();

        translateService = TestBed.inject(TranslateService);

        translateService.setDefaultLang(LanguageEnum.EN);

        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('should display the correct and formatted time scope label when start and end date is defined', () => {
        const expectedResult = `${getFormattedDate(MOCK_TASK.schedule.start)}${getFormattedDate(MOCK_TASK.schedule.end)}`;

        expect(getElement(dataAutomationTimeScopeLabel).textContent).toEqual(expectedResult);
    });

    it('should trigger the correct call to action when start and end date is not defined and canSet is true', () => {
        spyOn(component.addStart, 'emit');
        component.canAdd = true;
        component.start = null;
        component.end = null;

        fixture.detectChanges();

        getElement(dataAutomationTimeScopeButtonSetStart).dispatchEvent(clickEvent);

        expect(component.addStart.emit).toHaveBeenCalled();
    });

    it('should trigger the correct call to action and display the correct label when start date is not defined and canSet is true', () => {
        const label = getFormattedDate(MOCK_TASK.schedule.end);
        spyOn(component.addStart, 'emit');
        component.canAdd = true;
        component.start = null;

        fixture.detectChanges();

        getElement(dataAutomationTimeScopeButtonSetStart).dispatchEvent(clickEvent);

        expect(getElement(dataAutomationTimeScopeLabel).textContent).toContain(label);
        expect(component.addStart.emit).toHaveBeenCalled();
    });

    it('should trigger the correct call to action and display the correct label when end date is not defined and canSet is true', () => {
        const label = getFormattedDate(MOCK_TASK.schedule.start);
        spyOn(component.addEnd, 'emit');
        component.canAdd = true;
        component.end = null;

        fixture.detectChanges();

        getElement(dataAutomationTimeScopeButtonSetEnd).dispatchEvent(clickEvent);

        expect(getElement(dataAutomationTimeScopeLabel).textContent).toContain(label);
        expect(component.addEnd.emit).toHaveBeenCalled();
    });

    it('should not display call to action buttons if canSet is false with start and end date not defined', () => {
        component.start = null;
        component.end = null;

        fixture.detectChanges();

        expect(getElement(dataAutomationTimeScopeButtonSetStart)).toBeNull();
        expect(getElement(dataAutomationTimeScopeButtonSetEnd)).toBeNull();

    });

    it('should translate time scope format label when language changes', () => {
        const startDate = MOCK_TASK.schedule.start.toString();
        const endDate = MOCK_TASK.schedule.end.toString();

        const expectedStartDateAfterLangChange = moment(startDate).locale(LanguageEnum.DE).format(TimeScopeLabelFormatEnum.de);
        const expectedEndDateAfterLangChange = moment(endDate).locale(LanguageEnum.DE).format(TimeScopeLabelFormatEnum.de);

        translateService.setDefaultLang(LanguageEnum.DE);

        fixture.detectChanges();

        expect(component.start).toEqual(expectedStartDateAfterLangChange);
        expect(component.end).toEqual(expectedEndDateAfterLangChange);
    });
});
