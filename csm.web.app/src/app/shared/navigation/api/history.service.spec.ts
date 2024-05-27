/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata
} from '@angular/core/testing';
import {Router} from '@angular/router';

import {RouterStub} from '../../../../test/stubs/router.stub';
import {HistoryService} from './history.service';

describe('History Service', () => {
    let historyService: HistoryService;
    let router: Router;

    const homeUrl = '/';
    const regularUrl = 'abc';
    const theaterUrl = 'abc(theater:theater)';

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Router,
                useClass: RouterStub
            }
        ]
    };

    beforeEach(() => TestBed.configureTestingModule(moduleDef));

    beforeEach(() => {
        router = TestBed.inject(Router);
        historyService = TestBed.inject(HistoryService);
    });

    it('should not push two equal entries one after the other', () => {
        const historyLength = historyService.length;

        historyService.pushState(regularUrl);
        historyService.pushState(regularUrl);

        expect(historyService.length).toBe(historyLength + 1);
    });

    it('should have home set as default history', () => {
        expect(historyService.popState()).toBe(homeUrl);
    });

    it('should navigate back when back() is called and has history', () => {
        spyOn(router, 'navigateByUrl');
        historyService.pushState(homeUrl);
        historyService.back();
        expect(router.navigateByUrl).toHaveBeenCalledWith(homeUrl);
    });

    it('should not push urls that match theater', () => {
        router.navigateByUrl(homeUrl);
        router.navigateByUrl(regularUrl);
        router.navigateByUrl(theaterUrl);
        router.navigateByUrl(regularUrl);
        expect(historyService.popState()).toBe(homeUrl);
    });

    it('should not navigate back when back() is called and there\'s history', () => {
        spyOn(router, 'navigateByUrl');
        historyService.popState();
        historyService.back();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
});
