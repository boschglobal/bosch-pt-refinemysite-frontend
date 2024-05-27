/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {JobCardStatusEnum} from '../../../../project/project-common/enums/job-card-status.enum';
import {JobCardStatusComponent} from './job-card-status.component';
import {JobCardStatusTestComponent} from './job-card-status.test.component';

describe('Job Card Status', () => {
    let testHostComponent: JobCardStatusTestComponent;
    let fixture: ComponentFixture<JobCardStatusTestComponent>;
    let de: DebugElement;

    const jobCardStatusComponentSelector = 'ss-job-card-status';
    const dataAutomationJobCardStatusFailedElementSelector = '[data-automation="card-status-failed"]';
    const dataAutomationJobCardStatusRunningElementSelector = '[data-automation="card-status-running"]';
    const dataAutomationJobCardStatusCompletedElementSelector = '[data-automation="card-status-completed"]';
    const dataAutomationJobCardStatusPartlyCompletedElementSelector = '[data-automation="card-status-partly-completed"]';

    const getElement = (selector: string) => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            NoopAnimationsModule,
        ],
        declarations: [
            JobCardStatusComponent,
            JobCardStatusTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobCardStatusTestComponent);
        testHostComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(jobCardStatusComponentSelector));

        fixture.detectChanges();
    });

    it('should toggle icons visibility accordingly to the current status', fakeAsync(() => {
        testHostComponent.status = JobCardStatusEnum.Failed;
        fixture.detectChanges();
        tick(0);
        expect(getElement(dataAutomationJobCardStatusFailedElementSelector)).toBeDefined();
        expect(getElement(dataAutomationJobCardStatusRunningElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusCompletedElementSelector)).toBeUndefined();

        testHostComponent.status = JobCardStatusEnum.Running;
        fixture.detectChanges();
        tick(0);
        expect(getElement(dataAutomationJobCardStatusRunningElementSelector)).toBeDefined();
        expect(getElement(dataAutomationJobCardStatusFailedElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusCompletedElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusPartlyCompletedElementSelector)).toBeUndefined();

        testHostComponent.status = JobCardStatusEnum.Completed;
        fixture.detectChanges();
        tick(0);
        expect(getElement(dataAutomationJobCardStatusCompletedElementSelector)).toBeDefined();
        expect(getElement(dataAutomationJobCardStatusRunningElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusFailedElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusPartlyCompletedElementSelector)).toBeUndefined();

        testHostComponent.status = JobCardStatusEnum.PartlyCompleted;
        fixture.detectChanges();
        tick(0);
        expect(getElement(dataAutomationJobCardStatusPartlyCompletedElementSelector)).toBeDefined();
        expect(getElement(dataAutomationJobCardStatusCompletedElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusRunningElementSelector)).toBeUndefined();
        expect(getElement(dataAutomationJobCardStatusFailedElementSelector)).toBeUndefined();
    }));
});
