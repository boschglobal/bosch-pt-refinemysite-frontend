/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {AbstractResource} from '../../../../shared/misc/api/resources/abstract.resource';
import {FileTypeEnum} from '../../../../shared/misc/enums/file.type.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {ApiUrlHelper} from '../../../../shared/rest/helpers/api-url.helper';
import {CalendarExportFormatEnum} from '../../enums/calendar-export-format.enum';
import {CalendarExportFilters} from './resources/calendar-export-filters';

export const CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE = {
    [CalendarExportFormatEnum.Pdf]: FileTypeEnum.PDF,
    [CalendarExportFormatEnum.Json]: FileTypeEnum.JSON,
    [CalendarExportFormatEnum.Csv]: FileTypeEnum.CSV,
};

@Injectable({
    providedIn: 'root',
})
export class CalendarExportService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper(ApiVersionsEnum.Project);

    constructor(private _httpClient: HttpClient) {
    }

    public getFile(projectId: string,
                   filters: CalendarExportFilters,
                   format: CalendarExportFormatEnum): Observable<AbstractResource> {
        const fileType = CALENDAR_EXPORT_FORMAT_TO_FILE_TYPE[format].toLowerCase();
        const url = this._apiUrlHelper
            .withPath(`projects/${projectId}/calendar/export/${fileType}`)
            .build();

        return this._httpClient
            .post<AbstractResource>(url, {
                ...filters,
                ...filters.from ? {from: filters.from.format(API_DATE_YEAR_MONTH_DAY_FORMAT)} : {},
                ...filters.to ? {to: filters.to.format(API_DATE_YEAR_MONTH_DAY_FORMAT)} : {},
            });
    }
}
