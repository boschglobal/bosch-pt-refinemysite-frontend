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
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {MessageDateDirective} from './message-date.directive';
import {MessageDateTestComponent} from './message-date.test.component';

describe('Message Date Directive', () => {
    let fixture: ComponentFixture<MessageDateTestComponent>;
    let comp: MessageDateTestComponent;
    let de: DebugElement;

    const keys = {
        yesterday: 'Generic_Yesterday',
        today: 'Generic_Today',
        tomorrow: 'Generic_Tomorrow'
    };

    const dataAutomationSelector = '[data-automation="message-date-test"]';

    const getElementInnerText = () => de.query(By.css(dataAutomationSelector)).nativeElement.innerText;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            MessageDateDirective,
            MessageDateTestComponent
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
        fixture = TestBed.createComponent(MessageDateTestComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
    });

    it('should get yesterday', () => {
        comp.date = moment().subtract(1, 'day').toDate();
        fixture.detectChanges();

        expect(getElementInnerText()).toBe(keys.yesterday);
    });

    it('should get today', () => {
        comp.date = moment().toDate();
        fixture.detectChanges();

        expect(getElementInnerText()).toBe(keys.today);
    });

    it('should get tomorrow', () => {
        comp.date = moment().add(1, 'day').toDate();
        fixture.detectChanges();

        expect(getElementInnerText()).toBe(keys.tomorrow);
    });
});
