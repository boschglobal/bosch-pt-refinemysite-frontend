/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {StoreModule} from '@ngrx/store';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {of} from 'rxjs';

import {MOCK_PARTICIPANT} from '../../../../../../test/mocks/participants';
import {
    MOCK_PROJECT_1,
    MOCK_PROJECT_2,
    MOCK_PROJECT_PICTURE,
    MOCK_PROJECT_PICTURE_1
} from '../../../../../../test/mocks/projects';
import {BlobServiceStub} from '../../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {REDUCER} from '../../../../../app.reducers';
import {GenericBannerComponent} from '../../../../../shared/misc/presentationals/generic-banner/generic-banner.component';
import {BlobService} from '../../../../../shared/rest/services/blob.service';
import {BackgroundImageDirective} from '../../../../../shared/ui/directives/background-image.directive';
import {ButtonLinkComponent} from '../../../../../shared/ui/links/button-link/button-link.component';
import {ProjectCategoryEnumHelper} from '../../../../project-common/enums/project-category.enum';
import {ProjectCardComponent} from '../../../../project-common/presentationals/project-card/project-card.component';
import {ProjectCardContactComponent} from '../../../../project-common/presentationals/project-card-contact/project-card-contact.component';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {ProjectInformationContentComponent} from './project-information-content.component';

describe('Project Information Content Component', () => {
    let fixture: ComponentFixture<ProjectInformationContentComponent>;
    let comp: ProjectInformationContentComponent;
    let de: DebugElement;
    let router: Router;

    const dataAutomationPanelRowSelector = '[data-automation="project-card-row"]';

    const getRows = () => de.queryAll(By.css(dataAutomationPanelRowSelector));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            RouterTestingModule,
            TranslateModule.forRoot(),
            StoreModule.forRoot(REDUCER),
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                },
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            ProjectUrlRetriever,
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            BackgroundImageDirective,
            ButtonLinkComponent,
            GenericBannerComponent,
            ProjectCardComponent,
            ProjectCardContactComponent,
            ProjectInformationContentComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectInformationContentComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        router = TestBed.inject<Router>(Router);
        comp.project = MOCK_PROJECT_PICTURE_1;
        comp.hasEditPermission = true;
        fixture.detectChanges();
    });

    it('should retrieve null for category when none is defined', () => {
        const categoryIndex = 3;

        expect(comp.projectDetailsInformation[categoryIndex].description).toBeNull();
    });

    it('should get the right picture href', () => {
        comp.project = MOCK_PROJECT_PICTURE;

        expect(comp.getProjectPicture).toBe(MOCK_PROJECT_PICTURE._embedded.projectPicture._links.small.href);

        comp.project = MOCK_PROJECT_2;

        expect(comp.getProjectPicture).toBeNull();
    });

    it('should get the right category label', () => {
        const categoryIndex = 3;

        comp.project = MOCK_PROJECT_1;
        comp.ngOnInit();

        expect(comp.projectDetailsInformation[categoryIndex].description)
            .toBe(ProjectCategoryEnumHelper.getLabelByKey(MOCK_PROJECT_1.category));

        comp.project = MOCK_PROJECT_2;
        comp.ngOnInit();

        expect(comp.projectDetailsInformation[categoryIndex].description).toBeNull();
    });

    it('should render one row for each project detail information', () => {
        expect(getRows().length).toBe(comp.projectDetailsInformation.length);
    });

    it('should navigate when contact clicked', () => {
        const expectedURL = ProjectUrlRetriever.getProjectParticipantsProfileUrl(MOCK_PROJECT_PICTURE_1.id, MOCK_PARTICIPANT.id);
        spyOn(router, 'navigateByUrl').and.callThrough();

        comp.navigateToUserProfile(MOCK_PARTICIPANT);

        expect(router.navigateByUrl).toHaveBeenCalledWith(expectedURL);
    });
});
