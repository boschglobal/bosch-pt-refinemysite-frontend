/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
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
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {
    MOCK_ACTIVITY_1,
    MOCK_ACTIVITY_2
} from '../../../../../../../test/mocks/activities';
import {BlobServiceMock} from '../../../../../../../test/mocks/blob.service.mock';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {BlobService} from '../../../../../../shared/rest/services/blob.service';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../../project-routing/project-route.paths';
import {ProjectTaskActivitiesListModel} from '../../containers/task-activities-list/project-task-activities-list.model';
import {
    CSS_PROJECT_TASK_ACTIVITY_CARD_HAS_MARKER,
    ProjectTaskActivityCardComponent,
    RESOURCE_ANCHOR
} from './project-task-activity-card.component';

describe('Project Task Activity Card Component', () => {
    let fixture: ComponentFixture<ProjectTaskActivityCardComponent>;
    let comp: ProjectTaskActivityCardComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationThumbnailSelector = '[data-automation=thumbnail-gallery-li-0]';
    const dataAutomationActivityCardSelector = '[data-automation="activity-card"]';

    const getElement = (selector: string) => el.querySelector((selector));

    const activity: ProjectTaskActivitiesListModel = new ProjectTaskActivitiesListModel(MOCK_ACTIVITY_1);
    const projectId = 123;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [RouterTestingModule],
        declarations: [
            ProjectTaskActivityCardComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: projectId}),
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: ROUTE_PARAM_PROJECT_ID,
                                }],
                            },
                        },
                    },
                },
            },
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
            HttpClient,
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTaskActivityCardComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
    });

    it('should set common projectTaskActivityCardModel', () => {
        expect(comp.projectTaskActivityCardModel).toBeUndefined();

        comp.activity = activity;

        expect(comp.projectTaskActivityCardModel).toBeDefined();
    });

    it('should check if param is object', () => {
        expect(comp.isObject('a')).toBe(false);
    });

    it('should check if param is anchor', () => {
        expect(comp.isAnchor(RESOURCE_ANCHOR)).toBe(true);
    });

    it('should render the card with attachment gallery', () => {
        comp.activity = activity;
        fixture.detectChanges();

        expect(getElement(dataAutomationThumbnailSelector)).toBeDefined();
    });

    it('should render the card without attachment gallery', () => {
        const activityWithoutEmbedded = new ProjectTaskActivitiesListModel(MOCK_ACTIVITY_1);
        activityWithoutEmbedded.activity._embedded = null;

        comp.activity = activityWithoutEmbedded;
        fixture.detectChanges();

        expect(getElement(dataAutomationThumbnailSelector)).toBeNull();
    });

    it('should be called with the correct params', () => {
        const attachment: AttachmentResource = MOCK_ACTIVITY_2._embedded.attachments;

        spyOn(comp, 'onClickThumbnailEvent').and.callThrough();

        comp.onClickThumbnailEvent(attachment);

        expect(comp.onClickThumbnailEvent).toHaveBeenCalledWith(attachment);
    });

    it('should render news CSS when activity is new', () => {
        comp.activity = new ProjectTaskActivitiesListModel(MOCK_ACTIVITY_1, true);
        fixture.detectChanges();

        expect(getElement(dataAutomationActivityCardSelector).classList).toContain(CSS_PROJECT_TASK_ACTIVITY_CARD_HAS_MARKER);
    });

    it('should not render news CSS when activity is not new', () => {
        comp.activity = new ProjectTaskActivitiesListModel(MOCK_ACTIVITY_1);
        fixture.detectChanges();

        expect(getElement(dataAutomationActivityCardSelector).classList).not.toContain(CSS_PROJECT_TASK_ACTIVITY_CARD_HAS_MARKER);
    });
});
