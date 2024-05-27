/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import * as moment from 'moment';
import {CookieService} from 'ngx-cookie-service';
import {CookieOptions} from 'ngx-cookie-service/lib/cookie.service';

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../configurations/configuration.local-with-dev-backend';
import {ANNOUNCEMENTS_LIST_MOCK} from '../../../../test/mocks/announcements';
import {CookieNameEnum} from '../../cookie/enums/cookie-name.enum';
import {AlertTypeEnum} from '../enums/alert-type.enum';
import {AnnouncementsService} from './announcements.service';
import {AnnouncementListResource} from './resources/announcement-list.resource';

describe('AnnouncementsService', () => {
    let announcementsService: AnnouncementsService;
    let cookieService: jasmine.SpyObj<CookieService>;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Announcement}`;
    const findAllUrl = `${baseUrl}/announcements`;

    const announcementsListResponseBody = ANNOUNCEMENTS_LIST_MOCK;
    const announcementsListResponseBodyRaw = {
        items: announcementsListResponseBody.items.map(announcement => {
            announcement.type = announcement.type.toUpperCase() as AlertTypeEnum;
            return announcement;
        }),
    };
    const readAnnouncements = ['1', '2'];
    const stringifyReadAnnouncements = JSON.stringify(readAnnouncements);
    const btoaReadAnnouncements = btoa(stringifyReadAnnouncements);
    const parserReadAnnouncements = JSON.parse(stringifyReadAnnouncements);

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [
            {
                provide: CookieService,
                useValue: jasmine.createSpyObj('CookieService', ['get', 'set']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        announcementsService = TestBed.inject(AnnouncementsService);
        cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should call findAll and return list of announcements', waitForAsync(() => {
        announcementsService
            .findAll()
            .subscribe((response: AnnouncementListResource) =>
                expect(response).toEqual(announcementsListResponseBody));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(announcementsListResponseBodyRaw);
    }));

    it('should save ReadAnnouncements on cookies with correct path, expires and announcementRead', () => {
        const expectedCookieOptions: CookieOptions = {
            expires: moment().startOf('day').add(1, 'month').toDate(),
            path: '/',
        };
        const expectedSetAnnouncementsParams = [
            CookieNameEnum.ReadAnnouncements,
            btoaReadAnnouncements,
            expectedCookieOptions,
        ];

        cookieService.get.and.returnValue(btoaReadAnnouncements);

        announcementsService.setAnnouncementsHasRead(readAnnouncements).subscribe(announcements =>
            expect(announcements).toEqual(parserReadAnnouncements));
        expect(cookieService.set).toHaveBeenCalledWith(...expectedSetAnnouncementsParams);
    });

    it('should fetch ReadAnnouncements from cookies', () => {
        cookieService.get.and.returnValue(btoaReadAnnouncements);

        announcementsService.getReadAnnouncements().subscribe(announcements =>
            expect(announcements).toEqual(parserReadAnnouncements));
    });

    it('should throw error when fetching ReadAnnouncements from malformed cookie', () => {
        const readAnnouncementsMalformed = '{}';

        cookieService.get.and.returnValue(readAnnouncementsMalformed);

        announcementsService.getReadAnnouncements().subscribe(()=> {}, error => expect(error).toBeTruthy());
    });
});
