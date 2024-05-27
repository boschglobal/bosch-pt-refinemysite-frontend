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

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_DAY_CARD_RESOURCE_A,
    MOCK_SAVE_DAY_CARD_A,
} from '../../../../../test/mocks/day-cards';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MOCK_TASK_SCHEDULE_RESOURCE_A} from '../../../../../test/mocks/task-schedules';
import {AbstractIdsSaveResource} from '../../../../shared/misc/api/resources/abstract-ids-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {TaskScheduleResource} from '../tasks/resources/task-schedule.resource';
import {DayCardService} from './day-card.service';
import {DayCardResource} from './resources/day-card.resource';
import {SaveDeleteDayCardResource} from './resources/save-delete-day-card.resource';

describe('Day Card Service', () => {
    let dayCardService: DayCardService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const taskId = MOCK_DAY_CARD_RESOURCE_A.task.id;
    const dayCardId = MOCK_DAY_CARD_RESOURCE_A.id;
    const projectId = MOCK_PROJECT_1.id;
    const dayCardIds = new AbstractIdsSaveResource([MOCK_DAY_CARD_RESOURCE_A.id]);
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const createUrl = `${baseUrl}/projects/tasks/${taskId}/schedule/daycards`;
    const updateUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}`;
    const findAll = `${baseUrl}/projects/tasks/schedule/daycards`;
    const deleteOneUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}`;
    const cancelOneUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}/cancel`;
    const completeOneUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}/complete`;
    const approveOneUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}/approve`;
    const deleteAllUrl = `${baseUrl}/projects/${projectId}/tasks/schedule/daycards`;
    const cancelAllUrl = `${baseUrl}/projects/tasks/schedule/daycards/cancel`;
    const completeAllUrl = `${baseUrl}/projects/tasks/schedule/daycards/complete`;
    const approveAllUrl = `${baseUrl}/projects/tasks/schedule/daycards/approve`;
    const resetUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}/reset`;
    const findOneUrl = `${baseUrl}/projects/tasks/schedule/daycards/${dayCardId}`;
    const version = 0;
    const dayCardList = [{id: dayCardId, version}];
    const mockDayCardList = [MOCK_DAY_CARD_RESOURCE_A];
    const mockDayCardListResource = {items: mockDayCardList};
    const saveDeleteDaycardResource = [new SaveDeleteDayCardResource(version, [MOCK_DAY_CARD_RESOURCE_A.id])];
    const deleteAllItemsResource = new AbstractItemsResource<SaveDeleteDayCardResource>(saveDeleteDaycardResource);

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [DayCardService]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        dayCardService = TestBed.inject(DayCardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return a day card', waitForAsync(() => {
        dayCardService
            .findOne(dayCardId)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(findOneUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));

    it('should call findAll and return a list of day cards', () => {
        dayCardService.findAll(dayCardIds)
            .subscribe((response: DayCardResource[]) =>
                expect(response).toEqual(mockDayCardList));

        request = httpMock.expectOne(findAll);
        request.flush(mockDayCardListResource);
    });

    it('should call create and return a schedule with newly created day card', waitForAsync(() => {
        dayCardService
            .create(taskId, MOCK_SAVE_DAY_CARD_A, version)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toEqual(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(createUrl);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call update and return a updated day card', waitForAsync(() => {
        dayCardService
            .update(dayCardId, MOCK_SAVE_DAY_CARD_A, version)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(updateUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));

    it('should call delete and return a schedule without newly deleted day card', waitForAsync(() => {
        dayCardService
            .delete(dayCardId, version)
            .subscribe((response: TaskScheduleResource) =>
                expect(response).toEqual(MOCK_TASK_SCHEDULE_RESOURCE_A));

        request = httpMock.expectOne(deleteOneUrl);
        request.flush(MOCK_TASK_SCHEDULE_RESOURCE_A);
    }));

    it('should call deleteAll and return an AbstractItemResource', waitForAsync(() => {
        const responseBody = new AbstractItemsResource<TaskScheduleResource>([MOCK_TASK_SCHEDULE_RESOURCE_A]);

        dayCardService
            .deleteAll(projectId, deleteAllItemsResource)
            .subscribe((response: AbstractItemsResource<TaskScheduleResource>) =>
                expect(response).toEqual(responseBody));

        request = httpMock.expectOne(deleteAllUrl);
        request.flush(responseBody);
    }));

    it('should call cancel and return a updated day card', waitForAsync(() => {
        dayCardService
            .cancel(dayCardId, 'BAD_WEATHER', version)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(cancelOneUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));

    it('should call cancelAll and return a updated day card', waitForAsync(() => {
        dayCardService
            .cancelAll(dayCardList, 'BAD_WEATHER')
            .subscribe((response: DayCardResource[]) =>
                expect(response).toEqual(mockDayCardList));

        request = httpMock.expectOne(cancelAllUrl);
        request.flush(mockDayCardListResource);
    }));

    it('should call approve and return a updated day card', waitForAsync(() => {
        dayCardService
            .approve(dayCardId, version)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(approveOneUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));

    it('should call approveAll and return a updated day card', waitForAsync(() => {
        dayCardService
            .approveAll(dayCardList)
            .subscribe((response: DayCardResource[]) =>
                expect(response).toEqual(mockDayCardList));

        request = httpMock.expectOne(approveAllUrl);
        request.flush(mockDayCardListResource);
    }));

    it('should call complete and return a updated day card', waitForAsync(() => {
        dayCardService
            .complete(dayCardId, version)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(completeOneUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));

    it('should call completeAll and return a updated day card', waitForAsync(() => {
        dayCardService
            .completeAll(dayCardList)
            .subscribe((response: DayCardResource[]) =>
                expect(response).toEqual(mockDayCardList));

        request = httpMock.expectOne(completeAllUrl);
        request.flush(mockDayCardListResource);
    }));

    it('should call reset and return a updated day card', waitForAsync(() => {
        dayCardService
            .reset(dayCardId, version)
            .subscribe((response: DayCardResource) =>
                expect(response).toEqual(MOCK_DAY_CARD_RESOURCE_A));

        request = httpMock.expectOne(resetUrl);
        request.flush(MOCK_DAY_CARD_RESOURCE_A);
    }));
});
