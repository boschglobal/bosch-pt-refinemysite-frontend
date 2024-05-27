/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';

import {
    JOB_MOCK_1,
    JOB_MOCK_2,
    JOB_MOCK_7
} from '../../../../../test/mocks/jobs';
import {JobCard} from '../../../../project/project-common/models/job-card/job-card';
import {UIModule} from '../../../ui/ui.module';
import {JobCardListComponent} from './job-card-list.component';
import {JobCardListTestComponent} from './job-card-list.test.component';

describe('Job Card List Component', () => {
    let testHostComponent: JobCardListTestComponent;
    let component: JobCardListComponent;
    let debugElement: DebugElement;
    let fixture: ComponentFixture<JobCardListTestComponent>;

    const componentSelector = 'ss-job-card-list';
    const dataAutomationLoadingSelector = '[data-automation="job-card-list-loading"]';
    const dataAutomationLoadingIconSelector = '[data-automation="job-card-list-loader-icon"]';
    const dataAutomationLoadingLabelSelector = '[data-automation="job-card-list-loading"]';
    const dataAutomationNoItemsEmptyListSelector = '[data-automation="job-card-list-empty"]';
    const dataAutomationNoItemsServiceUnavailableSelector = '[data-automation="job-card-list-service-unavailable"]';
    const getDataAutomationJobCardSelector = (id: string) => `[data-automation="ss-job-card-list-item-${id}"]`;

    const getElement = (selector: string): HTMLElement => debugElement.query(By.css(selector))?.nativeElement;

    const jobResources = [JOB_MOCK_1, JOB_MOCK_2, JOB_MOCK_7];

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslateModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [],
        declarations: [
            JobCardListComponent,
            JobCardListTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobCardListTestComponent);
        testHostComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css(componentSelector));
        component = debugElement.componentInstance;

        testHostComponent.jobs = [];

        fixture.detectChanges();
    });

    it('should display loading elements when isLoading is true', () => {
        testHostComponent.isLoading = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationLoadingSelector)).toBeDefined();
        expect(getElement(dataAutomationLoadingIconSelector)).toBeDefined();
        expect(getElement(dataAutomationLoadingLabelSelector)).toBeDefined();
    });

    it('should not display loading elements when isLoading is false', () => {
        testHostComponent.isLoading = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationLoadingSelector)).not.toBeDefined();
        expect(getElement(dataAutomationLoadingIconSelector)).not.toBeDefined();
        expect(getElement(dataAutomationLoadingLabelSelector)).not.toBeDefined();
    });

    it('should display no items component with empty list data when job list is empty and job service is available', () => {
        testHostComponent.jobs = [];
        testHostComponent.jobServiceUnavailable = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsEmptyListSelector)).toBeDefined();
    });

    it('should not display no items component with empty list data when job list is not empty and job service is available', () => {
        testHostComponent.jobs = jobResources;
        testHostComponent.jobServiceUnavailable = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsEmptyListSelector)).not.toBeDefined();
    });

    it('should not display no items component with empty list data when job list is empty and job service is unavailable', () => {
        testHostComponent.jobs = [];
        testHostComponent.jobServiceUnavailable = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsEmptyListSelector)).not.toBeDefined();
    });

    it('should not display no items component with empty list data when job list is not empty and job service is unavailable', () => {
        testHostComponent.jobs = jobResources;
        testHostComponent.jobServiceUnavailable = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsEmptyListSelector)).not.toBeDefined();
    });

    it('should display no items component with service unavailable data when job service is unavailable and job list is empty', () => {
        testHostComponent.jobs = [];
        testHostComponent.jobServiceUnavailable = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsServiceUnavailableSelector)).toBeDefined();
    });

    it('should not display no items component with service unavailable data when job service is available and job list is empty', () => {
        testHostComponent.jobs = [];
        testHostComponent.jobServiceUnavailable = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsServiceUnavailableSelector)).not.toBeDefined();
    });

    it('should not display no items component with service unavailable data when job service is unavailable ' +
        'and job list is not empty', () => {
        testHostComponent.jobs = jobResources;
        testHostComponent.jobServiceUnavailable = false;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsServiceUnavailableSelector)).not.toBeDefined();
    });

    it('should not display no items component with service unavailable data when job service is available ' +
        'and job list is not empty', () => {
        testHostComponent.jobs = jobResources;
        testHostComponent.jobServiceUnavailable = true;

        fixture.detectChanges();

        expect(getElement(dataAutomationNoItemsServiceUnavailableSelector)).not.toBeDefined();
    });

    it('should display job cards', () => {
        testHostComponent.jobs = jobResources;

        fixture.detectChanges();

        jobResources.forEach((job) =>
            expect(getElement(getDataAutomationJobCardSelector(job.id))).toBeDefined());
    });

    it('should parse job resources into job cards', () => {
        const expectedResult = jobResources.map(job => JobCard.fromJobResource(job));

        testHostComponent.jobs = jobResources;

        fixture.detectChanges();

        expect(component.cards).toEqual(expectedResult);
    });

    it('should emmit job card click when handleCardClick is called', () => {
        const event = new Event('click');
        spyOn(component.jobCardClicked, 'emit').and.callThrough();

        component.handleCardClick(event);

        expect(component.jobCardClicked.emit).toHaveBeenCalledWith(event);
    });
});
