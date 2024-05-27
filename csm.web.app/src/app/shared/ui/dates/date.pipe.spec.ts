/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import * as moment from 'moment';

import {DateHelperStub} from '../../../../test/stubs/date.helper.stub';
import {DateHelper} from './date.helper.service';
import {DatePipe} from './date.pipe';

describe('Date Pipe', () => {
    let pipe: DatePipe;
    let dateHelper: DateHelper;

    const referenceDate: string = moment().toISOString();
    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: DateHelper,
                useValue: new DateHelperStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        dateHelper = TestBed.inject(DateHelper);
        pipe = new DatePipe(dateHelper);
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return an observable that outputs a defined value when pipe defaults are used', () => {
        pipe.transform(referenceDate).subscribe(formattedDate => {
            expect(formattedDate).toBe(referenceDate);
        }).unsubscribe();
    });

    it('should return an observable that outputs a defined value when pipe custom format settings are used', () => {
        pipe.transform(referenceDate, null, null).subscribe(formattedDate => {
            expect(formattedDate).toBe(referenceDate);
        }).unsubscribe();
    });

});
