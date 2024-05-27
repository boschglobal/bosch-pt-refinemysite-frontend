/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {EventSourceService} from './event-source.service';

describe('Event Source Service', () => {
    let eventSourceService: EventSourceService;

    const url = 'https://localhost:8000/foo';
    const options: EventSourceInit = {withCredentials: true};
    const moduleDef: TestModuleMetadata = {};

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        eventSourceService = TestBed.inject(EventSourceService);
    });

    it('should be created', () => {
        expect(eventSourceService).toBeTruthy();
    });

    it('should return a configured instance of EventSource', () => {
        const eventSource = eventSourceService.connect(url, options);

        expect(eventSource instanceof EventSource).toBeTruthy();
        expect(eventSource.url).toBe(url);
        expect(eventSource.withCredentials).toBe(options.withCredentials);

        eventSource.close();
    });
});
