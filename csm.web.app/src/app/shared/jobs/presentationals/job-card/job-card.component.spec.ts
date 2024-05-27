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
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {JOB_MOCK_1} from '../../../../../test/mocks/jobs';
import {DateHelperStub} from '../../../../../test/stubs/date.helper.stub';
import {JobCard} from '../../../../project/project-common/models/job-card/job-card';
import {BlobExport} from '../../../misc/api/datatypes/blob-export.datatype';
import {BlobService} from '../../../rest/services/blob.service';
import {DateHelper} from '../../../ui/dates/date.helper.service';
import {UIModule} from '../../../ui/ui.module';
import {JobCardComponent} from './job-card.component';
import {JobCardTestComponent} from './job-card.test.component';

describe('Job Card Component', () => {
    let testHostComponent: JobCardTestComponent;
    let component: JobCardComponent;
    let debugElement: DebugElement;
    let fixture: ComponentFixture<JobCardTestComponent>;
    let router: Router;

    const blobServiceMock = mock(BlobService);

    const getBlobSubject = new Subject();

    const componentSelector = 'ss-job-card';
    const dataAutomationCardSelector = '[data-automation="job-card"]';
    const dataAutomationCardTitleSelector = '[data-automation="job-card-title"]';
    const dataAutomationCardFileNameSelector = '[data-automation="job-card-file-name"]';
    const dataAutomationCardDateSelector = '[data-automation="job-card-date"]';
    const dataAutomationCardProjectNameSelector = '[data-automation="job-card-project-name"]';
    const dataAutomationCardDownloadButtonSelector = '[data-automation="job-card-download-button"]';

    const card: JobCard = JobCard.fromJobResource(JOB_MOCK_1);

    const getElement = (selector: string): HTMLElement => debugElement.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslateModule.forRoot(),
            RouterTestingModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: BlobService,
                useFactory: () => instance(blobServiceMock),
            },
            {
                provide: DateHelper,
                useValue: new DateHelperStub(),
            },
        ],
        declarations: [
            JobCardComponent,
            JobCardTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobCardTestComponent);
        testHostComponent = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.css(componentSelector));
        component = debugElement.componentInstance;
        router = TestBed.inject(Router);

        when(blobServiceMock.getBlob(card.data.artifactUrl)).thenReturn(getBlobSubject);

        testHostComponent.card = card;

        fixture.detectChanges();
    });

    it('should display card title', () => {
        expect(getElement(dataAutomationCardTitleSelector).textContent).toBe(card.data.title);
    });

    it('should display card date', () => {
        expect(getElement(dataAutomationCardDateSelector).textContent).toBe(card.lastModifiedDate);
    });

    it('should display card project name', () => {
        expect(getElement(dataAutomationCardProjectNameSelector).textContent).toBe(card.data.projectName);
    });

    it('should display card file name when it exits', () => {
        const newCard = {...card, data: {...card.data, description: 'foo.pdf'}};

        testHostComponent.card = newCard;

        fixture.detectChanges();

        expect(getElement(dataAutomationCardFileNameSelector).textContent).toBe(newCard.data.description);
    });

    it('should not display card file name when it does not exit', () => {
        testHostComponent.card = {...card, data: {...card.data, fileName: undefined}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardFileNameSelector)).not.toBeDefined();
    });

    it('should add CSS modifier to card when card was not seen', () => {
        testHostComponent.card = {...card, data: {...card.data, read: false}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardSelector).classList).toContain('ss-job-card--not-seen');
    });

    it('should not add CSS modifier to card when card was seen', () => {
        testHostComponent.card = {...card, data: {...card.data, read: true}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardSelector).classList).not.toContain('ss-job-card--not-seen');
    });

    it('should add CSS clickable modifier to card when card has a reroute url', () => {
        testHostComponent.card = {...card, data: {...card.data, rerouteUrl: 'project/foo/dashboard'}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardSelector).classList).toContain('ss-job-card--clickable');
    });

    it('should not add CSS clickable modifier to card when card has no reroute url', () => {
        testHostComponent.card = {...card, data: {...card.data, rerouteUrl: undefined}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardSelector).classList).not.toContain('ss-job-card--clickable');
    });

    it('should display download button when there is an artifact url', () => {
        testHostComponent.card = {...card, data: {...card.data, artifactUrl: 'https://app.bosch-refinemysite.com/artifact.jpg'}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardDownloadButtonSelector)).toBeDefined();
    });

    it('should not display download button when there is not an artifact url', () => {
        testHostComponent.card = {...card, data: {...card.data, artifactUrl: undefined}};

        fixture.detectChanges();

        expect(getElement(dataAutomationCardDownloadButtonSelector)).not.toBeDefined();
    });

    it('should emmit downloadTriggered when handleDownloadFinished is called', () => {
        spyOn(component.downloadTriggered, 'emit').and.callThrough();

        component.handleDownloadFinished();

        expect(component.downloadTriggered.emit).toHaveBeenCalledWith(card.id);
    });

    it('should return a function with a observable that emits a blob export when calling handleDownload', () => {
        const blob = new Blob();
        const expectedResult = new BlobExport(blob, card.data.fileName);

        component.handleDownload()()
            .subscribe(blobResult => expect(blobResult).toEqual(expectedResult));

        getBlobSubject.next(blob);
    });

    it('should not allow navigation when handeReroute is called if card.data.rerouteUrl is not present', () => {
        spyOn(router, 'navigate').and.callThrough();

        component.handleReroute();

        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should allow navigation when handeReroute is called if card.data.rerouteUrl is present', () => {
        const expectedResult = ['project/foo/dashboard'];
        testHostComponent.card = {...card, data: {...card.data, rerouteUrl: 'project/foo/dashboard'}};
        spyOn(router, 'navigate').and.callThrough();

        fixture.detectChanges();
        component.handleReroute();

        expect(router.navigate).toHaveBeenCalledWith(expectedResult);
    });
});
