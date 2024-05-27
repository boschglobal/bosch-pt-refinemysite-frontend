/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import * as moment from 'moment';

import {LanguageEnum} from '../../../../shared/translation/helper/language.enum';
import {TimeScopeLabelFormatEnum} from '../../enums/date-format.enum';
import {MilestoneDateLabelComponent} from './milestone-date-label.component';
import {MilestoneDateLabelTestComponent} from './milestone-date-label.test.component';

describe('MilestoneDateLabelComponent', () => {
    let fixture: ComponentFixture<MilestoneDateLabelTestComponent>;
    let testHostComp: MilestoneDateLabelTestComponent;
    let translateService: TranslateService;
    let de: DebugElement;

    const date = moment();
    const hostSelector = 'ss-milestone-date-label';
    const milestoneDateLabelSelector = `[data-automation="milestone-date-label-date"]`;

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            MilestoneDateLabelComponent,
            MilestoneDateLabelTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneDateLabelTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(hostSelector));

        translateService = TestBed.inject(TranslateService);

        translateService.setDefaultLang(LanguageEnum.EN);
        testHostComp.date = date;

        fixture.detectChanges();
    });

    it('should display the formatted date in the default language', () => {
        const expectedResult = moment(date).locale(LanguageEnum.EN).format(TimeScopeLabelFormatEnum.en);

        expect(getElement(milestoneDateLabelSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should change the formatted date when the language changes', () => {
        const expectedResult = moment(date).locale(LanguageEnum.DE).format(TimeScopeLabelFormatEnum.de);

        translateService.setDefaultLang(LanguageEnum.DE);

        testHostComp.date = moment();

        fixture.detectChanges();

        expect(getElement(milestoneDateLabelSelector).innerText.trim()).toBe(expectedResult);
    });
});
