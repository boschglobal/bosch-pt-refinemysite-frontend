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
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANTS_LIST
} from '../../../../../test/mocks/participants';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {ProjectParticipantFilters} from '../../store/participants/slice/project-participant-filters';
import {ProjectParticipantsService} from './project-participants.service';
import {ProjectParticipantResource} from './resources/project-participant.resource';
import {ProjectParticipantListResource} from './resources/project-participant-list.resource';
import {SaveProjectParticipantResource} from './resources/save-project-participant.resource';

describe('Project Participants Service', () => {
    let projectParticipantsService: ProjectParticipantsService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const emptyResponseBody = {};
    const invitedParticipant = 'abc@abc.pt';
    const role = 'FM';
    const projectId = '123';
    const participantId = '123';
    const companyId = '456';
    const columns = 'company';
    const order = 'asc';
    const pageNumber = 1;
    const pageSize = 100;
    const filters: ProjectParticipantFilters = {
        roles: ['role1', 'role2'],
        status: [ParticipantStatusEnum.ACTIVE],
    };
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const inviteParticipantUrl = `${baseUrl}/projects/${projectId}/participants`;
    const findOneUrl = `${baseUrl}/projects/participants/${participantId}`;
    const assignUrl = `${baseUrl}/projects/${projectId}/participants/assignable`;
    const searchUrl = `${baseUrl}/projects/${projectId}/participants/search`;
    const findAllUrl = `${searchUrl}?page=${pageNumber}&size=${pageSize}&sort=company.displayName,status,user.firstName,user.lastName,asc`;
    const findAllUrl2 = `${searchUrl}?page=0&size=${pageSize}&sort=company.displayName,status,user.firstName,user.lastName,asc`;
    const findAllByCompanyUrl = `${assignUrl}?company=${companyId}&page=${pageNumber}&size=${pageSize}` +
        '&sort=company.displayName,status,user.firstName,user.lastName,asc';
    const findAllByCompanyUrl2 = `${assignUrl}?company=${companyId}&page=0&size=500` +
        '&sort=company.displayName,status,user.firstName,user.lastName,asc';
    const deleteUrl = `${baseUrl}/projects/participants/${participantId}`;
    const updateUrl = `${baseUrl}/projects/participants/${participantId}`;
    const resendInvitationUrl = `${baseUrl}/projects/participants/${participantId}/resend`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [ProjectParticipantsService]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectParticipantsService = TestBed.inject(ProjectParticipantsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should delete a project participant by id', waitForAsync(() => {
        projectParticipantsService
            .delete(MOCK_PARTICIPANT.id)
            .subscribe((response: any) =>
                expect(response).toEqual(emptyResponseBody));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(emptyResponseBody);
    }));

    it('should call invite and return a participant', waitForAsync(() => {
        projectParticipantsService
            .invite(invitedParticipant, role, projectId)
            .subscribe((response: ProjectParticipantResource) =>
                expect(response).toEqual(MOCK_PARTICIPANT));

        req = httpMock.expectOne(inviteParticipantUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PARTICIPANT);
    }));

    it('should call findAll and return a participant list', waitForAsync(() => {
        projectParticipantsService
            .findAll(projectId, columns, order, pageNumber, pageSize)
            .subscribe((response: ProjectParticipantListResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PARTICIPANTS_LIST);
    }));

    it('should call findAll without pageNumber and size and return a participant list', waitForAsync(() => {
        projectParticipantsService
            .findAll(projectId, columns, order)
            .subscribe((response: ProjectParticipantListResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST));

        req = httpMock.expectOne(findAllUrl2);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PARTICIPANTS_LIST);
    }));

    it('should call findAllByCompany and return a participant list', waitForAsync(() => {
        projectParticipantsService
            .findAllByCompany(projectId, companyId, columns, order, pageNumber, pageSize)
            .subscribe((response: ProjectParticipantListResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST));

        req = httpMock.expectOne(findAllByCompanyUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_PARTICIPANTS_LIST);
    }));

    it('should call findAllByCompany without pageNumber and size and return a participant list', waitForAsync(() => {
        projectParticipantsService
            .findAllByCompany(projectId, companyId, columns, order)
            .subscribe((response: ProjectParticipantListResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST));

        req = httpMock.expectOne(findAllByCompanyUrl2);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_PARTICIPANTS_LIST);
    }));

    it('should call findOne and return a participant', waitForAsync(() => {
        projectParticipantsService
            .findOne(participantId)
            .subscribe((response: ProjectParticipantResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST.items[0]));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_PARTICIPANTS_LIST.items[0]);
    }));

    it('should call findAll with filters and return a participant list', waitForAsync(() => {
        const reqBody = {projectId, ...filters};

        projectParticipantsService
            .findAll(projectId, columns, order, pageNumber, pageSize, filters)
            .subscribe((response: ProjectParticipantListResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST));

        req = httpMock.expectOne(findAllUrl);

        expect(req.request.body).toEqual(reqBody);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_PARTICIPANTS_LIST);
    }));

    it('should call update and return a participant', waitForAsync(() => {
        const payload = new SaveProjectParticipantResource('role');
        projectParticipantsService
            .update(projectId, payload, 0)
            .subscribe((response: ProjectParticipantResource) =>
                expect(response).toEqual(MOCK_PARTICIPANTS_LIST.items[0]));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toBe(JSON.stringify(payload));
        req.flush(MOCK_PARTICIPANTS_LIST.items[0]);
    }));

    it('should call resendInvitation and return empty object', waitForAsync(() => {
        projectParticipantsService
            .resendInvitation(participantId)
            .subscribe((response: any) =>
                expect(response).toEqual({}));

        req = httpMock.expectOne(resendInvitationUrl);
        expect(req.request.body).toBeNull();
        expect(req.request.method).toBe('POST');
        req.flush({});
    }));
});
