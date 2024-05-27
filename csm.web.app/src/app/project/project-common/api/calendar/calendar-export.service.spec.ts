/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {CalendarExportFormatEnum} from '../../enums/calendar-export-format.enum';
import {
    CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE,
    CalendarExportService
} from './calendar-export.service';
import {CalendarExportFilters} from './resources/calendar-export-filters';

describe('Calendar Export Service', () => {
    let calendarExportService: CalendarExportService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'foo';
    const jobId = 'foo';
    const response: AbstractResource = {id: jobId};
    const filters: CalendarExportFilters = new CalendarExportFilters();
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const getExportUrlByFileType = (format: CalendarExportFormatEnum): string =>
        `${baseUrl}/projects/${projectId}/calendar/export/${CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE[format].toLowerCase()}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [CalendarExportService],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        calendarExportService = TestBed.inject(CalendarExportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call getFile for PDF file format and return a job id', () => {
        const expectedUrl = getExportUrlByFileType(CalendarExportFormatEnum.Pdf);

        calendarExportService
            .getFile(projectId, filters, CalendarExportFormatEnum.Pdf)
            .subscribe(result => expect(result.id).toBe(jobId));

        req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });

    it('should call getFile for CSV file format and return a job id', () => {
        const expectedUrl = getExportUrlByFileType(CalendarExportFormatEnum.Csv);

        calendarExportService
            .getFile(projectId, filters, CalendarExportFormatEnum.Csv)
            .subscribe(result => expect(result.id).toBe(jobId));

        req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });

    it('should call getFile for JSON file format and return a job id', () => {
        const expectedUrl = getExportUrlByFileType(CalendarExportFormatEnum.Json);

        calendarExportService
            .getFile(projectId, filters, CalendarExportFormatEnum.Json)
            .subscribe(result => expect(result.id).toBe(jobId));

        req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('POST');
        req.flush(response);
    });
});
