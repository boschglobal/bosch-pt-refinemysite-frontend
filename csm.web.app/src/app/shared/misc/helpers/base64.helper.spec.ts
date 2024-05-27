/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {Base64Helper} from './base64.helper';

describe('Base64 Helper', () => {
    let base64Helper: Base64Helper;

    // '<<???>>' it's ideal to test both Base64 and Base64URL because when encoded contains all the special chars and padding
    // Base64URL: '<<???>>' => 'PDw_Pz8-Pg'
    // Base64: '<<???>>' => 'PDw/Pz8+Pg=='
    const stringToEncode = '<<???>>';
    const base64UrlTester = /^[\w-]+$/;

    const moduleDef: TestModuleMetadata = {
        providers: [Base64Helper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => base64Helper = TestBed.inject(Base64Helper));

    it('should encode string as Base64URL', () => {
        const base64Url = base64Helper.encodeBase64Url(stringToEncode);

        expect(base64UrlTester.test(base64Url)).toBeTruthy();
    });
});
