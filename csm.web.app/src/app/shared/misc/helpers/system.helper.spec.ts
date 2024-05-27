/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {setUserAgent} from '../../../../test/helpers';
import {SystemHelper} from './system.helper';

describe('System Helper', () => {
    const originalUserAgent = window.navigator.userAgent;
    const macUserAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36';
    const oldEdgeUserAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582';
    const newEdgeUserAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edg/79.19582';
    const oldFirefoxUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0';
    const newFirefoxUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0';
    const windowsUserAgent = 'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko';

    afterAll(() => {
        setUserAgent(originalUserAgent);
    });

    it('should return FALSE from isMacOS for a Windows OS UserAgent', () => {
        setUserAgent(windowsUserAgent);
        const systemHelper = new SystemHelper();
        expect(systemHelper.isMacOS()).toBeFalsy();
    });

    it('should return TRUE from isMacOS for a Mac OS UserAgent', () => {
        setUserAgent(macUserAgent);
        const systemHelper = new SystemHelper();
        expect(systemHelper.isMacOS()).toBeTruthy();
    });

    it('should return TRUE from isDeprecatedBrowser for an old Edge UserAgent', () => {
        setUserAgent(oldEdgeUserAgent);
        const systemHelper = new SystemHelper();
        expect(systemHelper.isDeprecatedBrowser()).toBeTruthy();
    });

    it('should return FALSE from isDeprecatedBrowser for a chromium Edge UserAgent', () => {
        setUserAgent(newEdgeUserAgent);
        const systemHelper = new SystemHelper();
        const res = systemHelper.isDeprecatedBrowser();
        expect(res).toBeFalsy();
    });

    it('should return TRUE from isRecentFirefox for an recent Firefox UserAgent', () => {
        setUserAgent(newFirefoxUserAgent);
        const systemHelper = new SystemHelper();

        expect(systemHelper.isRecentFirefox()).toBeTruthy();
    });

    it('should return FALSE from isRecentFirefox for an old Firefox UserAgent', () => {
        setUserAgent(oldFirefoxUserAgent);
        const systemHelper = new SystemHelper();

        expect(systemHelper.isRecentFirefox()).toBeFalsy();
    });

    it('should return FALSE from isRecentFirefox for an Edge UserAgent', () => {
        setUserAgent(newEdgeUserAgent);
        const systemHelper = new SystemHelper();

        expect(systemHelper.isRecentFirefox()).toBeFalsy();
    });

    it('should return TRUE from isCssHasSupported when the browser supports it', () => {
        spyOn(CSS, 'supports').and.callFake(() => true);
        const systemHelper = new SystemHelper();
        expect(systemHelper.isCssHasSupported()).toBeTruthy();
        expect(CSS.supports).toHaveBeenCalledWith('selector(:has(*))');
    });

    it('should return FALSE from isCssHasSupported when the browser does not support it', () => {
        spyOn(CSS, 'supports').and.callFake(() => false);
        const systemHelper = new SystemHelper();
        expect(systemHelper.isCssHasSupported()).toBeFalsy();
        expect(CSS.supports).toHaveBeenCalledWith('selector(:has(*))');
    });
});
